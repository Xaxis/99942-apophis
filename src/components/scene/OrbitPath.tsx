"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitalElements, BodyState, CelestialBody } from "@/lib/types";
import { calculateOrbitalState } from "@/lib/physics/orbital-mechanics";
import { AU, SUN } from "@/lib/constants";

interface OrbitPathProps {
    elements: OrbitalElements;
    color: number;
    opacity?: number;
    parentBody?: CelestialBody;
    parentState?: BodyState;
    isSelected?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
}

export function OrbitPath({ elements, color, opacity = 0.25, parentBody, parentState, isSelected = false, onClick, onDoubleClick }: OrbitPathProps) {
    const lastClickTimeRef = useRef<number>(0);
    const singleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        const numPoints = 200;

        // Check if this is a satellite orbit (needs visual scaling for visibility)
        const isSatelliteOrbit = parentBody !== undefined;
        const visualScale = isSatelliteOrbit ? 20.0 : 1.0; // Scale satellite orbits 20x for visibility

        for (let i = 0; i <= numPoints; i++) {
            const meanAnomaly = (i / numPoints) * 360;

            // If this orbit has a parent body (e.g., Moon around Earth), calculate relative to parent
            const centralMass = parentBody ? parentBody.mass : SUN.mass;
            const state = calculateOrbitalState({ ...elements, meanAnomaly }, centralMass, 0, parentState);

            // Convert from meters to AU and apply Y/Z swap for visualization
            let x = state.position[0] / AU;
            let y = state.position[2] / AU; // Swap Y and Z
            let z = -state.position[1] / AU; // Negate Y

            // If satellite orbit, scale the distance from parent for visibility
            if (isSatelliteOrbit && parentState) {
                const parentX = parentState.position[0] / AU;
                const parentY = parentState.position[2] / AU;
                const parentZ = -parentState.position[1] / AU;

                x = parentX + (x - parentX) * visualScale;
                y = parentY + (y - parentY) * visualScale;
                z = parentZ + (z - parentZ) * visualScale;
            }

            pts.push(new THREE.Vector3(x, y, z));
        }

        return pts;
    }, [elements, parentBody, parentState]);

    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }, [points]);

    // Create a tube geometry for clickable orbit path
    const tubeGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(points, true); // true = closed curve
        // Much smaller radius - just enough for clicking, not covering objects
        return new THREE.TubeGeometry(curve, 200, 0.002, 8, true);
    }, [points]);

    // CRITICAL: Dispose geometries on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            lineGeometry.dispose();
            tubeGeometry.dispose();
        };
    }, [lineGeometry, tubeGeometry]);

    return (
        <group>
            {/* Invisible clickable tube for interaction */}
            {onClick && (
                <mesh
                    geometry={tubeGeometry}
                    onClick={(e) => {
                        e.stopPropagation();

                        const now = Date.now();
                        const timeSinceLastClick = now - lastClickTimeRef.current;

                        if (timeSinceLastClick < 300 && onDoubleClick) {
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
                        document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = "default";
                    }}
                >
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>
            )}

            {/* Visible orbit line */}
            <primitive
                object={
                    new THREE.Line(
                        lineGeometry,
                        new THREE.LineBasicMaterial({
                            color,
                            transparent: true,
                            opacity: isSelected ? opacity * 4 : opacity, // Much brighter when selected
                            depthWrite: false, // Don't write to depth buffer - prevents disappearing from certain angles
                            depthTest: true, // Still test against depth - renders behind objects correctly
                        })
                    )
                }
            />

            {/* Additional glow effect when selected - thin visible line, not covering tube */}
            {isSelected && (
                <primitive
                    object={
                        new THREE.Line(
                            lineGeometry,
                            new THREE.LineBasicMaterial({
                                color,
                                transparent: true,
                                opacity: 0.6,
                                linewidth: 2, // Note: linewidth doesn't work on most platforms, but we try
                            })
                        )
                    }
                />
            )}
        </group>
    );
}
