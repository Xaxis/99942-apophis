"use client";

import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody, BodyState } from "@/lib/types";

interface CelestialBodyMeshProps {
    body: CelestialBody;
    state: BodyState;
    isSelected: boolean;
    showLabel: boolean;
    onClick: () => void;
}

export function CelestialBodyMesh({ body, state, isSelected, showLabel, onClick }: CelestialBodyMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Scale for visibility (logarithmic scale for radius)
    const visualRadius = body.name === "Sun" ? 0.5 : Math.max(0.05, Math.log10(body.radius + 1) * 0.02);

    const scale = isSelected ? 1.5 : 1.0;
    const emissiveIntensity = isSelected ? 0.8 : hovered ? 0.5 : 0;

    return (
        <group position={state.position}>
            <mesh
                ref={meshRef}
                scale={scale}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = "auto";
                }}
            >
                <sphereGeometry args={[visualRadius, 32, 32]} />
                <meshStandardMaterial color={body.color} emissive={body.color} emissiveIntensity={emissiveIntensity} />
            </mesh>

            {/* Selection ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[visualRadius * 1.3, visualRadius * 1.5, 32]} />
                    <meshBasicMaterial color={body.color} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Label */}
            {showLabel && (
                <Html
                    position={[0, visualRadius + 0.1, 0]}
                    center
                    distanceFactor={8}
                    zIndexRange={[0, 0]}
                    style={{
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                >
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">{body.name}</div>
                </Html>
            )}
        </group>
    );
}
