"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

interface CameraFollowControllerProps {
    followBodyIndex: number | null;
    bodyStates: BodyState[];
    bodies: CelestialBody[];
    controlsRef: React.MutableRefObject<any>;
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
    onDoubleClick: () => void;
    bodies: CelestialBody[];
    bodyStates: BodyState[];
}

/**
 * Camera controller that follows a selected body as it moves through space.
 * This creates a body-centric reference frame where the camera moves with the body.
 */
function CameraFollowController({ followBodyIndex, bodyStates, bodies, controlsRef }: CameraFollowControllerProps) {
    const { camera } = useThree();
    const previousBodyIndexRef = useRef<number | null>(null);
    const previousBodyPositionRef = useRef<THREE.Vector3 | null>(null);

    useFrame(() => {
        const controls = controlsRef.current;

        // If no body selected or Sun selected, return to default view
        if (followBodyIndex === null || followBodyIndex === 0) {
            if (previousBodyIndexRef.current !== null && controls) {
                // Re-enable damping when we stop following
                controls.enableDamping = true;
            }
            previousBodyIndexRef.current = null;
            previousBodyPositionRef.current = null;
            return;
        }

        if (!controls) return;

        const state = bodyStates[followBodyIndex];
        if (!state) return;

        // Convert body position from meters to AU for visualization
        const bodyPositionAU = new THREE.Vector3(
            state.position[0] / AU,
            state.position[2] / AU, // Swap Y and Z for visualization
            -state.position[1] / AU
        );

        // When target changes, set initial camera position
        if (previousBodyIndexRef.current !== followBodyIndex) {
            const body = bodies[followBodyIndex];
            let cameraDistance = 0.5; // Default distance in AU

            if (body.name === "Moon") {
                cameraDistance = 0.02;
            } else if (body.name === "99942 Apophis") {
                cameraDistance = 0.1;
            } else if (body.name.includes("Ceres") || body.name.includes("Vesta") || body.name.includes("Pallas") || body.name.includes("Hygiea")) {
                cameraDistance = 0.15;
            } else if (body.name.includes("Pluto")) {
                cameraDistance = 0.25;
            } else {
                cameraDistance = 0.4;
            }

            // Disable damping to prevent OrbitControls from fighting us
            controls.enableDamping = false;

            // Set initial camera position and target
            const offset = new THREE.Vector3(cameraDistance * 0.7, cameraDistance * 0.5, cameraDistance * 0.7);
            const newCameraPosition = bodyPositionAU.clone().add(offset);

            // Set BOTH camera position AND controls target
            camera.position.copy(newCameraPosition);
            controls.target.copy(bodyPositionAU);
            controls.update();

            // Update refs for next frame
            previousBodyIndexRef.current = followBodyIndex;
            previousBodyPositionRef.current = bodyPositionAU.clone();
            return;
        }

        // Calculate how much the body has moved since last frame
        if (previousBodyPositionRef.current) {
            const bodyDelta = bodyPositionAU.clone().sub(previousBodyPositionRef.current);

            // KEY FIX: Move BOTH camera AND target by the same delta
            // This keeps the body centered while following it through space
            camera.position.add(bodyDelta);
            controls.target.add(bodyDelta);
            controls.update();
        }

        // Store current body position for next frame
        previousBodyPositionRef.current = bodyPositionAU.clone();
    });

    return null;
}

