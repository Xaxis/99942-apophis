"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface TrailProps {
    positions: { x: number; y: number; z: number }[];
    color: number;
    opacity?: number;
}

export function Trail({ positions, color, opacity = 0.7 }: TrailProps) {
    const points = useMemo(() => {
        return positions.map((pos) => new THREE.Vector3(pos.x, pos.y, pos.z));
    }, [positions]);

    const lineGeometry = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    if (!lineGeometry) return null;

    return (
        <primitive
            object={
                new THREE.Line(
                    lineGeometry,
                    new THREE.LineBasicMaterial({
                        color,
                        transparent: true,
                        opacity,
                        linewidth: 2, // Slightly thicker for visibility
                    })
                )
            }
        />
    );
}
