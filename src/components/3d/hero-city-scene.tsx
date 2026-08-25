"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/components/providers/performance-provider";
import { Sparkles, MapPin, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloorInfo {
  floor: number;
  type: string;
  rent: number;
  matchScore: number;
  locality: string;
  status: string;
  propertyId: string;
}

const FLOORS_DATA: FloorInfo[] = [
  { floor: 16, type: "3 BHK Penthouse", rent: 58000, matchScore: 98, locality: "Powai, Mumbai", status: "Available", propertyId: "demo-1" },
  { floor: 12, type: "2 BHK Sky Suite", rent: 32000, matchScore: 94, locality: "Powai, Mumbai", status: "Available", propertyId: "demo-1" },
  { floor: 8, type: "2 BHK Executive", rent: 29000, matchScore: 91, locality: "Powai, Mumbai", status: "Available", propertyId: "demo-1" },
  { floor: 4, type: "1.5 BHK Smart", rent: 24000, matchScore: 88, locality: "Powai, Mumbai", status: "Available", propertyId: "demo-3" },
  { floor: 1, type: "Studio Garden", rent: 18000, matchScore: 85, locality: "Powai, Mumbai", status: "Available", propertyId: "demo-3" },
];

export function HeroCityScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLite, isUltra } = usePerformance();
  const [hoveredFloor, setHoveredFloor] = useState<FloorInfo | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isLite || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 26);
    camera.lookAt(0, 4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isLite;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0a1535, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 3.5);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0x7f00ff, 4, 60);
    purpleLight.position.set(-15, 12, -10);
    scene.add(purpleLight);

    const cyanPoint = new THREE.PointLight(0x00f2fe, 5, 40);
    cyanPoint.position.set(10, 10, 15);
    scene.add(cyanPoint);

    // Holographic Base Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f2fe, 0x1a2652);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Base Circular Hologram Ring
    const ringGeo = new THREE.RingGeometry(12, 12.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.02;
    scene.add(ringMesh);

    // City & Main Building Group
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Materials
    const darkBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x0c132c,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x060c20,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x162a56,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.9,
      reflectivity: 0.9,
      clearcoat: 1.0,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.2,
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Surroundings / Miniature City Skyline
    const buildingCoords = [
      { x: -7, z: -6, w: 2.4, h: 7, d: 2.4 },
      { x: -5, z: 5, w: 2.2, h: 5.5, d: 2.2 },
      { x: 6, z: -5, w: 2.6, h: 8, d: 2.6 },
      { x: 7, z: 4, w: 2.5, h: 6, d: 2.5 },
      { x: -8, z: 0, w: 2.0, h: 4.5, d: 2.0 },
      { x: 0, z: -8, w: 3.0, h: 6.5, d: 2.5 },
      { x: 3, z: 8, w: 2.2, h: 4.0, d: 2.2 },
    ];

    buildingCoords.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, darkBuildingMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      cityGroup.add(mesh);

      // Edge wireframe for holographic aesthetic
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.25 })
      );
      line.position.copy(mesh.position);
      cityGroup.add(line);
    });

    // MAIN INTERACTIVE TOWER (Centerpiece)
    const towerFloors = 18;
    const floorMeshes: { mesh: THREE.Mesh; line: THREE.LineSegments; floorIndex: number }[] = [];
    const floorHeight = 0.65;
    const towerWidth = 3.6;
    const towerDepth = 3.6;

    for (let f = 0; f < towerFloors; f++) {
      const geo = new THREE.BoxGeometry(towerWidth, floorHeight * 0.85, towerDepth);
      const isAvailableFloor = FLOORS_DATA.some((fd) => fd.floor === f + 1);
      const mat = isAvailableFloor ? glassMat.clone() : darkBuildingMat;

      if (isAvailableFloor) {
        (mat as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.35;
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, f * floorHeight + floorHeight / 2 + 0.1, 0);
      mesh.userData = { floorNumber: f + 1 };
      cityGroup.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: isAvailableFloor ? 0x00f2fe : 0x4a5d8f,
          transparent: true,
          opacity: isAvailableFloor ? 0.8 : 0.2,
        })
      );
      line.position.copy(mesh.position);
      cityGroup.add(line);

      floorMeshes.push({ mesh, line, floorIndex: f + 1 });
    }

    // Glowing AI Scanning Ring around center tower
    const scanRingGeo = new THREE.RingGeometry(3.0, 3.2, 32);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.y = 2;
    cityGroup.add(scanRing);

    // AI Beacons / Match Dots
    const beaconGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, towerFloors * floorHeight + 1.2, 0);
    cityGroup.add(beacon);

    // Raycasting for Floor Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHoveredIndex: number | null = null;

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePos({ x: event.clientX, y: event.clientY });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshes.map((fm) => fm.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const floorNum = hit.userData.floorNumber as number;
        const matchingData = FLOORS_DATA.find((fd) => fd.floor === floorNum) || {
          floor: floorNum,
          type: `${floorNum % 2 === 0 ? 2 : 1} BHK Premium`,
          rent: 22000 + floorNum * 1200,
          matchScore: 80 + (floorNum % 15),
          locality: "Powai, Mumbai",
          status: "Occupied",
          propertyId: "demo-1",
        };

        if (currentHoveredIndex !== floorNum) {
          currentHoveredIndex = floorNum;
          setHoveredFloor(matchingData);

          // Reset all and illuminate this one
          floorMeshes.forEach((fm) => {
            if (fm.floorIndex === floorNum) {
              fm.mesh.material = highlightMat;
              fm.line.material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
            } else {
              const isAvail = FLOORS_DATA.some((fd) => fd.floor === fm.floorIndex);
              fm.mesh.material = isAvail ? glassMat : darkBuildingMat;
              fm.line.material = new THREE.LineBasicMaterial({
                color: isAvail ? 0x00f2fe : 0x4a5d8f,
                transparent: true,
                opacity: isAvail ? 0.7 : 0.2,
              });
            }
          });
        }
      } else {
        if (currentHoveredIndex !== null) {
          currentHoveredIndex = null;
          setHoveredFloor(null);
          floorMeshes.forEach((fm) => {
            const isAvail = FLOORS_DATA.some((fd) => fd.floor === fm.floorIndex);
            fm.mesh.material = isAvail ? glassMat : darkBuildingMat;
            fm.line.material = new THREE.LineBasicMaterial({
              color: isAvail ? 0x00f2fe : 0x4a5d8f,
              transparent: true,
              opacity: isAvail ? 0.7 : 0.2,
            });
          });
        }
      }
    };

    const onClick = () => {
      if (hoveredFloor) {
        router.push(`/properties/${hoveredFloor.propertyId}`);
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    // Animation Loop
    let animationId: number;
    let isRunning = true;
    let scanDirection = 1;

    const animate = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      // Slow rotation of city
      cityGroup.rotation.y += 0.003;

      // Scan ring oscillation
      scanRing.position.y += 0.05 * scanDirection;
      if (scanRing.position.y > towerFloors * floorHeight) {
        scanDirection = -1;
      } else if (scanRing.position.y < 0.5) {
        scanDirection = 1;
      }
      scanRing.rotation.z += 0.02;

      // Beacon pulse
      beacon.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("mousemove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      scene.clear();
      renderer.dispose();
    };
  }, [isLite, router]);

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[620px] flex items-center justify-center">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Floating Holographic Inspection HUD */}
      {hoveredFloor && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 animate-scale-in"
          style={{
            left: "50%",
            top: "35%",
          }}
        >
          <div className="glass-panel p-4 rounded-2xl border border-cyan-400/60 shadow-holo-lg min-w-[240px]">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Building2 className="w-3.5 h-3.5" />
                Floor {hoveredFloor.floor}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-400/40">
                ⚡ {hoveredFloor.matchScore}% Match
              </div>
            </div>

            <div className="font-display font-bold text-sm text-white mb-1">
              {hoveredFloor.type}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {hoveredFloor.locality}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="font-display font-bold text-base text-white">
                ₹{hoveredFloor.rent.toLocaleString("en-IN")}
                <span className="text-[10px] text-muted-foreground font-normal">/mo</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                Click to explore <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spatial HUD overlay badge */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15 text-xs text-white/80">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[11px]">Interactive 3D Architectural Model · Hover to inspect units</span>
      </div>
    </div>
  );
}
