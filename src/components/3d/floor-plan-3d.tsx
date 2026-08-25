"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePerformance } from "@/components/providers/performance-provider";
import { Sparkles, Maximize2, Compass, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoomData {
  id: string;
  name: string;
  area: string;
  features: string[];
  dimensions: string;
  color: number;
  bounds: { x: number; z: number; w: number; d: number };
}

const APARTMENT_ROOMS: RoomData[] = [
  {
    id: "living",
    name: "Living & Dining Room",
    area: "26 m² (280 sq ft)",
    features: ["Floor-to-ceiling glass", "Direct balcony access", "High natural light", "Smart climate control"],
    dimensions: "6.2m × 4.2m",
    color: 0x00f2fe,
    bounds: { x: -2, z: 0, w: 4.5, d: 5.5 },
  },
  {
    id: "master",
    name: "Master Suite & Bath",
    area: "20 m² (215 sq ft)",
    features: ["Attached bath with rain shower", "Built-in wardrobe cavity", "Corner window exposure"],
    dimensions: "5.0m × 4.0m",
    color: 0x7f00ff,
    bounds: { x: 3, z: -1.5, w: 4.0, d: 4.0 },
  },
  {
    id: "bedroom2",
    name: "Guest / Office Suite",
    area: "14 m² (150 sq ft)",
    features: ["Dedicated high-speed LAN port", "Acoustic insulation", "Garden aspect"],
    dimensions: "4.0m × 3.5m",
    color: 0x3b82f6,
    bounds: { x: 3, z: 2.8, w: 4.0, d: 3.5 },
  },
  {
    id: "kitchen",
    name: "Modular Gourmet Kitchen",
    area: "11 m² (120 sq ft)",
    features: ["Granite counter island", "Piped gas line", "Utility & wash connection"],
    dimensions: "3.5m × 3.1m",
    color: 0xf107a3,
    bounds: { x: -2, z: -3.8, w: 4.5, d: 2.8 },
  },
  {
    id: "balcony",
    name: "Panoramic Deck Balcony",
    area: "8 m² (85 sq ft)",
    features: ["Skyline & lake view", "Toughened glass railing", "Planter ledge"],
    dimensions: "4.5m × 1.8m",
    color: 0x10b981,
    bounds: { x: -2, z: 3.8, w: 4.5, d: 1.8 },
  },
];

export function FloorPlan3D({ bedrooms = 2, carpetArea = 950 }: { bedrooms?: number; carpetArea?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLite } = usePerformance();
  const [selectedRoom, setSelectedRoom] = useState<RoomData>(APARTMENT_ROOMS[0]);

  useEffect(() => {
    if (isLite || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(12, 16, 16);
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
    const ambient = new THREE.AmbientLight(0x0e1838, 3.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 3.0);
    dirLight.position.set(15, 20, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x7f00ff, 4, 30);
    pointLight.position.set(-10, 10, -5);
    scene.add(pointLight);

    // Floor Base Plate Grid
    const baseGrid = new THREE.GridHelper(20, 20, 0x00f2fe, 0x152248);
    baseGrid.position.y = -0.05;
    scene.add(baseGrid);

    // Architectural Floor Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x162248,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.9,
    });

    const roomMeshes: { mesh: THREE.Mesh; line: THREE.LineSegments; room: RoomData }[] = [];

    // Construct stylized rooms
    APARTMENT_ROOMS.forEach((room) => {
      // Room floor slab
      const floorGeo = new THREE.BoxGeometry(room.bounds.w, 0.15, room.bounds.d);
      const isSelected = room.id === selectedRoom.id;
      const floorMat = new THREE.MeshStandardMaterial({
        color: isSelected ? room.color : 0x0a122c,
        emissive: room.color,
        emissiveIntensity: isSelected ? 0.6 : 0.1,
        roughness: 0.2,
      });

      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(room.bounds.x, 0.08, room.bounds.z);
      floorMesh.userData = { roomData: room };
      modelGroup.add(floorMesh);

      // Wireframe Outline
      const edges = new THREE.EdgesGeometry(floorGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: room.color,
          linewidth: 2,
          transparent: true,
          opacity: 0.8,
        })
      );
      line.position.copy(floorMesh.position);
      modelGroup.add(line);

      // Low boundary walls
      const wallHeight = 0.8;
      const wallGeo = new THREE.BoxGeometry(room.bounds.w, wallHeight, 0.1);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(room.bounds.x, wallHeight / 2, room.bounds.z - room.bounds.d / 2);
      modelGroup.add(wallMesh);

      roomMeshes.push({ mesh: floorMesh, line, room });
    });

    // Raycast room selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomMeshes.map((r) => r.mesh));

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = hit.userData.roomData as RoomData;
        setSelectedRoom(data);
      }
    };

    renderer.domElement.addEventListener("click", onPointerDown);

    // Animation Loop
    let animationId: number;
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;
      animationId = requestAnimationFrame(animate);

      // Subtle slow yaw
      modelGroup.rotation.y += 0.002;

      // Update room glow based on selection
      roomMeshes.forEach((rm) => {
        const isSel = rm.room.id === selectedRoom.id;
        (rm.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isSel ? 0.6 : 0.1;
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
      renderer.domElement.removeEventListener("click", onPointerDown);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [isLite, selectedRoom.id]);

  return (
    <div className="space-y-4">
      {/* 3D Model Explorer Canvas */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl glass-panel border border-cyan-400/30 overflow-hidden shadow-holo-md">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Model Disclaimer Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-cyan-300">
          <Info className="w-3.5 h-3.5" />
          <span>Interactive 3D Architectural Spatial Visualization</span>
        </div>

        {/* Room Switcher Pills */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {APARTMENT_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRoom.id === room.id
                  ? "bg-cyan-500 text-white shadow-holo-sm font-bold border border-cyan-400"
                  : "bg-black/60 text-white/70 hover:text-white border border-white/10"
              }`}
            >
              {room.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Room Specs Card */}
      <div className="glass-card-3d p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
          <div>
            <h4 className="font-display font-bold text-lg text-white">{selectedRoom.name}</h4>
            <div className="text-xs text-cyan-300 font-mono">Dimensions: {selectedRoom.dimensions}</div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/40 text-xs font-mono">
            {selectedRoom.area}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {selectedRoom.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/80">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
