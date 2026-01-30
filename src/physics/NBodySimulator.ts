import {
    StateVector,
    Vector3D,
    CelestialBodyProperties,
    SimulationConfig,
} from "../types";
import { OrbitalMechanics } from "./OrbitalMechanics";

/**
 * N-body gravitational simulation with multiple integration methods
 */
export class NBodySimulator {
    private bodies: Map<string, CelestialBodyProperties> = new Map();
    private states: Map<string, StateVector> = new Map();
    private config: SimulationConfig;
    private currentTime: number; // Julian date

    constructor(config: SimulationConfig, initialTime: number) {
        this.config = config;
        this.currentTime = initialTime;
    }

    /**
     * Add a celestial body to the simulation
     */
    addBody(body: CelestialBodyProperties, initialState?: StateVector): void {
        this.bodies.set(body.name, body);

        if (initialState) {
            this.states.set(body.name, initialState);
        } else if (body.orbitalElements && !body.isCenter) {
            // Calculate initial state from orbital elements
            const centerBody = Array.from(this.bodies.values()).find(
                (b) => b.isCenter,
            );
            if (centerBody) {
                const state = OrbitalMechanics.orbitalElementsToStateVector(
                    body.orbitalElements,
                    centerBody.mass,
                    this.currentTime,
                );
                this.states.set(body.name, state);
            }
        } else if (body.isCenter) {
            // Center body at origin with zero velocity
            this.states.set(body.name, {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
            });
        }
    }

    /**
     * Update simulation by one time step
     */
    step(): void {
        const dt = this.config.timeStep * this.config.timeScale;

        switch (this.config.integrationMethod) {
            case "euler":
                this.eulerStep(dt);
                break;
            case "verlet":
                this.verletStep(dt);
                break;
            case "rk4":
                this.rk4Step(dt);
                break;
        }

        this.currentTime += dt / 86400; // Convert seconds to days
    }

    /**
     * Euler integration (simple but less accurate)
     */
    private eulerStep(dt: number): void {
        const accelerations = this.calculateAccelerations();

        this.states.forEach((state, name) => {
            const acc = accelerations.get(name)!;

            // Update velocity
            state.velocity.x += acc.x * dt;
            state.velocity.y += acc.y * dt;
            state.velocity.z += acc.z * dt;

            // Update position
            state.position.x += state.velocity.x * dt;
            state.position.y += state.velocity.y * dt;
            state.position.z += state.velocity.z * dt;
        });
    }

    /**
     * Velocity Verlet integration (better energy conservation)
     */
    private verletStep(dt: number): void {
        const accelerations = this.calculateAccelerations();

        // Update positions and half-step velocities
        this.states.forEach((state, name) => {
            const acc = accelerations.get(name)!;

            state.position.x += state.velocity.x * dt + 0.5 * acc.x * dt * dt;
            state.position.y += state.velocity.y * dt + 0.5 * acc.y * dt * dt;
            state.position.z += state.velocity.z * dt + 0.5 * acc.z * dt * dt;

            state.velocity.x += 0.5 * acc.x * dt;
            state.velocity.y += 0.5 * acc.y * dt;
            state.velocity.z += 0.5 * acc.z * dt;
        });

        // Recalculate accelerations at new positions
        const newAccelerations = this.calculateAccelerations();

        // Complete velocity update
        this.states.forEach((state, name) => {
            const acc = newAccelerations.get(name)!;
            state.velocity.x += 0.5 * acc.x * dt;
            state.velocity.y += 0.5 * acc.y * dt;
            state.velocity.z += 0.5 * acc.z * dt;
        });
    }

    /**
     * Runge-Kutta 4th order integration (most accurate)
     */
    private rk4Step(dt: number): void {
        const states = Array.from(this.states.entries());

        // Calculate k1
        const k1 = this.calculateDerivatives(states);

        // Calculate k2
        const states2 = this.addDerivatives(states, k1, dt / 2);
        const k2 = this.calculateDerivatives(states2);

        // Calculate k3
        const states3 = this.addDerivatives(states, k2, dt / 2);
        const k3 = this.calculateDerivatives(states3);

        // Calculate k4
        const states4 = this.addDerivatives(states, k3, dt);
        const k4 = this.calculateDerivatives(states4);

        // Update states using weighted average
        this.states.forEach((state, name) => {
            const k1v = k1.get(name)!;
            const k2v = k2.get(name)!;
            const k3v = k3.get(name)!;
            const k4v = k4.get(name)!;

            state.position.x +=
                (dt / 6) *
                (k1v.velocity.x +
                    2 * k2v.velocity.x +
                    2 * k3v.velocity.x +
                    k4v.velocity.x);
            state.position.y +=
                (dt / 6) *
                (k1v.velocity.y +
                    2 * k2v.velocity.y +
                    2 * k3v.velocity.y +
                    k4v.velocity.y);
            state.position.z +=
                (dt / 6) *
                (k1v.velocity.z +
                    2 * k2v.velocity.z +
                    2 * k3v.velocity.z +
                    k4v.velocity.z);

            state.velocity.x +=
                (dt / 6) *
                (k1v.acceleration.x +
                    2 * k2v.acceleration.x +
                    2 * k3v.acceleration.x +
                    k4v.acceleration.x);
            state.velocity.y +=
                (dt / 6) *
                (k1v.acceleration.y +
                    2 * k2v.acceleration.y +
                    2 * k3v.acceleration.y +
                    k4v.acceleration.y);
            state.velocity.z +=
                (dt / 6) *
                (k1v.acceleration.z +
                    2 * k2v.acceleration.z +
                    2 * k3v.acceleration.z +
                    k4v.acceleration.z);
        });
    }

