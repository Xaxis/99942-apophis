import { CelestialBody, OrbitalElements } from "./types";

/**
 * Physical constants
 */
export const G = 6.6743e-11; // Gravitational constant (m^3 kg^-1 s^-2)
export const AU = 1.495978707e11; // Astronomical Unit in meters
export const SECONDS_PER_DAY = 86400;

/**
 * Solar system bodies
 */
export const SUN: CelestialBody = {
    name: "Sun",
    mass: 1.989e30,
    radius: 696000,
    color: 0xfdb813,
};

export const EARTH: CelestialBody = {
    name: "Earth",
    mass: 5.972e24,
    radius: 6371,
    color: 0x4a90e2,
    orbitalElements: {
        semiMajorAxis: 1.0,
        eccentricity: 0.0167,
        inclination: 0.0,
        longitudeOfAscendingNode: 0.0,
        argumentOfPeriapsis: 102.9,
        meanAnomaly: 0.0,
    },
};

export const VENUS: CelestialBody = {
    name: "Venus",
    mass: 4.867e24,
    radius: 6052,
    color: 0xffc649,
    orbitalElements: {
        semiMajorAxis: 0.723,
        eccentricity: 0.0068,
        inclination: 3.39,
        longitudeOfAscendingNode: 76.68,
        argumentOfPeriapsis: 131.53,
        meanAnomaly: 0.0,
    },
};

export const MARS: CelestialBody = {
    name: "Mars",
    mass: 6.417e23,
    radius: 3390,
    color: 0xdc4c3e,
    orbitalElements: {
        semiMajorAxis: 1.524,
        eccentricity: 0.0934,
        inclination: 1.85,
        longitudeOfAscendingNode: 49.57,
        argumentOfPeriapsis: 336.04,
        meanAnomaly: 0.0,
    },
};

export const JUPITER: CelestialBody = {
    name: "Jupiter",
    mass: 1.8982e27, // Most massive planet - major gravitational influence on asteroids
    radius: 69911,
    color: 0xc88b3a,
    orbitalElements: {
        semiMajorAxis: 5.2044,
        eccentricity: 0.0489,
        inclination: 1.303,
        longitudeOfAscendingNode: 100.47,
        argumentOfPeriapsis: 273.87,
        meanAnomaly: 20.02,
    },
};

export const SATURN: CelestialBody = {
    name: "Saturn",
    mass: 5.6834e26, // Second most massive - affects outer asteroid belt
    radius: 58232,
    color: 0xfad5a5,
    orbitalElements: {
        semiMajorAxis: 9.5826,
        eccentricity: 0.0565,
        inclination: 2.485,
        longitudeOfAscendingNode: 113.66,
        argumentOfPeriapsis: 339.39,
        meanAnomaly: 317.02,
    },
};

export const MERCURY: CelestialBody = {
    name: "Mercury",
    mass: 3.3011e23, // Innermost planet - affects inner solar system dynamics
    radius: 2440,
    color: 0x8c7853,
    orbitalElements: {
        semiMajorAxis: 0.387,
        eccentricity: 0.2056,
        inclination: 7.005,
        longitudeOfAscendingNode: 48.33,
        argumentOfPeriapsis: 29.12,
        meanAnomaly: 174.8,
    },
};

export const MOON: CelestialBody = {
    name: "Moon",
    mass: 7.342e22, // Earth's moon - affects Earth-asteroid interactions
    radius: 1737,
    color: 0xaaaaaa,
    orbitalElements: {
        // Moon orbits Earth, simplified as Earth-like orbit with offset
        semiMajorAxis: 1.00257,
        eccentricity: 0.0549,
        inclination: 5.145,
        longitudeOfAscendingNode: 125.08,
        argumentOfPeriapsis: 318.15,
        meanAnomaly: 135.27,
    },
};

export const APOPHIS: CelestialBody = {
    name: "99942 Apophis",
    mass: 6.1e10,
    radius: 0.185,
    color: 0x8b7355,
    orbitalElements: {
        semiMajorAxis: 0.9224,
        eccentricity: 0.1914,
        inclination: 3.331,
        longitudeOfAscendingNode: 204.45,
        argumentOfPeriapsis: 126.4,
        meanAnomaly: 0.0,
    },
};

