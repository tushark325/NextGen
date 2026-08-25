"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/components/providers/performance-provider";
import { Building2, Users, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandlordBuilding {
  id: string;
  title: string;
  locality: string;
  status: "ACTIVE" | "RENTED" | "PENDING";
  rent: number;
  applications: number;
  topMatchScore: number;
  x: number;
  z: number;
  height: number;
  color: number;
}

const SAMPLE_LANDLORD_PROPS: LandlordBuilding[] = [
  { id: "demo-1", title: "Modern 2 BHK — Powai", locality: "Powai, Mumbai", status: "ACTIVE", rent: 30000, applications: 8, topMatchScore: 96, x: -3.5, z: -1, height: 4.5, color: 0x00f2fe },
  { id: "demo-2", title: "Whitefield 3 BHK Villa", locality: "Whitefield, BLR", status: "ACTIVE", rent: 55000, applications: 5, topMatchScore: 92, x: 3.5, z: 2, height: 6.0, color: 0x7f00ff },
  { id: "demo-3", title: "Hinjewadi Studio", locality: "Hinjewadi, Pune", status: "RENTED", rent: 15000, applications: 0, topMatchScore: 84, x: 0, z: -3.5, height: 3.5, color: 0x10b981 },
];

export function LandlordPropertiesScene({ properties = [] }: { properties?: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLite } = usePerformance();
  const [selectedProp, setSelectedProp] = useState<LandlordBuilding | null>(SAMPLE_LANDLORD_PROPS[0]);

  useEffect(() => {
    if (isLite || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 14, 14);
    camera.lookAt(0, 2, 0);

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

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 3.5);
    dirLight.position.set(15, 20, 15);
    scene.add(dirLight);

    const purplePoint = new THREE.PointLight(0x7f00ff, 4, 30);
    purplePoint.position.set(-10, 8, -5);
    scene.add(purplePoint);

    // Base Grid
    const grid = new THREE.GridHelper(20, 20, 0x00f2fe, 0x142045);
    grid.position.y = -0.05;
    scene.add(grid);

    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const buildingsToRender = SAMPLE_LANDLORD_PROPS;
    const buildingMeshes: { mesh: THREE.Mesh; line: THREE.LineSegments; data: LandlordBuilding }[] = [];

    buildingsToRender.forEach((b) => {
      const geo = new THREE.BoxGeometry(2.4, b.height, 2.4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0a1432,
        emissive: b.color,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.height / 2, b.z);
      mesh.userData = { propData: b };
      buildingsGroup.add(mesh);

      // Edge glow wireframe
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: b.color, transparent: true, opacity: 0.8 })
      );
      line.position.copy(mesh.position);
      buildingsGroup.add(line);

      // Status Beacon on top
      const beaconGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: b.color });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(b.x, b.height + 0.5, b.z);
      buildingsGroup.add(beacon);

      buildingMeshes.push({ mesh, line, data: b });
    });

    // Raycast on click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes.map((bm) => bm.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.propData as LandlordBuilding;
        setSelectedProp(data);
      }
    };

    renderer.domElement.addEventListener("mousemove", onPointerMove);

    // Animation Loop
    let animationId: number;
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      buildingsGroup.rotation.y += 0.002;

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
      {/* 3D Property Cluster Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Top Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
        <Building2 className="w-3.5 h-3.5" />
        <span>Property Command Matrix · Listed Assets</span>
      </div>

      {/* Selected Property Overlay */}
      {selectedProp && (
        <div className="absolute bottom-4 right-4 z-30 min-w-[280px] glass-panel p-4 rounded-2xl border border-cyan-400/60 shadow-holo-lg animate-scale-in">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              {selectedProp.locality}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40">
              {selectedProp.status}
            </span>
          </div>

          <div className="font-display font-bold text-sm text-white mb-2">
            {selectedProp.title}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <div className="text-white/50 text-[10px] font-mono">Monthly Rent</div>
              <div className="font-bold text-white font-mono">
                ₹{selectedProp.rent.toLocaleString("en-IN")}/mo
              </div>
            </div>
            <div>
              <div className="text-white/50 text-[10px] font-mono">Top Compatibility</div>
              <div className="font-bold text-cyan-300 font-mono">
                ⚡ {selectedProp.topMatchScore}% Match
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => router.push(`/properties/${selectedProp.id}`)}
            className="w-full h-8 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold shadow-holo-sm flex items-center justify-center gap-1"
          >
            Manage Listing <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
