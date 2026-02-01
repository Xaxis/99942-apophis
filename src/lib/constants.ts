import { CelestialBody, OrbitalElements, PresetSimulation } from "./types";

/**
 * Physical constants
 */
export const G = 6.6743e-11; // Gravitational constant (m^3 kg^-1 s^-2)
export const AU = 1.495978707e11; // Astronomical Unit in meters

/**
 * Solar system bodies
 */
export const SUN: CelestialBody = {
    name: "Sun",
    mass: 1.989e30,
    radius: 696000,
    color: 0xfdb813,
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
    satellites: [
        {
            name: "Moon",
            mass: 7.342e22,
            radius: 1737,
            color: 0xaaaaaa,
            orbitalElements: {
                // NASA JPL DE405/LE405 - Geocentric orbital elements (Moon orbits Earth)
                semiMajorAxis: 0.00257, // AU (384,400 km) - Real Moon orbit distance
                eccentricity: 0.0554,
                inclination: 5.16, // degrees - Relative to ecliptic
                longitudeOfAscendingNode: 125.08,
                argumentOfPeriapsis: 318.15,
                meanAnomaly: 135.27,
            },
        },
    ],
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
    satellites: [
        {
            name: "Phobos",
            mass: 1.0659e16, // kg
            radius: 11.267, // km (mean radius)
            color: 0x8b7355,
            orbitalElements: {
                // NASA JPL MAR099 - Laplace plane elements
                semiMajorAxis: 0.0000627, // AU (9,375 km)
                eccentricity: 0.015,
                inclination: 1.1, // degrees
                longitudeOfAscendingNode: 169.2,
                argumentOfPeriapsis: 216.3,
                meanAnomaly: 189.7,
            },
        },
        {
            name: "Deimos",
            mass: 1.4762e15, // kg
            radius: 6.2, // km (mean radius)
            color: 0x9d8b7a,
            orbitalElements: {
                // NASA JPL MAR099 - Laplace plane elements
                semiMajorAxis: 0.000157, // AU (23,457 km)
                eccentricity: 0.0,
                inclination: 1.8, // degrees
                longitudeOfAscendingNode: 54.3,
                argumentOfPeriapsis: 0.0,
                meanAnomaly: 205.0,
            },
        },
    ],
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
    satellites: [
        {
            name: "Io",
            mass: 8.9319e22, // kg
            radius: 1821.6, // km
            color: 0xffff00,
            orbitalElements: {
                // NASA JPL JUP365 - Laplace plane elements
                semiMajorAxis: 0.00282, // AU (421,800 km)
                eccentricity: 0.004,
                inclination: 0.0, // degrees
                longitudeOfAscendingNode: 0.0,
                argumentOfPeriapsis: 49.1,
                meanAnomaly: 330.9,
            },
        },
        {
            name: "Europa",
            mass: 4.7998e22, // kg
            radius: 1560.8, // km
            color: 0xd4c5a9,
            orbitalElements: {
                // NASA JPL JUP365 - Laplace plane elements
                semiMajorAxis: 0.00449, // AU (671,100 km)
                eccentricity: 0.009,
                inclination: 0.5, // degrees
                longitudeOfAscendingNode: 184.0,
                argumentOfPeriapsis: 45.0,
                meanAnomaly: 345.4,
            },
        },
        {
            name: "Ganymede",
            mass: 1.4819e23, // kg
            radius: 2634.1, // km
            color: 0x8b7d6b,
            orbitalElements: {
                // NASA JPL JUP365 - Laplace plane elements
                semiMajorAxis: 0.00716, // AU (1,070,400 km)
                eccentricity: 0.001,
                inclination: 0.2, // degrees
                longitudeOfAscendingNode: 58.5,
                argumentOfPeriapsis: 198.3,
                meanAnomaly: 324.8,
            },
        },
        {
            name: "Callisto",
            mass: 1.0759e23, // kg
            radius: 2410.3, // km
            color: 0x7a6f5d,
            orbitalElements: {
                // NASA JPL JUP365 - Laplace plane elements
                semiMajorAxis: 0.01259, // AU (1,882,700 km)
                eccentricity: 0.007,
                inclination: 0.3, // degrees
                longitudeOfAscendingNode: 309.1,
                argumentOfPeriapsis: 43.8,
                meanAnomaly: 87.4,
            },
        },
    ],
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
    satellites: [
        {
            name: "Mimas",
            mass: 3.7493e19, // kg
            radius: 198.2, // km
            color: 0xc0c0c0,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00124, // AU (185,539 km)
                eccentricity: 0.02,
                inclination: 1.6, // degrees
                longitudeOfAscendingNode: 139.8,
                argumentOfPeriapsis: 334.3,
                meanAnomaly: 127.6,
            },
        },
        {
            name: "Enceladus",
            mass: 1.0802e20, // kg
            radius: 252.1, // km
            color: 0xf0f0f0,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00159, // AU (238,042 km)
                eccentricity: 0.005,
                inclination: 0.0, // degrees
                longitudeOfAscendingNode: 0.0,
                argumentOfPeriapsis: 178.0,
                meanAnomaly: 215.7,
            },
        },
        {
            name: "Tethys",
            mass: 6.1745e20, // kg
            radius: 531.1, // km
            color: 0xd8d8d8,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00197, // AU (294,672 km)
                eccentricity: 0.0,
                inclination: 1.1, // degrees
                longitudeOfAscendingNode: 158.0,
                argumentOfPeriapsis: 0.0,
                meanAnomaly: 257.4,
            },
        },
        {
            name: "Dione",
            mass: 1.0955e21, // kg
            radius: 561.4, // km
            color: 0xc8c8c8,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00252, // AU (377,415 km)
                eccentricity: 0.002,
                inclination: 0.0, // degrees
                longitudeOfAscendingNode: 0.0,
                argumentOfPeriapsis: 290.0,
                meanAnomaly: 325.7,
            },
        },
        {
            name: "Rhea",
            mass: 2.3065e21, // kg
            radius: 763.8, // km
            color: 0xb8b8b8,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00352, // AU (527,068 km)
                eccentricity: 0.001,
                inclination: 0.3, // degrees
                longitudeOfAscendingNode: 306.0,
                argumentOfPeriapsis: 235.0,
                meanAnomaly: 190.7,
            },
        },
        {
            name: "Titan",
            mass: 1.3452e23, // kg
            radius: 2574.7, // km
            color: 0xffa500,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.00817, // AU (1,221,865 km)
                eccentricity: 0.029,
                inclination: 0.3, // degrees
                longitudeOfAscendingNode: 28.1,
                argumentOfPeriapsis: 180.5,
                meanAnomaly: 163.7,
            },
        },
        {
            name: "Iapetus",
            mass: 1.8056e21, // kg
            radius: 734.5, // km
            color: 0x8b8680,
            orbitalElements: {
                // NASA JPL SAT441 - Laplace plane elements
                semiMajorAxis: 0.0238, // AU (3,560,840 km)
                eccentricity: 0.029,
                inclination: 15.5, // degrees
                longitudeOfAscendingNode: 81.1,
                argumentOfPeriapsis: 271.6,
                meanAnomaly: 201.1,
            },
        },
    ],
};