    /**
     * Calculate derivatives for RK4 integration
     */
    private calculateDerivatives(
        states: [string, StateVector][],
    ): Map<string, { velocity: Vector3D; acceleration: Vector3D }> {
        const derivatives = new Map<
            string,
            { velocity: Vector3D; acceleration: Vector3D }
        >();
        const stateMap = new Map(states);

        states.forEach(([name, state]) => {
            const body = this.bodies.get(name)!;
            let acceleration = { x: 0, y: 0, z: 0 };

            if (!body.isCenter && this.config.enablePerturbations) {
                // Calculate gravitational acceleration from all other bodies
                this.bodies.forEach((otherBody, otherName) => {
                    if (otherName !== name) {
                        const otherState = stateMap.get(otherName)!;
                        const acc =
                            OrbitalMechanics.calculateGravitationalAcceleration(
                                state.position,
                                otherState.position,
                                otherBody.mass,
                            );
                        acceleration.x += acc.x;
                        acceleration.y += acc.y;
                        acceleration.z += acc.z;
                    }
                });
            } else if (!body.isCenter) {
                // Only calculate acceleration from central body
                const centerBody = Array.from(this.bodies.entries()).find(
                    ([_, b]) => b.isCenter,
                );
                if (centerBody) {
                    const [centerName, _] = centerBody;
                    const centerState = stateMap.get(centerName)!;
                    acceleration =
                        OrbitalMechanics.calculateGravitationalAcceleration(
                            state.position,
                            centerState.position,
                            this.bodies.get(centerName)!.mass,
                        );
                }
            }

            derivatives.set(name, {
                velocity: { ...state.velocity },
                acceleration,
            });
        });

        return derivatives;
    }

    /**
     * Add derivatives to states for RK4 intermediate steps
     */
    private addDerivatives(
        states: [string, StateVector][],
        derivatives: Map<
            string,
            { velocity: Vector3D; acceleration: Vector3D }
        >,
        dt: number,
    ): [string, StateVector][] {
        return states.map(([name, state]) => {
            const deriv = derivatives.get(name)!;
            return [
                name,
                {
                    position: {
                        x: state.position.x + deriv.velocity.x * dt,
                        y: state.position.y + deriv.velocity.y * dt,
                        z: state.position.z + deriv.velocity.z * dt,
                    },
                    velocity: {
                        x: state.velocity.x + deriv.acceleration.x * dt,
                        y: state.velocity.y + deriv.acceleration.y * dt,
                        z: state.velocity.z + deriv.acceleration.z * dt,
                    },
                },
            ];
        });
    }

    /**
     * Calculate accelerations for all bodies
     */
    private calculateAccelerations(): Map<string, Vector3D> {
        const accelerations = new Map<string, Vector3D>();

        this.states.forEach((state, name) => {
            const body = this.bodies.get(name)!;
            let totalAcceleration = { x: 0, y: 0, z: 0 };

            if (!body.isCenter) {
                if (this.config.enablePerturbations) {
                    // Calculate gravitational acceleration from all other bodies
                    this.bodies.forEach((otherBody, otherName) => {
                        if (otherName !== name) {
                            const otherState = this.states.get(otherName)!;
                            const acc =
                                OrbitalMechanics.calculateGravitationalAcceleration(
                                    state.position,
                                    otherState.position,
                                    otherBody.mass,
                                );
                            totalAcceleration.x += acc.x;
                            totalAcceleration.y += acc.y;
                            totalAcceleration.z += acc.z;
                        }
                    });
                } else {
                    // Only calculate acceleration from central body (2-body problem)
                    const centerBody = Array.from(this.bodies.values()).find(
                        (b) => b.isCenter,
                    );
                    if (centerBody) {
                        const centerState = this.states.get(centerBody.name)!;
                        totalAcceleration =
                            OrbitalMechanics.calculateGravitationalAcceleration(
                                state.position,
                                centerState.position,
                                centerBody.mass,
                            );
                    }
                }
            }

            accelerations.set(name, totalAcceleration);
        });

        return accelerations;
    }

    /**
     * Get current state of a body
     */
    getState(name: string): StateVector | undefined {
        return this.states.get(name);
    }

    /**
     * Get all body states
     */
    getAllStates(): Map<string, StateVector> {
        return new Map(this.states);
    }

    /**
     * Get current simulation time
     */
    getCurrentTime(): number {
        return this.currentTime;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<SimulationConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Reset simulation to initial conditions
     */
    reset(initialTime: number): void {
        this.currentTime = initialTime;
        this.states.clear();

        // Recalculate initial states
        this.bodies.forEach((body) => {
            if (body.orbitalElements && !body.isCenter) {
                const centerBody = Array.from(this.bodies.values()).find(
                    (b) => b.isCenter,
                );
                if (centerBody) {
                    const state = OrbitalMechanics.orbitalElementsToStateVector(
                        body.orbitalElements,
                        centerBody.mass,
                        this.currentTime,
                    );
                    this.states.set(body.name, state);
                }
            } else if (body.isCenter) {
                this.states.set(body.name, {
                    position: { x: 0, y: 0, z: 0 },
                    velocity: { x: 0, y: 0, z: 0 },
                });
            }
        });
    }
}
