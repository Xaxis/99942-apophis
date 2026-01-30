import { OrbitalElements } from "../types";

/**
 * Calculate the Minimum Orbit Intersection Distance (MOID) between Apophis and Earth
 * This is a simplified calculation based on orbital elements
 */
export function calculateMOID(apophisElements: OrbitalElements): number {
    const { semiMajorAxis, eccentricity, inclination } = apophisElements;

    // Earth's orbital parameters (simplified circular orbit)
    const earthA = 1.0; // AU
    const earthE = 0.0167;

    // Calculate perihelion and aphelion distances
    const apophisQ = semiMajorAxis * (1 - eccentricity); // perihelion
    const apophisQ2 = semiMajorAxis * (1 + eccentricity); // aphelion

    const earthQ = earthA * (1 - earthE);
    const earthQ2 = earthA * (1 + earthE);

    // Check if orbits can intersect
    const orbitsCross = apophisQ < earthQ2 && apophisQ2 > earthQ;

    if (!orbitsCross) {
        // Orbits don't cross - calculate minimum distance
        return Math.min(Math.abs(apophisQ - earthQ2), Math.abs(apophisQ2 - earthQ));
    }

    // Orbits cross - calculate MOID considering inclination
    // Simplified: MOID increases with inclination
    const inclinationRad = (inclination * Math.PI) / 180;
    const moid = Math.abs(earthA - semiMajorAxis) * Math.sin(inclinationRad);

    return Math.max(moid, 0.0001); // Minimum 0.0001 AU
}

/**
 * Calculate impact probability based on orbital elements
 * Returns a value between 0 (no risk) and 1 (certain impact)
 */
export function calculateImpactProbability(
    apophisElements: OrbitalElements,
    currentDistance: number // in AU
): number {
    const moid = calculateMOID(apophisElements);

    // Earth's sphere of influence (Hill sphere radius ~ 0.01 AU)
    const earthSOI = 0.01; // AU

    // Calculate risk based on MOID
    let riskScore = 0;

    if (moid < 0.00005) {
        // Extremely close approach - critical risk (< 7,500 km)
        riskScore = 0.95;
    } else if (moid < 0.0001) {
        // Very close approach - high risk (< 15,000 km)
        riskScore = 0.8;
    } else if (moid < 0.0005) {
        // Close approach - elevated risk (< 75,000 km)
        riskScore = 0.5;
    } else if (moid < 0.002) {
        // Potentially hazardous - moderate risk (< 300,000 km)
        riskScore = 0.25;
    } else if (moid < 0.005) {
        // Within monitoring range - low risk (< 750,000 km)
        riskScore = 0.08;
    } else {
        // Safe distance - minimal risk
        riskScore = Math.max(0, 0.005);
    }

    // Adjust based on current distance (only if very close right now)
    if (currentDistance < 0.0001) {
        // Extremely close right now (< 15,000 km)
        riskScore = Math.max(riskScore, 0.95);
    } else if (currentDistance < 0.0005) {
        // Very close right now (< 75,000 km)
        riskScore = Math.max(riskScore, 0.7);
    } else if (currentDistance < 0.002) {
        // Close right now (< 300,000 km)
        riskScore = Math.max(riskScore, 0.3);
    }

    return riskScore;
}

/**
 * Calculate the Torino Scale (0-10) for impact hazard
 * Based on impact probability and kinetic energy
 */
export function calculateTorinoScale(
    impactProbability: number,
    asteroidDiameter: number = 370 // meters
): number {
    // Estimate kinetic energy (simplified)
    // E = 0.5 * m * v^2, where v ~ 30 km/s for NEOs
    const density = 2600; // kg/m^3 (typical for S-type asteroid)
    const volume = (4 / 3) * Math.PI * Math.pow(asteroidDiameter / 2, 3);
    const mass = volume * density;
    const velocity = 30000; // m/s
    const energy = 0.5 * mass * velocity * velocity; // Joules
    const megatons = energy / 4.184e15; // Convert to megatons TNT

    // Torino scale logic
    if (impactProbability < 0.01) {
        return 0; // No hazard
    } else if (impactProbability < 0.1) {
        if (megatons < 1000) return 1;
        return 2;
    } else if (impactProbability < 0.5) {
        if (megatons < 1000) return 3;
        if (megatons < 100000) return 4;
        return 5;
    } else {
        if (megatons < 1000) return 6;
        if (megatons < 100000) return 7;
        if (megatons < 1000000) return 8;
        if (megatons < 100000000) return 9;
        return 10;
    }
}

/**
 * Get risk level description
 */
export function getRiskLevel(probability: number): {
    level: string;
    color: string;
    description: string;
} {
    if (probability < 0.01) {
        return {
            level: "MINIMAL",
            color: "#10b981", // green
            description: "No significant risk of impact",
        };
    } else if (probability < 0.1) {
        return {
            level: "LOW",
            color: "#3b82f6", // blue
            description: "Routine monitoring recommended",
        };
    } else if (probability < 0.3) {
        return {
            level: "MODERATE",
            color: "#f59e0b", // amber
            description: "Close monitoring warranted",
        };
    } else if (probability < 0.6) {
        return {
            level: "ELEVATED",
            color: "#f97316", // orange
            description: "Threatening close approach",
        };
    } else if (probability < 0.9) {
        return {
            level: "HIGH",
            color: "#ef4444", // red
            description: "Collision is likely",
        };
    } else {
        return {
            level: "CRITICAL",
            color: "#dc2626", // dark red
            description: "Impact imminent",
        };
    }
}