export const BODIES = [SUN, MERCURY, VENUS, EARTH, MOON, MARS, JUPITER, SATURN, APOPHIS];

// Preset Simulations
export interface PresetSimulation {
    id: string;
    name: string;
    description: string;
    elements: OrbitalElements;
    riskLevel: "safe" | "low" | "moderate" | "high" | "critical";
}

export const PRESET_SIMULATIONS: PresetSimulation[] = [
    {
        id: "current",
        name: "Current Orbit (Safe)",
        description: "Apophis's actual current orbital parameters. No impact risk for at least 100 years.",
        elements: {
            semiMajorAxis: 0.9224,
            eccentricity: 0.1914,
            inclination: 3.331,
            longitudeOfAscendingNode: 204.45,
            argumentOfPeriapsis: 126.4,
            meanAnomaly: 0.0,
        },
        riskLevel: "safe",
    },
    {
        id: "2029-approach",
        name: "2029 Close Approach",
        description: "Simulates the April 13, 2029 flyby at ~31,000 km. Safe but very close.",
        elements: {
            semiMajorAxis: 0.9224,
            eccentricity: 0.1914,
            inclination: 3.331,
            longitudeOfAscendingNode: 204.45,
            argumentOfPeriapsis: 126.4,
            meanAnomaly: 180.0,
        },
        riskLevel: "low",
    },
    {
        id: "reduced-inclination",
        name: "Reduced Inclination Scenario",
        description: "What if Apophis had lower orbital inclination? Increases intersection probability.",
        elements: {
            semiMajorAxis: 0.9224,
            eccentricity: 0.1914,
            inclination: 0.5,
            longitudeOfAscendingNode: 204.45,
            argumentOfPeriapsis: 126.4,
            meanAnomaly: 0.0,
        },
        riskLevel: "moderate",
    },
    {
        id: "earth-crossing",
        name: "Earth-Crossing Orbit",
        description: "Hypothetical orbit that crosses Earth's path more directly. Elevated risk.",
        elements: {
            semiMajorAxis: 1.0,
            eccentricity: 0.25,
            inclination: 1.0,
            longitudeOfAscendingNode: 180.0,
            argumentOfPeriapsis: 90.0,
            meanAnomaly: 0.0,
        },
        riskLevel: "high",
    },
    {
        id: "resonance-lock",
        name: "Orbital Resonance Lock",
        description: "7:6 resonance with Earth - repeated close approaches over time.",
        elements: {
            semiMajorAxis: 0.955,
            eccentricity: 0.22,
            inclination: 2.0,
            longitudeOfAscendingNode: 200.0,
            argumentOfPeriapsis: 120.0,
            meanAnomaly: 0.0,
        },
        riskLevel: "moderate",
    },
    {
        id: "keyhole-passage",
        name: "Gravitational Keyhole",
        description: "Simulates passage through a gravitational keyhole that could alter future trajectory.",
        elements: {
            semiMajorAxis: 0.9224,
            eccentricity: 0.1914,
            inclination: 0.8,
            longitudeOfAscendingNode: 204.45,
            argumentOfPeriapsis: 126.4,
            meanAnomaly: 175.0,
        },
        riskLevel: "high",
    },
    {
        id: "impact-trajectory",
        name: "Impact Trajectory (Hypothetical)",
        description: "Theoretical impact scenario - demonstrates what parameters would cause collision.",
        elements: {
            semiMajorAxis: 1.0,
            eccentricity: 0.05,
            inclination: 0.1,
            longitudeOfAscendingNode: 180.0,
            argumentOfPeriapsis: 0.0,
            meanAnomaly: 0.0,
        },
        riskLevel: "critical",
    },
    {
        id: "yarkovsky-drift",
        name: "Yarkovsky Effect Drift",
        description: "Long-term orbital drift due to thermal radiation pressure over decades.",
        elements: {
            semiMajorAxis: 0.928,
            eccentricity: 0.195,
            inclination: 3.2,
            longitudeOfAscendingNode: 205.0,
            argumentOfPeriapsis: 127.0,
            meanAnomaly: 0.0,
        },
        riskLevel: "low",
    },
];
