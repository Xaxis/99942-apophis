"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody, BodyState, OrbitalElements } from "@/lib/types";
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
    apophisElements?: OrbitalElements; // Dynamic Apophis orbital elements
    parentIndices: Map<CelestialBody, number>; // Map of satellites to their parent body indices
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
    apophisElements?: OrbitalElements;
    parentIndices: Map<CelestialBody, number>;
    followBodyIndex: number | null; // Track which body camera is following
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

function BodyMesh({
    body,
    state,
    showLabel,
    showTrail,
    showOrbit,
    index,
    isSelected,
    onClick,
    onDoubleClick,
    bodies,
    bodyStates,
    apophisElements,
    parentIndices,
    followBodyIndex,
}: BodyMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.BufferGeometry>(null);
    const trailPositions = useRef<THREE.Vector3[]>([]);

    // Adaptive trail length: shorter for satellites to reduce memory with 50+ bodies
    const isSatellite = parentIndices.get(body) !== undefined;
    const maxTrailLength = isSatellite ? 100 : 200;

    const [hovered, setHovered] = useState(false);
    const lastClickTimeRef = useRef<number>(0);
    const singleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
    const previousPositionRef = useRef<THREE.Vector3 | null>(null);
    const frameCountRef = useRef<number>(0);
    const { camera } = useThree();
    const [cameraDistance, setCameraDistance] = useState<number>(0);

    // CRITICAL: Reuse Vector3 objects to prevent memory allocation every frame
    const tempVec3 = useRef<THREE.Vector3>(new THREE.Vector3());
    const bodyPosVec3 = useRef<THREE.Vector3>(new THREE.Vector3());

    // Use apophisElements if provided, otherwise use body's orbital elements
    const currentElements = useMemo(() => apophisElements || body.orbitalElements, [apophisElements, body.orbitalElements]);
    const previousOrbitalElementsRef = useRef<OrbitalElements | undefined>(currentElements);

    // CRITICAL: Dispose trail geometry on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (trailRef.current) {
                trailRef.current.dispose();
            }
        };
    }, []);

    // Convert position from meters to AU for visualization - memoized to prevent unnecessary re-renders
    // For satellites: scale up the visual position relative to parent for better visibility
    const positionAU = useMemo(() => {
        const basePos = [
            state.position[0] / AU,
            state.position[2] / AU, // Swap Y and Z for better visualization
            -state.position[1] / AU,
        ];

        // If this is a satellite, scale up its visual distance from parent
        const parentIndex = parentIndices.get(body);
        if (parentIndex !== undefined) {
            const parentState = bodyStates[parentIndex];
            if (parentState) {
                const parentPos = [parentState.position[0] / AU, parentState.position[2] / AU, -parentState.position[1] / AU];

                // Calculate relative position (satellite position is already absolute/heliocentric)
                const relativePos = [basePos[0] - parentPos[0], basePos[1] - parentPos[1], basePos[2] - parentPos[2]];

                // Scale factor: make satellite orbits ~20x larger for visibility
                const visualScale = 20.0;

                return [parentPos[0] + relativePos[0] * visualScale, parentPos[1] + relativePos[1] * visualScale, parentPos[2] + relativePos[2] * visualScale];
            }
        }

        return basePos;
    }, [state.position, body, parentIndices, bodyStates]);

    // Update mesh position and camera distance
    useFrame((frameState) => {
        if (meshRef.current) {
            meshRef.current.position.set(positionAU[0], positionAU[1], positionAU[2]);

            // Calculate distance from camera to this body - REUSE Vector3 object
            bodyPosVec3.current.set(positionAU[0], positionAU[1], positionAU[2]);
            const dist = camera.position.distanceTo(bodyPosVec3.current);
            setCameraDistance(dist);

            // Update trail
            if (index > 0 && showTrail) {
                // Don't show trail for Sun
                // REUSE Vector3 object instead of creating new one every frame
                tempVec3.current.set(positionAU[0], positionAU[1], positionAU[2]);

                // Detect orbital elements change (for Apophis when controls are adjusted)
                const activeElements = apophisElements || body.orbitalElements;
                if (activeElements && previousOrbitalElementsRef.current) {
                    const elementsChanged =
                        activeElements.semiMajorAxis !== previousOrbitalElementsRef.current.semiMajorAxis ||
                        activeElements.eccentricity !== previousOrbitalElementsRef.current.eccentricity ||
                        activeElements.inclination !== previousOrbitalElementsRef.current.inclination ||
                        activeElements.longitudeOfAscendingNode !== previousOrbitalElementsRef.current.longitudeOfAscendingNode ||
                        activeElements.argumentOfPeriapsis !== previousOrbitalElementsRef.current.argumentOfPeriapsis ||
                        activeElements.meanAnomaly !== previousOrbitalElementsRef.current.meanAnomaly;

                    if (elementsChanged) {
                        trailPositions.current = [];
                        previousOrbitalElementsRef.current = activeElements;
                    }
                }

                // Detect scenario change: if position jumped more than 1.0 AU, clear trail
                if (previousPositionRef.current && tempVec3.current.distanceTo(previousPositionRef.current) > 1.0) {
                    trailPositions.current = [];
                }

                // Update previous position - reuse existing object or create new one
                if (!previousPositionRef.current) {
                    previousPositionRef.current = new THREE.Vector3();
                }
                previousPositionRef.current.copy(tempVec3.current);

                // Only add new position if it's different enough from the last one
                const lastPos = trailPositions.current[trailPositions.current.length - 1];
                if (!lastPos || tempVec3.current.distanceTo(lastPos) > 0.0001) {
                    // Create NEW Vector3 for trail array (must be unique object)
                    trailPositions.current.push(tempVec3.current.clone());

                    if (trailPositions.current.length > maxTrailLength) {
                        trailPositions.current.shift();
                    }
                }

                // Update trail geometry every 10 frames to reduce performance impact
                frameCountRef.current++;
                if (trailRef.current && trailPositions.current.length > 1 && frameCountRef.current % 10 === 0) {
                    // Check if buffer needs to be resized
                    const currentBufferSize = trailRef.current.attributes.position?.count || 0;
                    const requiredSize = trailPositions.current.length;

                    if (requiredSize > currentBufferSize) {
                        // Buffer too small - need to recreate geometry
                        trailRef.current.dispose();
                        const newGeometry = new THREE.BufferGeometry().setFromPoints(trailPositions.current);
                        trailRef.current.copy(newGeometry);
                        newGeometry.dispose(); // CRITICAL: Dispose temporary geometry
                    } else {
                        // Buffer large enough - update in place
                        const positions = trailRef.current.attributes.position.array as Float32Array;
                        for (let i = 0; i < requiredSize; i++) {
                            positions[i * 3] = trailPositions.current[i].x;
                            positions[i * 3 + 1] = trailPositions.current[i].y;
                            positions[i * 3 + 2] = trailPositions.current[i].z;
                        }
                        trailRef.current.setDrawRange(0, requiredSize);
                        trailRef.current.attributes.position.needsUpdate = true;
                    }
                }
            }
        }
    });

    // Calculate body size using DISTANCE-BASED ADAPTIVE SCALING
    // This is how professional orrery software (Celestia, Space Engine, Stellarium) works:
    // Objects get larger as you zoom in, maintaining visibility at all zoom levels
    const visualRadius = useMemo(() => {
        const KM_PER_AU = 149597870.7; // 1 AU in kilometers

        // Convert physical radius (km) to AU
        const physicalRadiusAU = body.radius / KM_PER_AU;

        // Check if this is a satellite
        const isSatellite = parentIndices.get(body) !== undefined;

        // PROFESSIONAL ORRERY DISTANCE-BASED ADAPTIVE SCALING
        // Based on Celestia, Space Engine, Stellarium
        //
        // Key insight: Use LOGARITHMIC scaling that works across ALL distance ranges
        // - Zoomed out (100 AU): Modest scaling for solar system view
        // - Medium (1 AU): Moderate scaling for planet viewing
        // - Close (0.01 AU): Aggressive scaling for detail viewing
        // - Very close (0.001 AU): Extreme scaling for moon/surface viewing

        const baseScale = isSatellite ? 20.0 : 10.0;

        // LOGARITHMIC DISTANCE SCALING
        // This creates smooth scaling across all zoom levels
        // Formula: scale = baseScale * (referenceDistance / actualDistance)^power
        //
        // Using power of 0.5 (square root) for smooth but aggressive scaling
        const REFERENCE_DISTANCE = 10.0; // AU - reference point for scaling
        const POWER = 0.5; // Square root for smooth scaling
        const MAX_SCALE_BOOST = 1000.0; // Cap at 1000x to prevent extreme values

        const distanceRatio = REFERENCE_DISTANCE / Math.max(0.001, cameraDistance);
        const distanceScale = Math.min(MAX_SCALE_BOOST, Math.pow(distanceRatio, POWER));

        const scaledRadius = physicalRadiusAU * baseScale * distanceScale;

        // Minimum visibility for very tiny objects
        const MIN_RADIUS = 0.0001; // AU
        return Math.max(scaledRadius, MIN_RADIUS);
    }, [body, parentIndices, cameraDistance]);

    return (
        <>
            {/* Main body sphere */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();

                    const now = Date.now();
                    const timeSinceLastClick = now - lastClickTimeRef.current;

                    if (timeSinceLastClick < 300) {
                        // Double-click detected - cancel pending single-click and trigger double-click
                        if (singleClickTimerRef.current) {
                            clearTimeout(singleClickTimerRef.current);
                            singleClickTimerRef.current = null;
                        }
                        onDoubleClick();
                    } else {
                        // Delay single-click to see if double-click is coming
                        singleClickTimerRef.current = setTimeout(() => {
                            onClick();
                            singleClickTimerRef.current = null;
                        }, 300);
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
                <sphereGeometry args={[visualRadius, 32, 32]} />
                {index === 0 ? <meshBasicMaterial color={body.color} /> : <meshStandardMaterial color={body.color} emissive={body.color} emissiveIntensity={hovered ? 0.5 : 0.2} />}
            </mesh>

            {showLabel &&
                (() => {
                    // INTELLIGENT LABEL VISIBILITY SYSTEM
                    // Based on professional planetarium software (Stellarium, Celestia, Space Engine)

                    const isSatellite = parentIndices.get(body) !== undefined;
                    const parentIndex = parentIndices.get(body);

                    // Determine if label should be visible based on context
                    let shouldShowLabel = false;

                    if (!isSatellite) {
                        // PLANETS/SUN/ASTEROIDS: Always show when zoomed out
                        // Hide when camera is very close (< 0.1 AU) to avoid label covering view
                        shouldShowLabel = cameraDistance > 0.05;
                    } else {
                        // SATELLITES (MOONS): Only show when:
                        // 1. Camera is following the parent planet, OR
                        // 2. Camera is very close to the satellite (< 0.05 AU), OR
                        // 3. Satellite is selected/hovered
                        const isFollowingParent = followBodyIndex === parentIndex;
                        const isCloseToSatellite = cameraDistance < 0.05;
                        const isInteractingWithSatellite = isSelected || hovered;

                        shouldShowLabel = isFollowingParent || isCloseToSatellite || isInteractingWithSatellite;
                    }

                    if (!shouldShowLabel) return null;

                    // PROFESSIONAL LABEL POSITIONING ALGORITHM
                    // Based on research: "Labels on Levels" (IEEE TVCG 2018) and professional orrery software
                    //
                    // Strategy: RADIAL OFFSET from object center to avoid parent-child occlusion
                    // - For satellites: offset AWAY from parent to avoid covering parent planet
                    // - For planets: offset upward (standard vertical placement)
                    // - Use clearance multiplier to ensure label is outside visual boundary

                    const LABEL_CLEARANCE_MULTIPLIER = 1.8; // 1.8x radius = 80% clearance beyond sphere edge

                    let labelXOffset = 0;
                    let labelYOffset = visualRadius * LABEL_CLEARANCE_MULTIPLIER;
                    let labelZOffset = 0;

                    // HIERARCHICAL LABEL POSITIONING: Satellites offset radially away from parent
                    if (isSatellite && parentIndex !== undefined) {
                        const parentState = bodyStates[parentIndex];
                        if (parentState) {
                            // Calculate direction from parent to satellite (in AU)
                            const parentPosAU = [parentState.position[0] / AU, parentState.position[2] / AU, -parentState.position[1] / AU];

                            const dirX = positionAU[0] - parentPosAU[0];
                            const dirY = positionAU[1] - parentPosAU[1];
                            const dirZ = positionAU[2] - parentPosAU[2];

                            const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

                            if (length > 0.0001) {
                                // Normalize direction and offset label AWAY from parent
                                const offsetDistance = visualRadius * LABEL_CLEARANCE_MULTIPLIER;
                                labelXOffset = (dirX / length) * offsetDistance;
                                labelYOffset = (dirY / length) * offsetDistance;
                                labelZOffset = (dirZ / length) * offsetDistance;
                            }
                        }
                    }

                    return (
                        <Html position={[positionAU[0] + labelXOffset, positionAU[1] + labelYOffset, positionAU[2] + labelZOffset]} center zIndexRange={[0, 0]}>
                            <div
                                className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    const now = Date.now();
                                    const timeSinceLastClick = now - lastClickTimeRef.current;

                                    if (timeSinceLastClick < 300) {
                                        // Double-click detected - cancel pending single-click and trigger double-click
                                        if (singleClickTimerRef.current) {
                                            clearTimeout(singleClickTimerRef.current);
                                            singleClickTimerRef.current = null;
                                        }
                                        onDoubleClick();
                                    } else {
                                        // Delay single-click to see if double-click is coming
                                        singleClickTimerRef.current = setTimeout(() => {
                                            onClick();
                                            singleClickTimerRef.current = null;
                                        }, 300);
                                    }

                                    lastClickTimeRef.current = now;
                                }}
                            >
                                {body.name}
                            </div>
                        </Html>
                    );
                })()}

            {index > 0 &&
                showTrail &&
                trailPositions.current.length > 1 &&
                (() => {
                    // For satellites, only show trail when following parent or very close
                    const isSatellite = parentIndices.get(body) !== undefined;
                    const parentIndex = parentIndices.get(body);

                    if (isSatellite) {
                        const isFollowingParent = followBodyIndex === parentIndex;
                        const isCloseToSatellite = cameraDistance < 0.1;

                        if (!isFollowingParent && !isCloseToSatellite) {
                            return null; // Don't show satellite trails when zoomed out
                        }
                    }

                    return (
                        <line>
                            <bufferGeometry ref={trailRef} />
                            <lineBasicMaterial color={body.color} transparent opacity={0.6} linewidth={2} />
                        </line>
                    );
                })()}

            {index > 0 &&
                showOrbit &&
                currentElements &&
                (() => {
                    const parentIndex = parentIndices.get(body);
                    const isSatellite = parentIndex !== undefined;

                    // For satellites, only show orbit when following parent or very close
                    if (isSatellite) {
                        const isFollowingParent = followBodyIndex === parentIndex;
                        const isCloseToSatellite = cameraDistance < 0.1;

                        if (!isFollowingParent && !isCloseToSatellite) {
                            return null; // Don't show satellite orbits when zoomed out
                        }
                    }

                    if (parentIndex !== undefined) {
                        return (
                            <OrbitPath
                                elements={currentElements}
                                color={body.color}
                                parentBody={bodies[parentIndex]}
                                parentState={bodyStates[parentIndex]}
                                isSelected={isSelected}
                                onClick={onClick}
                                onDoubleClick={onDoubleClick}
                            />
                        );
                    } else {
                        return <OrbitPath elements={currentElements} color={body.color} isSelected={isSelected} onClick={onClick} onDoubleClick={onDoubleClick} />;
                    }
                })()}
        </>
    );
}

export function Scene3D({ bodies, bodyStates, showLabels, showTrails, showOrbits, selectedBodyIndex, onBodyClick, apophisElements, parentIndices }: Scene3DProps) {
    const [followBodyIndex, setFollowBodyIndex] = useState<number | null>(null);
    const controlsRef = useRef<any>(null);

    const handleDoubleClick = (index: number) => {
        // Double-click sets the camera to follow this body and clears selection
        setFollowBodyIndex(index);
        onBodyClick(-1); // Clear selection by setting to invalid index
    };

    return (
        <Canvas
            camera={{
                position: [3, 2, 3],
                fov: 60,
                near: 0.00001, // Very small near plane - allows zooming extremely close to tiny objects
                far: 1000, // Large far plane - can see entire solar system
            }}
        >
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
                    apophisElements={body.name === "99942 Apophis" ? apophisElements : undefined}
                    parentIndices={parentIndices}
                    followBodyIndex={followBodyIndex}
                />
            ))}

            <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.05}
                minDistance={0.001}
                maxDistance={100}
                makeDefault
                // Note: The wheel event passive warning is a known issue with OrbitControls
                // It doesn't affect functionality - the controls work correctly
            />
        </Canvas>
    );
}
