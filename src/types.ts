/**
 * Orbital elements using Keplerian parameters
 */
export interface OrbitalElements {
    semiMajorAxis: number; // a (AU)
    eccentricity: number; // e (0-1)
    inclination: number; // i (degrees)
    longitudeOfAscendingNode: number; // Ω (degrees)
    argumentOfPeriapsis: number; // ω (degrees)
    meanAnomalyAtEpoch: number; // M0 (degrees)
    epoch: number; // Julian date
}

/**
 * Physical properties of a celestial body
 */
export interface CelestialBodyProperties {
    name: string;
    mass: number; // kg
    radius: number; // km
    color: number; // hex color
    orbitalElements?: OrbitalElements;
    isCenter?: boolean; // true for Sun
}

/**
 * 3D position and velocity vector
 */
export interface StateVector {
    position: Vector3D;
    velocity: Vector3D;
}

/**
 * 3D vector
 */
export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Simulation configuration
 */
export interface SimulationConfig {
    timeStep: number; // seconds per simulation step
    timeScale: number; // simulation speed multiplier
    enablePerturbations: boolean; // include gravitational perturbations
    integrationMethod: "euler" | "verlet" | "rk4";
}

/**
 * Constants for orbital mechanics
 */
export const CONSTANTS = {
    G: 6.6743e-11, // Gravitational constant (m³/kg/s²)
    AU: 1.495978707e11, // Astronomical Unit (m)
    SOLAR_MASS: 1.98892e30, // kg
    EARTH_MASS: 5.97237e24, // kg
    MOON_MASS: 7.342e22, // kg
    VENUS_MASS: 4.8675e24, // kg
    MARS_MASS: 6.4171e23, // kg
    JUPITER_MASS: 1.8982e27, // kg
    EARTH_RADIUS: 6371, // km
    MOON_RADIUS: 1737.4, // km
    SUN_RADIUS: 695700, // km
    SECONDS_PER_DAY: 86400,
    DAYS_PER_YEAR: 365.25,
};

/**
 * Apophis specific data
 */
export const APOPHIS_DATA = {
    name: "99942 Apophis",
    mass: 6.1e10, // kg (estimated)
    radius: 0.185, // km (mean radius)
    color: 0x8b7355, // brownish-gray
    orbitalElements: {
        semiMajorAxis: 0.9224, // AU
        eccentricity: 0.1911,
        inclination: 3.341, // degrees
        longitudeOfAscendingNode: 203.9, // degrees
        argumentOfPeriapsis: 126.7, // degrees
        meanAnomalyAtEpoch: 90.28, // degrees
        epoch: 2460800.5, // JD (May 5, 2025)
    },
    closeApproach2029: {
        date: new Date("2029-04-13T21:46:00Z"),
        distance: 38011.8, // km from Earth center
        velocity: 7.42, // km/s relative to Earth
    },
};

/**
 * Earth orbital elements (for reference)
 */
export const EARTH_ORBITAL_ELEMENTS: OrbitalElements = {
    semiMajorAxis: 1.00000011, // AU
    eccentricity: 0.01671022,
    inclination: 0.00005, // degrees (relative to ecliptic)
    longitudeOfAscendingNode: -11.26064,
    argumentOfPeriapsis: 102.94719,
    meanAnomalyAtEpoch: 100.46435,
    epoch: 2451545.0, // J2000.0
};

/**
 * Venus orbital elements
 */
export const VENUS_ORBITAL_ELEMENTS: OrbitalElements = {
    semiMajorAxis: 0.72333199, // AU
    eccentricity: 0.00677323,
    inclination: 3.39471, // degrees
    longitudeOfAscendingNode: 76.68069,
    argumentOfPeriapsis: 131.53298,
    meanAnomalyAtEpoch: 181.97973,
    epoch: 2451545.0, // J2000.0
};

/**
 * Mars orbital elements
 */
export const MARS_ORBITAL_ELEMENTS: OrbitalElements = {
    semiMajorAxis: 1.52366231, // AU
    eccentricity: 0.09341233,
    inclination: 1.85061, // degrees
    longitudeOfAscendingNode: 49.57854,
    argumentOfPeriapsis: 336.04084,
    meanAnomalyAtEpoch: 355.45332,
    epoch: 2451545.0, // J2000.0
};