export const URANUS: CelestialBody = {
    name: "Uranus",
    mass: 8.681e25, // Ice giant - affects outer solar system dynamics
    radius: 25362,
    color: 0x4fd0e7,
    orbitalElements: {
        // NASA JPL data (1800 AD - 2050 AD)
        semiMajorAxis: 19.18916464,
        eccentricity: 0.04725744,
        inclination: 0.77263783,
        longitudeOfAscendingNode: 74.01692503,
        argumentOfPeriapsis: 170.9542763 - 74.01692503, // ω = ϖ - Ω
        meanAnomaly: 313.23810451 - 170.9542763, // M = L - ϖ
    },
    satellites: [
        {
            name: "Miranda",
            mass: 6.59e19, // kg
            radius: 235.8, // km
            color: 0xb0b0b0,
            orbitalElements: {
                // NASA JPL URA182 - Equatorial plane elements
                semiMajorAxis: 0.000868, // AU (129,846 km)
                eccentricity: 0.001,
                inclination: 4.4, // degrees
                longitudeOfAscendingNode: 100.9,
                argumentOfPeriapsis: 154.8,
                meanAnomaly: 73.0,
            },
        },
        {
            name: "Ariel",
            mass: 1.353e21, // kg
            radius: 578.9, // km
            color: 0xc8c8c8,
            orbitalElements: {
                // NASA JPL URA182 - Equatorial plane elements
                semiMajorAxis: 0.00128, // AU (191,020 km)
                eccentricity: 0.001,
                inclination: 0.0, // degrees
                longitudeOfAscendingNode: 0.0,
                argumentOfPeriapsis: 115.4,
                meanAnomaly: 156.2,
            },
        },
        {
            name: "Umbriel",
            mass: 1.172e21, // kg
            radius: 584.7, // km
            color: 0x808080,
            orbitalElements: {
                // NASA JPL URA182 - Equatorial plane elements
                semiMajorAxis: 0.00178, // AU (266,000 km)
                eccentricity: 0.004,
                inclination: 0.1, // degrees
                longitudeOfAscendingNode: 33.5,
                argumentOfPeriapsis: 84.8,
                meanAnomaly: 108.0,
            },
        },
        {
            name: "Titania",
            mass: 3.527e21, // kg
            radius: 788.4, // km
            color: 0xd0d0d0,
            orbitalElements: {
                // NASA JPL URA182 - Equatorial plane elements
                semiMajorAxis: 0.00291, // AU (435,910 km)
                eccentricity: 0.001,
                inclination: 0.1, // degrees
                longitudeOfAscendingNode: 99.8,
                argumentOfPeriapsis: 99.8,
                meanAnomaly: 24.6,
            },
        },
        {
            name: "Oberon",
            mass: 3.014e21, // kg
            radius: 761.4, // km
            color: 0xa0a0a0,
            orbitalElements: {
                // NASA JPL URA182 - Equatorial plane elements
                semiMajorAxis: 0.0039, // AU (583,520 km)
                eccentricity: 0.001,
                inclination: 0.1, // degrees
                longitudeOfAscendingNode: 279.8,
                argumentOfPeriapsis: 10.9,
                meanAnomaly: 283.1,
            },
        },
    ],
};

