import { BodyState, CelestialBody, IntegrationMethod } from "../types";
import { G } from "../constants";

/**
 * N-body gravitational simulator
 */
export class NBodySimulator {
    private bodies: CelestialBody[];
    private states: BodyState[];
    private integrationMethod: IntegrationMethod;

    constructor(bodies: CelestialBody[], initialStates: BodyState[], integrationMethod: IntegrationMethod = "rk4") {
        this.bodies = bodies;
        this.states = initialStates.map((state) => ({
            position: [...state.position] as [number, number, number],
            velocity: [...state.velocity] as [number, number, number],
        }));
        this.integrationMethod = integrationMethod;
    }

    /**
     * Calculate gravitational acceleration on body i
     */
    private calculateAcceleration(i: number, positions: [number, number, number][]): [number, number, number] {
        const acc: [number, number, number] = [0, 0, 0];
        const pos = positions[i];

        for (let j = 0; j < this.bodies.length; j++) {
            if (i === j) continue;

            const otherPos = positions[j];
            const dx = otherPos[0] - pos[0];
            const dy = otherPos[1] - pos[1];
            const dz = otherPos[2] - pos[2];

            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);

            if (dist < 1e-10) continue; // Avoid division by zero

            const force = (G * this.bodies[j].mass) / distSq;
            const factor = force / dist;

            acc[0] += factor * dx;
            acc[1] += factor * dy;
            acc[2] += factor * dz;
        }

