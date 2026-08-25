"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/components/providers/performance-provider";
import { MapPin, Building2, Sparkles, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapPropertyPin {
  id: string;
  title: string;
  rent: number;
  matchScore: number;
  locality: string;
  city: string;
  bedrooms: number;
  x: number;
  z: number;
  height: number;
}

const SAMPLE_MAP_PINS: MapPropertyPin[] = [
  { id: "demo-1", title: "Modern 2 BHK Skyline View", rent: 30000, matchScore: 94, locality: "Powai", city: "Mumbai", bedrooms: 2, x: -6, z: -4, height: 4.5 },
  { id: "demo-2", title: "Spacious 3 BHK Luxury Villa", rent: 55000, matchScore: 89, locality: "Whitefield", city: "Bangalore", bedrooms: 3, x: 5, z: 4, height: 6.2 },
  { id: "demo-3", title: "Smart Studio Near IT Hub", rent: 15000, matchScore: 82, locality: "Hinjewadi", city: "Pune", bedrooms: 1, x: -3, z: 5, height: 3.2 },
  { id: "demo-4", title: "Cyber City 2 BHK Executive", rent: 42000, matchScore: 92, locality: "Cyber City", city: "Gurgaon", bedrooms: 2, x: 4, z: -6, height: 5.4 },
  { id: "demo-5", title: "Indiranagar Duplex Penthouse", rent: 68000, matchScore: 96, locality: "Indiranagar", city: "Bangalore", bedrooms: 3, x: 1, z: 2, height: 7.0 },
  { id: "demo-6", title: "Bandra Seafront Apartment", rent: 75000, matchScore: 91, locality: "Bandra", city: "Mumbai", bedrooms: 2, x: -7, z: 1, height: 6.5 },
];

export function HolographicMapScene({
  properties = [],
  selectedCity = "All Metros",
}: {
  properties?: any[];
  selectedCity?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLite } = usePerformance();
  const [selectedPin, setSelectedPin] = useState<MapPropertyPin | null>(null);

  useEffect(() => {
    if (isLite || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0c1535, 3.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 4.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const violetLight = new THREE.PointLight(0x7f00ff, 4, 40);
    violetLight.position.set(-10, 8, -8);
    scene.add(violetLight);

    // Map Base Hologram Grid
    const grid = new THREE.GridHelper(30, 30, 0x00f2fe, 0x142045);
    grid.position.y = -0.05;
    scene.add(grid);

    // Radial Scanning Wave Ring
    const waveGeo = new THREE.RingGeometry(0.1, 14, 64);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = Math.PI / 2;
    waveMesh.position.y = 0.02;
    scene.add(waveMesh);

    // Map Towers / Pins Group
    const towersGroup = new THREE.Group();
    scene.add(towersGroup);

    const towerGeo = new THREE.CylinderGeometry(0.4, 0.5, 1, 16);
    const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);

    const pinsToRender = SAMPLE_MAP_PINS;
    const pinObjects: { mesh: THREE.Mesh; beacon: THREE.Mesh; data: MapPropertyPin }[] = [];

    pinsToRender.forEach((pin) => {
      // Cylinder Tower
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0a1432,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(towerGeo, mat);
      mesh.scale.set(1, pin.height, 1);
      mesh.position.set(pin.x, pin.height / 2, pin.z);
      mesh.userData = { pinData: pin };
      towersGroup.add(mesh);

      // Top Floating Beacon
      const beaconMat = new THREE.MeshBasicMaterial({
        color: pin.matchScore >= 90 ? 0x00f2fe : 0x7f00ff,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(pin.x, pin.height + 0.4, pin.z);
      towersGroup.add(beacon);

      // Wireframe
      const edges = new THREE.EdgesGeometry(towerGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.5 })
      );
      line.scale.copy(mesh.scale);
      line.position.copy(mesh.position);
      towersGroup.add(line);

      pinObjects.push({ mesh, beacon, data: pin });
    });

    // Raycasting for Pin Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinObjects.map((p) => p.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.pinData as MapPropertyPin;
        setSelectedPin(data);
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);

    // Animation Loop
    let animationId: number;
    let isRunning = true;
    let pulseTime = 0;

    const animate = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      pulseTime += 0.03;
      towersGroup.rotation.y += 0.0015;

      // Animate top beacons
      pinObjects.forEach((p, idx) => {
        p.beacon.position.y = p.data.height + 0.4 + Math.sin(pulseTime + idx) * 0.15;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [isLite]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden glass-panel border border-cyan-400/30 shadow-holo-md">
      {/* Three.js Map Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-xl border border-white/15 text-xs text-white font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Spatial Map Engine · Active Sector: {selectedCity}</span>
        </div>
      </div>

      {/* Selected Property Pin Modal / Tooltip */}
      {selectedPin && (
        <div className="absolute bottom-6 right-6 z-30 min-w-[280px] glass-panel p-4 rounded-2xl border border-cyan-400/60 shadow-holo-lg animate-scale-in">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Building2 className="w-3.5 h-3.5" />
              {selectedPin.bedrooms} BHK · {selectedPin.locality}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40">
              ⚡ {selectedPin.matchScore}% Match
            </span>
          </div>

          <div className="font-display font-bold text-sm text-white mb-1">
            {selectedPin.title}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="font-display font-bold text-base text-white">
              ₹{selectedPin.rent.toLocaleString("en-IN")}
              <span className="text-[10px] text-white/60 font-normal">/mo</span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/properties/${selectedPin.id}`)}
              className="h-8 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold shadow-holo-sm"
            >
              View Space <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
