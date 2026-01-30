import { OrbitalElements, BodyState } from "../types";
import { G, AU } from "../constants";

/**
 * Convert degrees to radians
 */
function degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Solve Kepler's equation using Newton-Raphson method
 */
function solveKeplerEquation(M: number, e: number, tolerance = 1e-6): number {
    let E = M; // Initial guess
    let delta = 1;
    let iterations = 0;
    const maxIterations = 100;

    while (Math.abs(delta) > tolerance && iterations < maxIterations) {
        delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= delta;
        iterations++;
    }

    return E;
}

/**
 * Calculate orbital state from orbital elements
 */
export function calculateOrbitalState(elements: OrbitalElements, centralBodyMass: number, time: number = 0, parentBodyState?: BodyState): BodyState {
    const { semiMajorAxis, eccentricity, inclination, longitudeOfAscendingNode, argumentOfPeriapsis, meanAnomaly } = elements;

    // Convert to radians
    const i = degToRad(inclination);
    const Omega = degToRad(longitudeOfAscendingNode);
    const omega = degToRad(argumentOfPeriapsis);
    const M0 = degToRad(meanAnomaly);

    // Calculate mean motion
    const a = semiMajorAxis * AU; // Convert to meters
    const mu = G * centralBodyMass;
    const n = Math.sqrt(mu / (a * a * a)); // Mean motion (rad/s)

    // Calculate mean anomaly at time t
    const M = M0 + n * time;

    // Solve Kepler's equation for eccentric anomaly
    const E = solveKeplerEquation(M, eccentricity);

    // Calculate true anomaly
    const nu = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(E / 2), Math.sqrt(1 - eccentricity) * Math.cos(E / 2));

    // Calculate distance
    const r = a * (1 - eccentricity * Math.cos(E));

    // Position in orbital plane
    const xOrbital = r * Math.cos(nu);
    const yOrbital = r * Math.sin(nu);

    // Velocity in orbital plane
    // Using the correct perifocal frame velocity formula: v = (μ/h) * [-sin(ν) p̂ + (e + cos(ν)) q̂]
    // where h = √(μ * a * (1 - e²)) is the specific angular momentum
    const h = Math.sqrt(mu * a * (1 - eccentricity * eccentricity));
    const vxOrbital = -(mu / h) * Math.sin(nu);
    const vyOrbital = (mu / h) * (eccentricity + Math.cos(nu));

    // Rotation matrices to convert to ecliptic coordinates
    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosomega = Math.cos(omega);
    const sinomega = Math.sin(omega);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);

    // Transform position
    const x = (cosOmega * cosomega - sinOmega * sinomega * cosi) * xOrbital + (-cosOmega * sinomega - sinOmega * cosomega * cosi) * yOrbital;
    const y = (sinOmega * cosomega + cosOmega * sinomega * cosi) * xOrbital + (-sinOmega * sinomega + cosOmega * cosomega * cosi) * yOrbital;
    const z = sinomega * sini * xOrbital + cosomega * sini * yOrbital;

    // Transform velocity
    const vx = (cosOmega * cosomega - sinOmega * sinomega * cosi) * vxOrbital + (-cosOmega * sinomega - sinOmega * cosomega * cosi) * vyOrbital;
    const vy = (sinOmega * cosomega + cosOmega * sinomega * cosi) * vxOrbital + (-sinOmega * sinomega + cosOmega * cosomega * cosi) * vyOrbital;
    const vz = sinomega * sini * vxOrbital + cosomega * sini * vyOrbital;

    // If this body orbits another body (e.g., Moon orbits Earth), add parent's position and velocity
    if (parentBodyState) {
        return {
            position: [x + parentBodyState.position[0], y + parentBodyState.position[1], z + parentBodyState.position[2]],
            velocity: [vx + parentBodyState.velocity[0], vy + parentBodyState.velocity[1], vz + parentBodyState.velocity[2]],
        };
    }

    return {
        position: [x, y, z],
        velocity: [vx, vy, vz],
    };
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Convert meters to AU
 */
export function metersToAU(meters: number): number {
    return meters / AU;
}

/**
 * Convert AU to meters
 */
export function auToMeters(au: number): number {
    return au * AU;
}