export const NEPTUNE: CelestialBody = {
    name: "Neptune",
    mass: 1.02413e26, // Outermost ice giant - affects Kuiper belt and distant objects
    radius: 24622,
    color: 0x4166f5,
    orbitalElements: {
        // NASA JPL data (1800 AD - 2050 AD)
        semiMajorAxis: 30.06992276,
        eccentricity: 0.00859048,
        inclination: 1.77004347,
        longitudeOfAscendingNode: 131.78422574,
        argumentOfPeriapsis: 44.96476227 - 131.78422574, // ω = ϖ - Ω
        meanAnomaly: -55.12002969 - 44.96476227, // M = L - ϖ
    },
    satellites: [
        {
            name: "Triton",
            mass: 2.14e22, // kg
            radius: 1353.4, // km
            color: 0xf0e68c,
            orbitalElements: {
                // NASA JPL NEP097 - Laplace plane elements (retrograde orbit)
                semiMajorAxis: 0.00237, // AU (354,800 km)
                eccentricity: 0.0,
                inclination: 157.3, // degrees (retrograde)
                longitudeOfAscendingNode: 178.1,
                argumentOfPeriapsis: 0.0,
                meanAnomaly: 63.0,
            },
        },
        {
            name: "Proteus",
            mass: 4.4e19, // kg (estimated)
            radius: 210, // km
            color: 0x909090,
            orbitalElements: {
                // NASA JPL NEP097 - Laplace plane elements
                semiMajorAxis: 0.000786, // AU (117,600 km)
                eccentricity: 0.0,
                inclination: 0.0, // degrees
                longitudeOfAscendingNode: 0.0,
                argumentOfPeriapsis: 0.0,
                meanAnomaly: 276.8,
            },
        },
    ],
};

export const CERES: CelestialBody = {
    name: "1 Ceres",
    mass: 9.3839e20, // kg
    radius: 469.7, // km
    color: 0x8b8680,
    orbitalElements: {
        semiMajorAxis: 2.77, // AU
        eccentricity: 0.0785,
        inclination: 10.6, // degrees
        longitudeOfAscendingNode: 80.3, // degrees
        argumentOfPeriapsis: 73.6, // degrees
        meanAnomaly: 291.4, // degrees
    },
};

export const PALLAS: CelestialBody = {
    name: "2 Pallas",
    mass: 2.04e20, // kg
    radius: 256, // km (mean radius)
    color: 0x9b9b9b,
    orbitalElements: {
        semiMajorAxis: 2.77, // AU
        eccentricity: 0.2302,
        inclination: 34.93, // degrees
        longitudeOfAscendingNode: 172.9, // degrees
        argumentOfPeriapsis: 310.9, // degrees
        meanAnomaly: 40.6, // degrees
    },
};

export const VESTA: CelestialBody = {
    name: "4 Vesta",
    mass: 2.59e20, // kg
    radius: 262.7, // km (mean radius)
    color: 0xb8a898,
    orbitalElements: {
        semiMajorAxis: 2.36, // AU
        eccentricity: 0.0894,
        inclination: 7.1422, // degrees
        longitudeOfAscendingNode: 103.71, // degrees
        argumentOfPeriapsis: 151.66, // degrees
        meanAnomaly: 169.4, // degrees
    },
};