function BodyMesh({ body, state, showLabel, showTrail, showOrbit, index, isSelected, onClick, onDoubleClick, bodies, bodyStates }: BodyMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.BufferGeometry>(null);
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const maxTrailLength = 500;
    const [hovered, setHovered] = useState(false);
    const lastClickTimeRef = useRef<number>(0);

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
            if (index > 0 && showTrail) {
                // Don't show trail for Sun
                const currentPos = new THREE.Vector3(positionAU[0], positionAU[1], positionAU[2]);

                // Only add new position if it's different enough from the last one
                const lastPos = trailPositions.current[trailPositions.current.length - 1];
                if (!lastPos || currentPos.distanceTo(lastPos) > 0.0001) {
                    trailPositions.current.push(currentPos);

                    if (trailPositions.current.length > maxTrailLength) {
                        trailPositions.current.shift();
                    }

                    if (trailRef.current && trailPositions.current.length > 1) {
                        // Dispose old geometry and create new one to avoid buffer size errors
                        trailRef.current.dispose();
                        const newGeometry = new THREE.BufferGeometry().setFromPoints(trailPositions.current);
                        trailRef.current.copy(newGeometry);
                        newGeometry.dispose();
                    }
                }
            }
        }
    });

    // Calculate body size for visualization with proper scaling
    let visualRadius = 0.01; // Default size in AU
    if (index === 0) {
        // Sun - large and visible
        visualRadius = 0.05;
    } else if (body.name === "Moon") {
        // Moon - much smaller than Earth (radius ratio ~1:3.7)
        // Earth visual radius is 0.02, so Moon should be ~0.005
        visualRadius = 0.005;
    } else if (body.name === "99942 Apophis") {
        // Apophis - tiny asteroid, but make it visible
        visualRadius = 0.015;
    } else if (body.name.includes("Ceres") || body.name.includes("Vesta") || body.name.includes("Pallas") || body.name.includes("Hygiea")) {
        // Major asteroids - smaller than planets
        visualRadius = 0.012;
    } else if (body.name.includes("Pluto")) {
        // Pluto - dwarf planet, smaller than major planets
        visualRadius = 0.015;
    } else {
        // Planets - standard size
        visualRadius = 0.02;
    }

    return (
        <>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();

                    const now = Date.now();
                    const timeSinceLastClick = now - lastClickTimeRef.current;

                    if (timeSinceLastClick < 300) {
                        onDoubleClick();
                    } else {
                        onClick();
                    }

                    lastClickTimeRef.current = now;
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

            {showLabel &&
                (() => {
                    // Smart label positioning - offset labels for bodies in close proximity
                    let labelOffset = visualRadius * 2;
                    let labelXOffset = 0;

                    // Special handling for Moon - offset to the right to avoid Earth label overlap
                    if (body.name === "Moon") {
                        labelOffset = visualRadius * 3;
                        labelXOffset = 0.015; // Offset to the right
                    }

                    return (
                        <Html position={[positionAU[0] + labelXOffset, positionAU[1] + labelOffset, positionAU[2]]} zIndexRange={[0, 0]}>
                            <div
                                className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    const now = Date.now();
                                    const timeSinceLastClick = now - lastClickTimeRef.current;

                                    if (timeSinceLastClick < 300) {
                                        onDoubleClick();
                                    } else {
                                        onClick();
                                    }

                                    lastClickTimeRef.current = now;
                                }}
                            >
                                {body.name}
                            </div>
                        </Html>
                    );
                })()}

            {index > 0 && showTrail && trailPositions.current.length > 1 && (
                <line>
                    <bufferGeometry ref={trailRef} />
                    <lineBasicMaterial color={body.color} transparent opacity={0.6} linewidth={2} />
                </line>
            )}

            {index > 0 && showOrbit && body.orbitalElements && body.parentBodyIndex !== undefined && (
                <OrbitPath
                    elements={body.orbitalElements}
                    color={body.color}
                    parentBody={bodies[body.parentBodyIndex]}
                    parentState={bodyStates[body.parentBodyIndex]}
                    isSelected={isSelected}
                    onClick={onClick}
                    onDoubleClick={onDoubleClick}
                />
            )}

            {index > 0 && showOrbit && body.orbitalElements && body.parentBodyIndex === undefined && (
                <OrbitPath elements={body.orbitalElements} color={body.color} isSelected={isSelected} onClick={onClick} onDoubleClick={onDoubleClick} />
            )}
        </>
    );
}

export function Scene3D({ bodies, bodyStates, showLabels, showTrails, showOrbits, selectedBodyIndex, onBodyClick }: Scene3DProps) {
    const [followBodyIndex, setFollowBodyIndex] = useState<number | null>(null);
    const controlsRef = useRef<any>(null);

    const handleDoubleClick = (index: number) => {
        // Double-click sets the camera to follow this body
        setFollowBodyIndex(index);
    };

    return (
        <Canvas camera={{ position: [3, 2, 3], fov: 60 }}>
            <color attach="background" args={["#000000"]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} />

            {/* Camera controller that follows the double-clicked body */}
            <CameraFollowController followBodyIndex={followBodyIndex} bodyStates={bodyStates} bodies={bodies} controlsRef={controlsRef} />

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
                    onDoubleClick={() => handleDoubleClick(index)}
                    bodies={bodies}
                    bodyStates={bodyStates}
                />
            ))}

            <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} minDistance={0.5} maxDistance={100} />
        </Canvas>
    );
}
