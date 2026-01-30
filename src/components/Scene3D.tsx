"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody, BodyState } from "@/lib/types";
import { AU, SUN } from "@/lib/constants";
import { StarField } from "./scene/StarField";
import { CelestialBodyMesh } from "./scene/CelestialBodyMesh";
import { Trail } from "./scene/Trail";
import { OrbitPath } from "./scene/OrbitPath";
import { AsteroidBelt } from "./scene/AsteroidBelt";
import { calculateOrbitalState } from "@/lib/physics/orbital-mechanics";

interface Scene3DProps {
    bodies: CelestialBody[];
    bodyStates: BodyState[];
    showLabels: boolean;
    showTrails: boolean;
    showOrbits: boolean;
    selectedBodyIndex: number | null;
    onBodyClick: (index: number) => void;
}

interface BodyMeshProps {
    body: CelestialBody;
    state: BodyState;
    showLabel: boolean;
    showTrail: boolean;
    showOrbit: boolean;
    index: number;
    isSelected: boolean;
    onClick: () => void;
    bodies: CelestialBody[];
    bodyStates: BodyState[];
}

function BodyMesh({ body, state, showLabel, showTrail, showOrbit, index, isSelected, onClick, bodies, bodyStates }: BodyMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Points>(null);
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const maxTrailLength = 500;
    const [hovered, setHovered] = useState(false);

    // Convert position from meters to AU for visualization
    const positionAU = [
        state.position[0] / AU,
        state.position[2] / AU, // Swap Y and Z for better visualization
        -state.position[1] / AU,
    ];

    // Update mesh position
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.set(positionAU[0], positionAU[1], positionAU[2]);

            // Update trail
            if (index > 0) {
                // Don't show trail for Sun
                const currentPos = new THREE.Vector3(positionAU[0], positionAU[1], positionAU[2]);
                trailPositions.current.push(currentPos);

                if (trailPositions.current.length > maxTrailLength) {
                    trailPositions.current.shift();
                }

                if (trailRef.current && trailPositions.current.length > 1) {
                    const positions = new Float32Array(trailPositions.current.length * 3);
                    trailPositions.current.forEach((pos, i) => {
                        positions[i * 3] = pos.x;
                        positions[i * 3 + 1] = pos.y;
                        positions[i * 3 + 2] = pos.z;
                    });
                    trailRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                }
            }
        }
    });

    // Calculate body size for visualization
    let visualRadius = 0.01; // Default size in AU
    if (index === 0) {
        // Sun
        visualRadius = 0.05;
    } else if (body.name === "99942 Apophis") {
        // Apophis - make it visible
        visualRadius = 0.015;
    } else {
        // Planets
        visualRadius = 0.02;
    }

    return (
        <>
            <mesh
                ref={meshRef}
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
                    document.body.style.cursor = "default";
                }}
            >
                <sphereGeometry args={[visualRadius * (isSelected ? 1.5 : 1), 32, 32]} />
                {index === 0 ? (
                    <meshBasicMaterial color={body.color} />
                ) : (
                    <meshStandardMaterial
                        color={body.color}
                        emissive={isSelected || hovered ? body.color : body.color}
                        emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
                    />
                )}
            </mesh>

            {/* Selection ring */}
            {isSelected && (
                <mesh position={[positionAU[0], positionAU[1], positionAU[2]]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[visualRadius * 2, visualRadius * 2.2, 32]} />
                    <meshBasicMaterial color={body.color} transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
            )}

            {showLabel && (
                <Html position={[positionAU[0], positionAU[1] + visualRadius * 2, positionAU[2]]} zIndexRange={[0, 0]}>
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">{body.name}</div>
                </Html>
            )}

            {index > 0 && showTrail && (
                <points ref={trailRef}>
                    <bufferGeometry />
                    <pointsMaterial size={0.002} color={body.color} transparent opacity={0.6} />
                </points>
            )}

            {index > 0 &&
                showOrbit &&
                body.orbitalElements &&
                (() => {
                    // If this body has a parent (e.g., Moon orbits Earth), pass parent info to OrbitPath
                    if (body.parentBodyIndex !== undefined) {
                        const parentBody = bodies[body.parentBodyIndex];
                        const parentState = bodyStates[body.parentBodyIndex];
                        return (
                            <OrbitPath
                                elements={body.orbitalElements}
                                color={body.color}
                                parentBody={parentBody}
                                parentState={parentState}
                                isSelected={isSelected}
                                onClick={onClick}
                            />
                        );
                    }
                    return <OrbitPath elements={body.orbitalElements} color={body.color} isSelected={isSelected} onClick={onClick} />;
                })()}
        </>
    );
}

export function Scene3D({ bodies, bodyStates, showLabels, showTrails, showOrbits, selectedBodyIndex, onBodyClick }: Scene3DProps) {
    return (
        <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
            <color attach="background" args={["#000000"]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} />

            <StarField />
            <AsteroidBelt />

            {bodies.map((body, index) => (
                <BodyMesh
                    key={body.name}
                    body={body}
                    state={bodyStates[index] || { position: [0, 0, 0], velocity: [0, 0, 0] }}
                    showLabel={showLabels}
                    showTrail={showTrails}
                    showOrbit={showOrbits}
                    index={index}
                    isSelected={selectedBodyIndex === index}
                    onClick={() => onBodyClick(index)}
                    bodies={bodies}
                    bodyStates={bodyStates}
                />
            ))}

            <OrbitControls enableDamping dampingFactor={0.05} minDistance={0.5} maxDistance={100} />
        </Canvas>
    );
}
