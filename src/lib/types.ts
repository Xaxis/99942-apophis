/**
 * Orbital elements defining an orbit
 */
export interface OrbitalElements {
    semiMajorAxis: number; // AU
    eccentricity: number; // 0-1
    inclination: number; // degrees
    longitudeOfAscendingNode: number; // degrees
    argumentOfPeriapsis: number; // degrees
    meanAnomaly: number; // degrees
}

/**
 * Celestial body data
 */
export interface CelestialBody {
    name: string;
    mass: number; // kg
    radius: number; // km
    color: number; // hex color
    orbitalElements?: OrbitalElements;
}

/**
 * Body state (position and velocity)
 */
export interface BodyState {
    position: [number, number, number]; // meters
    velocity: [number, number, number]; // m/s
}

/**
 * Simulation configuration
 */
export interface SimulationConfig {
    timeScale: number;
    timeStep: number; // seconds
    integrationMethod: "euler" | "verlet" | "rk4";
    enablePerturbations: boolean;
}

/**
 * Integration method type
 */
export type IntegrationMethod = "euler" | "verlet" | "rk4";
