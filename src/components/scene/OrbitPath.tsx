"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { OrbitalElements } from "@/lib/types";
import { calculateOrbitalState } from "@/lib/physics/orbital-mechanics";
import { AU, SUN } from "@/lib/constants";

interface OrbitPathProps {
    elements: OrbitalElements;
    color: number;
    opacity?: number;
}

export function OrbitPath({ elements, color, opacity = 0.15 }: OrbitPathProps) {
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        const numPoints = 200;

        for (let i = 0; i <= numPoints; i++) {
            const meanAnomaly = (i / numPoints) * 360;
            const state = calculateOrbitalState({ ...elements, meanAnomaly }, SUN.mass, 0);

            // Convert from meters to AU and apply Y/Z swap for visualization
            const x = state.position[0] / AU;
            const y = state.position[2] / AU; // Swap Y and Z
            const z = -state.position[1] / AU; // Negate Y

            pts.push(new THREE.Vector3(x, y, z));
        }

        return pts;
    }, [elements]);

    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return geometry;
    }, [points]);

    return (
        <primitive
            object={
                new THREE.Line(
                    lineGeometry,
                    new THREE.LineBasicMaterial({
                        color,
                        transparent: true,
                        opacity,
                        depthWrite: false,
                        linewidth: 1, // Thin line for subdued appearance
                    })
                )
            }
        />
    );
}