export const HYGIEA: CelestialBody = {
    name: "10 Hygiea",
    mass: 8.32e19, // kg
    radius: 217, // km (mean radius)
    color: 0x7a7a7a,
    orbitalElements: {
        semiMajorAxis: 3.14, // AU
        eccentricity: 0.1146,
        inclination: 3.84, // degrees
        longitudeOfAscendingNode: 283.2, // degrees
        argumentOfPeriapsis: 312.4, // degrees
        meanAnomaly: 316.8, // degrees
    },
};

export const PLUTO: CelestialBody = {
    name: "134340 Pluto",
    mass: 1.3025e22, // kg
    radius: 1188.3, // km
    color: 0xc9b5a0, // tan/beige color
    orbitalElements: {
        semiMajorAxis: 39.482, // AU
        eccentricity: 0.2488,
        inclination: 17.16, // degrees
        longitudeOfAscendingNode: 110.299, // degrees
        argumentOfPeriapsis: 113.834, // degrees
        meanAnomaly: 14.53, // degrees
    },
};

export const APOPHIS: CelestialBody = {
    name: "99942 Apophis",
    mass: 6.1e10, // kg - estimated from ~370m diameter and assumed density
    radius: 0.185, // km - radius (~370m diameter)
    color: 0x8b7355,
    // Orbital elements from NASA JPL Horizons (Epoch: 2459215.5 JD = 2021-Jan-01.0 TDB)
    // Solution JPL#220 (latest as of 2024-Jun-25)
    // Perihelion: 2020-Sep-08.5394224627 (T = 2459101.0394224627 JD)
    orbitalElements: {
        semiMajorAxis: 0.9225071817289903, // AU - NASA JPL Horizons JPL#220
        eccentricity: 0.1915216893501022, // NASA JPL Horizons JPL#220
        inclination: 3.336751320066756, // degrees - NASA JPL Horizons JPL#220
        longitudeOfAscendingNode: 204.0389272089208, // degrees - NASA JPL Horizons JPL#220
        argumentOfPeriapsis: 126.6520518368553, // degrees - NASA JPL Horizons JPL#220
        meanAnomaly: 127.3225632013606, // degrees - NASA JPL Horizons JPL#220 at epoch 2021-Jan-01
    },
};

export const BODIES = [SUN, MERCURY, VENUS, EARTH, MARS, CERES, VESTA, PALLAS, HYGIEA, JUPITER, SATURN, URANUS, NEPTUNE, PLUTO, APOPHIS];

export const PRESET_SIMULATIONS: PresetSimulation[] = [
    {
        id: "current",
        name: "Current Orbit (Safe)",
        description: "Apophis's actual current orbital parameters from NASA JPL. No impact risk for at least 100 years.",
        elements: {
            semiMajorAxis: 0.9225071817289903, // NASA JPL Horizons JPL#220
            eccentricity: 0.1915216893501022, // NASA JPL Horizons JPL#220
            inclination: 3.336751320066756,
            longitudeOfAscendingNode: 204.0389272089208, // NASA JPL Horizons JPL#220
            argumentOfPeriapsis: 126.6520518368553, // NASA JPL Horizons JPL#220
            meanAnomaly: 127.3225632013606, // NASA JPL Horizons JPL#220 at epoch 2021-Jan-01
        },
        riskLevel: "safe",
    },
    {
        id: "2029-approach",
        name: "2029 Close Approach",
        description: "Apophis's actual orbit - speed up time to see the April 13, 2029 flyby at ~31,000 km. Safe but very close.",
        elements: {
            semiMajorAxis: 0.9227, // NASA JPL verified - same as current
            eccentricity: 0.1914,
            inclination: 3.34,
            longitudeOfAscendingNode: 203.96,
            argumentOfPeriapsis: 126.6,
            meanAnomaly: 142.86, // Same starting position - let simulation evolve naturally
        },
        riskLevel: "low",
    },
    {
        id: "reduced-inclination",
        name: "Reduced Inclination Scenario",
        description: "What if Apophis had lower orbital inclination? Increases intersection probability.",
        elements: {
            semiMajorAxis: 0.9227, // Based on NASA JPL data
            eccentricity: 0.1914,
            inclination: 0.5, // Hypothetical reduced inclination
            longitudeOfAscendingNode: 203.96,
            argumentOfPeriapsis: 126.6,
            meanAnomaly: 142.86, // Same starting position as current orbit
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
