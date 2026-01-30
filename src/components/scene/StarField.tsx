"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";

export function StarField() {
    const starsRef = useRef<THREE.Points>(null);

    const { starPositions, starSizes } = useMemo(() => {
        const positions = new Float32Array(2000 * 3);
        const sizes = new Float32Array(2000);

        for (let i = 0; i < 2000; i++) {
            // Create stars in a large spherical shell - fixed background
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 200 + Math.random() * 100; // 200-300 AU away

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Vary star sizes for depth
            sizes[i] = 0.3 + Math.random() * 0.7;
        }
        return { starPositions: positions, starSizes: sizes };
    }, []);

    return (
        <points ref={starsRef} renderOrder={-1}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
                <bufferAttribute attach="attributes-size" args={[starSizes, 1]} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color={0xffffff} transparent opacity={0.8} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
}
