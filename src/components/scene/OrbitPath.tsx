"use client";

import { useMemo, useRef } from "react";
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

        for (let i = 0; i <= numPoints; i++) {
            const meanAnomaly = (i / numPoints) * 360;

            // If this orbit has a parent body (e.g., Moon around Earth), calculate relative to parent
            const centralMass = parentBody ? parentBody.mass : SUN.mass;
            const state = calculateOrbitalState({ ...elements, meanAnomaly }, centralMass, 0, parentState);

            // Convert from meters to AU and apply Y/Z swap for visualization
            const x = state.position[0] / AU;
            const y = state.position[2] / AU; // Swap Y and Z
            const z = -state.position[1] / AU; // Negate Y

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
        // Increased radius from 0.005 to 0.03 for easier clicking
        return new THREE.TubeGeometry(curve, 200, 0.03, 8, true);
    }, [points]);

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
                            depthWrite: true,
                            depthTest: true,
                        })
                    )
                }
            />

            {/* Additional glow effect when selected - visible tube */}
            {isSelected && (
                <mesh geometry={tubeGeometry}>
                    <meshBasicMaterial color={color} transparent opacity={0.3} />
                </mesh>
            )}
        </group>
    );
}
