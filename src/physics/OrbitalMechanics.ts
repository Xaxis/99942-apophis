import { OrbitalElements, StateVector, Vector3D, CONSTANTS } from "../types";

/**
 * Advanced orbital mechanics calculations using Keplerian elements
 * and N-body gravitational perturbations
 */
export class OrbitalMechanics {
    /**
     * Convert orbital elements to Cartesian state vectors (position & velocity)
     * Uses the standard orbital element transformation
     */
    static orbitalElementsToStateVector(
        elements: OrbitalElements,
        centralBodyMass: number,
        currentTime: number,
    ): StateVector {
        const {
            semiMajorAxis,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            argumentOfPeriapsis,
            meanAnomalyAtEpoch,
            epoch,
        } = elements;

        // Convert to radians
        const i = (inclination * Math.PI) / 180;
        const Omega = (longitudeOfAscendingNode * Math.PI) / 180;
        const omega = (argumentOfPeriapsis * Math.PI) / 180;
        const M0 = (meanAnomalyAtEpoch * Math.PI) / 180;

        // Calculate mean motion (rad/s)
        const a = semiMajorAxis * CONSTANTS.AU; // Convert to meters
        const mu = CONSTANTS.G * centralBodyMass;
        const n = Math.sqrt(mu / (a * a * a));

        // Calculate mean anomaly at current time
        const timeSinceEpoch =
            (currentTime - epoch) * CONSTANTS.SECONDS_PER_DAY;
        const M = M0 + n * timeSinceEpoch;

        // Solve Kepler's equation for eccentric anomaly using Newton-Raphson
        const E = this.solveKeplersEquation(M, eccentricity);

        // Calculate true anomaly
        const nu =
            2 *
            Math.atan2(
                Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
                Math.sqrt(1 - eccentricity) * Math.cos(E / 2),
            );

        // Calculate distance
        const r = a * (1 - eccentricity * Math.cos(E));

        // Position in orbital plane
        const xOrbital = r * Math.cos(nu);
        const yOrbital = r * Math.sin(nu);

        // Velocity in orbital plane
        const vFactor = Math.sqrt(mu / a);
        const vxOrbital =
            -(vFactor / Math.sqrt(1 - eccentricity * eccentricity)) *
            Math.sin(E);
        const vyOrbital =
            (vFactor / Math.sqrt(1 - eccentricity * eccentricity)) *
            Math.sqrt(1 - eccentricity * eccentricity) *
            Math.cos(E);

        // Rotation matrices to transform from orbital plane to ecliptic coordinates
        const cosOmega = Math.cos(Omega);
        const sinOmega = Math.sin(Omega);
        const cosomega = Math.cos(omega);
        const sinomega = Math.sin(omega);
        const cosi = Math.cos(i);
        const sini = Math.sin(i);

        // Transform position
        const position: Vector3D = {
            x:
                (cosOmega * cosomega - sinOmega * sinomega * cosi) * xOrbital +
                (-cosOmega * sinomega - sinOmega * cosomega * cosi) * yOrbital,
            y:
                (sinOmega * cosomega + cosOmega * sinomega * cosi) * xOrbital +
                (-sinOmega * sinomega + cosOmega * cosomega * cosi) * yOrbital,
            z: sinomega * sini * xOrbital + cosomega * sini * yOrbital,
        };

        // Transform velocity
        const velocity: Vector3D = {
            x:
                (cosOmega * cosomega - sinOmega * sinomega * cosi) * vxOrbital +
                (-cosOmega * sinomega - sinOmega * cosomega * cosi) * vyOrbital,
            y:
                (sinOmega * cosomega + cosOmega * sinomega * cosi) * vxOrbital +
                (-sinOmega * sinomega + cosOmega * cosomega * cosi) * vyOrbital,
            z: sinomega * sini * vxOrbital + cosomega * sini * vyOrbital,
        };

        return { position, velocity };
    }

    /**
     * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E
     * Using Newton-Raphson iteration
     */
    private static solveKeplersEquation(
        M: number,
        e: number,
        tolerance = 1e-10,
    ): number {
        // Normalize M to [0, 2π]
        M = M % (2 * Math.PI);
        if (M < 0) M += 2 * Math.PI;

        // Initial guess
        let E = M + e * Math.sin(M);

        // Newton-Raphson iteration
        for (let i = 0; i < 100; i++) {
            const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
            E -= dE;
            if (Math.abs(dE) < tolerance) break;
        }

        return E;
    }

    /**
     * Calculate gravitational acceleration from one body on another
     */
    static calculateGravitationalAcceleration(
        position: Vector3D,
        bodyPosition: Vector3D,
        bodyMass: number,
    ): Vector3D {
        const dx = bodyPosition.x - position.x;
        const dy = bodyPosition.y - position.y;
        const dz = bodyPosition.z - position.z;

        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const distance = Math.sqrt(distanceSquared);

        // Avoid singularity
        if (distance < 1e-10) {
            return { x: 0, y: 0, z: 0 };
        }

        const forceMagnitude = (CONSTANTS.G * bodyMass) / distanceSquared;
        const forceDirection = distance;

        return {
            x: (forceMagnitude * dx) / forceDirection,
            y: (forceMagnitude * dy) / forceDirection,
            z: (forceMagnitude * dz) / forceDirection,
        };
    }

    /**
     * Calculate distance between two positions
     */
    static calculateDistance(pos1: Vector3D, pos2: Vector3D): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
