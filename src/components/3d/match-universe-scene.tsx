"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/components/providers/performance-provider";
import { Sparkles, User, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SatelliteProperty {
  id: string;
  title: string;
  rent: number;
  matchScore: number;
  locality: string;
  radius: number;
  speed: number;
  angle: number;
  color: number;
}

const SAMPLE_SATELLITES: SatelliteProperty[] = [
  { id: "demo-1", title: "Powai 2 BHK Sky Suite", rent: 30000, matchScore: 96, locality: "Powai, Mumbai", radius: 5.5, speed: 0.008, angle: 0, color: 0x00f2fe },
  { id: "demo-2", title: "Whitefield 3 BHK Villa", rent: 55000, matchScore: 89, locality: "Whitefield, BLR", radius: 8.0, speed: 0.005, angle: 2.1, color: 0x7f00ff },
  { id: "demo-3", title: "Hinjewadi Smart Studio", rent: 15000, matchScore: 84, locality: "Hinjewadi, Pune", radius: 10.5, speed: 0.003, angle: 4.2, color: 0xf107a3 },
  { id: "demo-4", title: "Cyber City 2 BHK", rent: 42000, matchScore: 92, locality: "Cyber City, GGN", radius: 6.8, speed: 0.006, angle: 1.2, color: 0x00f2fe },
  { id: "demo-5", title: "Indiranagar Duplex", rent: 68000, matchScore: 95, locality: "Indiranagar, BLR", radius: 9.2, speed: 0.004, angle: 3.5, color: 0x38bdf8 },
];

export function MatchUniverseScene({ tenantName = "You" }: { tenantName?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLite } = usePerformance();
  const [activeProperty, setActiveProperty] = useState<SatelliteProperty | null>(null);

  useEffect(() => {
    if (isLite || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 16);
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
    const ambient = new THREE.AmbientLight(0x0e1838, 3.0);
    scene.add(ambient);

    const cyanPoint = new THREE.PointLight(0x00f2fe, 5, 40);
    cyanPoint.position.set(0, 4, 0);
    scene.add(cyanPoint);

    // Centerpiece: The Tenant Node ("YOU")
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    const centerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerGroup.add(centerMesh);

    // Center Pulse Ring
    const centerRingGeo = new THREE.RingGeometry(1.6, 1.8, 32);
    const centerRingMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
    centerRing.rotation.x = Math.PI / 2;
    centerGroup.add(centerRing);

    // Satellites Group & Orbital Rings
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const satellites = SAMPLE_SATELLITES;
    const satelliteMeshes: { mesh: THREE.Mesh; line: THREE.Line; data: SatelliteProperty }[] = [];

    satellites.forEach((sat) => {
      // Orbital Ring Trace
      const orbitGeo = new THREE.RingGeometry(sat.radius - 0.05, sat.radius + 0.05, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: sat.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      orbitGroup.add(orbitMesh);

      // Satellite Sphere (Property Node)
      const satGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const satMat = new THREE.MeshStandardMaterial({
        color: sat.color,
        emissive: sat.color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.userData = { satData: sat };
      orbitGroup.add(satMesh);

      // Connection Beam from Center to Satellite
      const lineMat = new THREE.LineBasicMaterial({ color: sat.color, transparent: true, opacity: 0.4 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(sat.radius, 0, 0),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      orbitGroup.add(line);

      satelliteMeshes.push({ mesh: satMesh, line, data: sat });
    });

    // Raycast on click/hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(satelliteMeshes.map((s) => s.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.satData as SatelliteProperty;
        setActiveProperty(data);
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);

    // Animation Loop
    let animationId: number;
    let isRunning = true;
    let angles = satellites.map((s) => s.angle);

    const animate = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      // Pulse center ring
      centerRing.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.15);

      // Rotate Satellites in Orbit
      satelliteMeshes.forEach((item, idx) => {
        angles[idx] += item.data.speed;
        const x = Math.cos(angles[idx]) * item.data.radius;
        const z = Math.sin(angles[idx]) * item.data.radius;
        item.mesh.position.set(x, 0, z);

        // Update connecting line geometry
        const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)];
        item.line.geometry.setFromPoints(pts);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 700;
      const h = container.clientHeight || 450;
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
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl glass-panel border border-cyan-400/30 overflow-hidden shadow-holo-md">
      {/* 3D Universe Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Top Universe Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Your Match Universe · Active Orbitals</span>
      </div>

      {/* Center Label Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 text-center">
        <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto mb-1 text-cyan-300 text-xs font-bold font-mono">
          YOU
        </div>
      </div>

      {/* Active Satellite Property Card Overlay */}
      {activeProperty && (
        <div className="absolute bottom-4 right-4 z-30 min-w-[260px] glass-panel p-4 rounded-2xl border border-cyan-400/60 shadow-holo-lg animate-scale-in">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-white/10">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              {activeProperty.locality}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40">
              ⚡ {activeProperty.matchScore}% Match
            </span>
          </div>

          <div className="font-display font-bold text-sm text-white mb-2 line-clamp-1">
            {activeProperty.title}
          </div>

          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-sm text-white">
              ₹{activeProperty.rent.toLocaleString("en-IN")}/mo
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/properties/${activeProperty.id}`)}
              className="h-7 text-xs px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold shadow-holo-sm"
            >
              View <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