        return acc;
    }

    /**
     * Euler integration method
     */
    private integrateEuler(dt: number): void {
        const newStates: BodyState[] = [];

        for (let i = 0; i < this.states.length; i++) {
            const state = this.states[i];
            const acc = this.calculateAcceleration(
                i,
                this.states.map((s) => s.position)
            );

            const newPos: [number, number, number] = [
                state.position[0] + state.velocity[0] * dt,
                state.position[1] + state.velocity[1] * dt,
                state.position[2] + state.velocity[2] * dt,
            ];

            const newVel: [number, number, number] = [state.velocity[0] + acc[0] * dt, state.velocity[1] + acc[1] * dt, state.velocity[2] + acc[2] * dt];

            newStates.push({ position: newPos, velocity: newVel });
        }

        this.states = newStates;
    }

    /**
     * Velocity Verlet integration method
     */
    private integrateVerlet(dt: number): void {
        // Calculate current accelerations
        const accelerations = this.states.map((_, i) =>
            this.calculateAcceleration(
                i,
                this.states.map((s) => s.position)
            )
        );

        // Update positions
        const newPositions: [number, number, number][] = this.states.map((state, i) => [
            state.position[0] + state.velocity[0] * dt + 0.5 * accelerations[i][0] * dt * dt,
            state.position[1] + state.velocity[1] * dt + 0.5 * accelerations[i][1] * dt * dt,
            state.position[2] + state.velocity[2] * dt + 0.5 * accelerations[i][2] * dt * dt,
        ]);

        // Calculate new accelerations
        const newAccelerations = this.states.map((_, i) => this.calculateAcceleration(i, newPositions));

        // Update velocities
        const newStates: BodyState[] = this.states.map((state, i) => ({
            position: newPositions[i],
            velocity: [
                state.velocity[0] + 0.5 * (accelerations[i][0] + newAccelerations[i][0]) * dt,
                state.velocity[1] + 0.5 * (accelerations[i][1] + newAccelerations[i][1]) * dt,
                state.velocity[2] + 0.5 * (accelerations[i][2] + newAccelerations[i][2]) * dt,
            ],
        }));

        this.states = newStates;
    }

    /**
     * RK4 integration method
     * Correctly implements RK4 for N-body system where all bodies must be advanced together
     */
    private integrateRK4(dt: number): void {
        const n = this.states.length;

        // k1: Calculate accelerations at current state
        const k1v: [number, number, number][] = [];
        const k1p: [number, number, number][] = [];
        for (let i = 0; i < n; i++) {
            k1v.push(
                this.calculateAcceleration(
                    i,
                    this.states.map((s) => s.position)
                )
            );
            k1p.push(this.states[i].velocity);
        }

        // k2: Calculate accelerations at t + dt/2 using k1
        const pos2: [number, number, number][] = this.states.map((s, i) => [
            s.position[0] + k1p[i][0] * (dt / 2),
            s.position[1] + k1p[i][1] * (dt / 2),
            s.position[2] + k1p[i][2] * (dt / 2),
        ]);
        const k2v: [number, number, number][] = [];
        const k2p: [number, number, number][] = [];
        for (let i = 0; i < n; i++) {
            k2v.push(this.calculateAcceleration(i, pos2));
            k2p.push([this.states[i].velocity[0] + k1v[i][0] * (dt / 2), this.states[i].velocity[1] + k1v[i][1] * (dt / 2), this.states[i].velocity[2] + k1v[i][2] * (dt / 2)]);
        }

        // k3: Calculate accelerations at t + dt/2 using k2
        const pos3: [number, number, number][] = this.states.map((s, i) => [
            s.position[0] + k2p[i][0] * (dt / 2),
            s.position[1] + k2p[i][1] * (dt / 2),
            s.position[2] + k2p[i][2] * (dt / 2),
        ]);
        const k3v: [number, number, number][] = [];
        const k3p: [number, number, number][] = [];
        for (let i = 0; i < n; i++) {
            k3v.push(this.calculateAcceleration(i, pos3));
            k3p.push([this.states[i].velocity[0] + k2v[i][0] * (dt / 2), this.states[i].velocity[1] + k2v[i][1] * (dt / 2), this.states[i].velocity[2] + k2v[i][2] * (dt / 2)]);
        }

        // k4: Calculate accelerations at t + dt using k3
        const pos4: [number, number, number][] = this.states.map((s, i) => [s.position[0] + k3p[i][0] * dt, s.position[1] + k3p[i][1] * dt, s.position[2] + k3p[i][2] * dt]);
        const k4v: [number, number, number][] = [];
        const k4p: [number, number, number][] = [];
        for (let i = 0; i < n; i++) {
            k4v.push(this.calculateAcceleration(i, pos4));
            k4p.push([this.states[i].velocity[0] + k3v[i][0] * dt, this.states[i].velocity[1] + k3v[i][1] * dt, this.states[i].velocity[2] + k3v[i][2] * dt]);
        }

        // Combine all k values to get final state
        const newStates: BodyState[] = [];
        for (let i = 0; i < n; i++) {
            const newPos: [number, number, number] = [
                this.states[i].position[0] + (dt / 6) * (k1p[i][0] + 2 * k2p[i][0] + 2 * k3p[i][0] + k4p[i][0]),
                this.states[i].position[1] + (dt / 6) * (k1p[i][1] + 2 * k2p[i][1] + 2 * k3p[i][1] + k4p[i][1]),
                this.states[i].position[2] + (dt / 6) * (k1p[i][2] + 2 * k2p[i][2] + 2 * k3p[i][2] + k4p[i][2]),
            ];

            const newVel: [number, number, number] = [
                this.states[i].velocity[0] + (dt / 6) * (k1v[i][0] + 2 * k2v[i][0] + 2 * k3v[i][0] + k4v[i][0]),
                this.states[i].velocity[1] + (dt / 6) * (k1v[i][1] + 2 * k2v[i][1] + 2 * k3v[i][1] + k4v[i][1]),
                this.states[i].velocity[2] + (dt / 6) * (k1v[i][2] + 2 * k2v[i][2] + 2 * k3v[i][2] + k4v[i][2]),
            ];

            newStates.push({ position: newPos, velocity: newVel });
        }

        this.states = newStates;
    }

    /**
     * Step the simulation forward by dt seconds
     */
    step(dt: number): void {
        switch (this.integrationMethod) {
            case "euler":
                this.integrateEuler(dt);
                break;
            case "verlet":
                this.integrateVerlet(dt);
                break;
            case "rk4":
                this.integrateRK4(dt);
                break;
        }
    }

    /**
     * Get current states
     */
    getStates(): BodyState[] {
        return this.states.map((state) => ({
            position: [...state.position] as [number, number, number],
            velocity: [...state.velocity] as [number, number, number],
        }));
    }

    /**
     * Set integration method
     */
    setIntegrationMethod(method: IntegrationMethod): void {
        this.integrationMethod = method;
    }

    /**
     * Reset states
     */
    resetStates(newStates: BodyState[]): void {
        this.states = newStates.map((state) => ({
            position: [...state.position] as [number, number, number],
            velocity: [...state.velocity] as [number, number, number],
        }));
    }
}
