"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * Asteroid Belt Component
 * Represents the main asteroid belt between Mars and Jupiter (2.2 - 3.2 AU)
 * Uses particle system for performance with thousands of asteroids
 */
export function AsteroidBelt() {
    const pointsRef = useRef<THREE.Points>(null);

    // Create circular sprite texture
    const circleTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    const { positions, colors, sizes } = useMemo(() => {
        const numAsteroids = 3000; // Number of asteroid particles
        const positions = new Float32Array(numAsteroids * 3);
        const colors = new Float32Array(numAsteroids * 3);
        const sizes = new Float32Array(numAsteroids);

        // Main belt parameters (based on observational data)
        const innerRadius = 2.2; // AU - inner edge (near Mars)
        const outerRadius = 3.2; // AU - outer edge (before Jupiter)
        const peakRadius = 2.7; // AU - peak density (middle of belt)
        const thickness = 0.3; // AU - vertical thickness

        for (let i = 0; i < numAsteroids; i++) {
            // Semi-major axis distribution (Gaussian-like peak at 2.7 AU)
            // Avoid Kirkwood gaps at resonances with Jupiter
            let a: number;
            let attempts = 0;
            do {
                // Gaussian distribution centered at peak
                const u1 = Math.random();
                const u2 = Math.random();
                const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                a = peakRadius + gaussian * 0.3;
                attempts++;
            } while ((a < innerRadius || a > outerRadius || isInKirkwoodGap(a)) && attempts < 100);

            // If we couldn't find a good position, use uniform distribution
            if (attempts >= 100) {
                a = innerRadius + Math.random() * (outerRadius - innerRadius);
            }

            // Eccentricity (most asteroids have low eccentricity)
            const e = Math.random() * 0.15; // 0 to 0.15

            // Inclination (most asteroids have low inclination)
            const inc = (Math.random() * 15 - 7.5) * (Math.PI / 180); // -7.5° to +7.5°

            // Random position in orbit
            const M = Math.random() * 2 * Math.PI; // Mean anomaly
            const E = solveKeplerSimple(M, e); // Eccentric anomaly

            // Position in orbital plane
            const r = a * (1 - e * Math.cos(E));
            const theta = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

            // Random longitude of ascending node and argument of periapsis
            const Omega = Math.random() * 2 * Math.PI;
            const omega = Math.random() * 2 * Math.PI;

            // Convert to 3D position (simplified rotation)
            const x = r * (Math.cos(Omega) * Math.cos(omega + theta) - Math.sin(Omega) * Math.sin(omega + theta) * Math.cos(inc));
            const y = r * (Math.sin(Omega) * Math.cos(omega + theta) + Math.cos(Omega) * Math.sin(omega + theta) * Math.cos(inc));
            const z = r * Math.sin(omega + theta) * Math.sin(inc);

            positions[i * 3] = x;
            positions[i * 3 + 1] = z; // Y/Z swap for visualization
            positions[i * 3 + 2] = -y;

            // Color variation (gray to brown asteroids) - brighter for visibility
            const colorVariation = 0.8 + Math.random() * 0.2;
            colors[i * 3] = 0.7 * colorVariation; // R
            colors[i * 3 + 1] = 0.6 * colorVariation; // G
            colors[i * 3 + 2] = 0.5 * colorVariation; // B

            // Size variation - small particles
            sizes[i] = 0.003 + Math.random() * 0.005;
        }

        return { positions, colors, sizes };
    }, []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <pointsMaterial map={circleTexture} size={0.008} vertexColors transparent opacity={0.8} sizeAttenuation={true} depthWrite={false} alphaTest={0.01} />
        </points>
    );
}

/**
 * Check if semi-major axis is in a Kirkwood gap (orbital resonances with Jupiter)
 * Major gaps at 3:1 (2.5 AU), 5:2 (2.82 AU), 7:3 (2.95 AU), 2:1 (3.28 AU)
 */
function isInKirkwoodGap(a: number): boolean {
    const gaps = [
        { center: 2.5, width: 0.05 }, // 3:1 resonance
        { center: 2.82, width: 0.04 }, // 5:2 resonance
        { center: 2.95, width: 0.03 }, // 7:3 resonance
    ];

    return gaps.some((gap) => Math.abs(a - gap.center) < gap.width);
}

/**
 * Simple Kepler equation solver for eccentric anomaly
 */
function solveKeplerSimple(M: number, e: number): number {
    let E = M;
    for (let i = 0; i < 5; i++) {
        E = M + e * Math.sin(E);
    }
    return E;
}
