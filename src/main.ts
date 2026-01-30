import { NBodySimulator } from "./physics/NBodySimulator";
import { Scene3D } from "./visualization/Scene3D";
import { Controls } from "./ui/Controls";
import { OrbitalMechanics } from "./physics/OrbitalMechanics";
import {
    CONSTANTS,
    APOPHIS_DATA,
    EARTH_ORBITAL_ELEMENTS,
    VENUS_ORBITAL_ELEMENTS,
    MARS_ORBITAL_ELEMENTS,
    CelestialBodyProperties,
    SimulationConfig,
    OrbitalElements,
} from "./types";

/**
 * Main application class
 */
class ApophisSimulator {
    private simulator: NBodySimulator;
    private scene: Scene3D;
    private controls: Controls;
    private isPlaying: boolean = true; // Autoplay on load
    private currentOrbitalElements: OrbitalElements;

    constructor() {
        // Initialize simulation configuration
        const config: SimulationConfig = {
            timeStep: 3600, // 1 hour
            timeScale: 10, // Start slower for better observation (was 100)
            enablePerturbations: true,
            integrationMethod: "rk4",
        };

        // Use today's date as the starting point
        const startDate = new Date();
        const julianDate = this.dateToJulian(startDate);

        // Initialize simulator
        this.simulator = new NBodySimulator(config, julianDate);

        // Add celestial bodies
        this.addCelestialBodies();

        // Initialize 3D scene
        const container = document.getElementById("canvas-container")!;
        this.scene = new Scene3D(container);

        // Add bodies to scene
        this.addBodiesToScene();

        // Initialize UI controls
        this.controls = new Controls();
        this.currentOrbitalElements = { ...APOPHIS_DATA.orbitalElements };
        this.controls.initializeOrbitalControls(this.currentOrbitalElements);
        this.controls.initializeSimulationControls(config);

        // Set up event listeners
        this.setupEventListeners();

        // Initialize body positions BEFORE starting animation
        const initialStates = this.simulator.getAllStates();
        console.log("Initial states:", initialStates);
        initialStates.forEach((state, name) => {
            const distanceAU =
                Math.sqrt(
                    state.position.x ** 2 +
                        state.position.y ** 2 +
                        state.position.z ** 2,
                ) / 1.496e11;
            console.log(
                `${name}: distance = ${distanceAU.toFixed(3)} AU, pos = (${(state.position.x / 1e9).toFixed(2)}, ${(state.position.y / 1e9).toFixed(2)}, ${(state.position.z / 1e9).toFixed(2)}) million km`,
            );
        });
        this.scene.updateBodies(initialStates);

        // Start animation loop
        this.animate();
    }

    /**
     * Add celestial bodies to the simulation
     */
    private addCelestialBodies(): void {
        // Add Sun
        const sun: CelestialBodyProperties = {
            name: "Sun",
            mass: CONSTANTS.SOLAR_MASS,
            radius: CONSTANTS.SUN_RADIUS,
            color: 0xfdb813,
            isCenter: true,
        };
        this.simulator.addBody(sun);

        // Add Earth
        const earth: CelestialBodyProperties = {
            name: "Earth",
            mass: CONSTANTS.EARTH_MASS,
            radius: CONSTANTS.EARTH_RADIUS,
            color: 0x2233ff,
            orbitalElements: EARTH_ORBITAL_ELEMENTS,
        };
        this.simulator.addBody(earth);

        // Add Venus
        const venus: CelestialBodyProperties = {
            name: "Venus",
            mass: CONSTANTS.VENUS_MASS,
            radius: 6051.8,
            color: 0xffc649,
            orbitalElements: VENUS_ORBITAL_ELEMENTS,
        };
        this.simulator.addBody(venus);

        // Add Mars
        const mars: CelestialBodyProperties = {
            name: "Mars",
            mass: CONSTANTS.MARS_MASS,
            radius: 3389.5,
            color: 0xcd5c5c,
            orbitalElements: MARS_ORBITAL_ELEMENTS,
        };
        this.simulator.addBody(mars);

        // Add Apophis
        const apophis: CelestialBodyProperties = {
            name: APOPHIS_DATA.name,
            mass: APOPHIS_DATA.mass,
            radius: APOPHIS_DATA.radius,
            color: APOPHIS_DATA.color,
            orbitalElements: APOPHIS_DATA.orbitalElements,
        };
        this.simulator.addBody(apophis);
    }

    /**
     * Add bodies to 3D scene
     */
    private addBodiesToScene(): void {
        const bodies: CelestialBodyProperties[] = [
            {
                name: "Sun",
                mass: CONSTANTS.SOLAR_MASS,
                radius: CONSTANTS.SUN_RADIUS,
                color: 0xfdb813,
                isCenter: true,
            },
            {
                name: "Earth",
                mass: CONSTANTS.EARTH_MASS,
                radius: CONSTANTS.EARTH_RADIUS,
                color: 0x2233ff,
            },
            {
                name: "Venus",
                mass: CONSTANTS.VENUS_MASS,
                radius: 6051.8,
                color: 0xffc649,
            },
            {
                name: "Mars",
                mass: CONSTANTS.MARS_MASS,
                radius: 3389.5,
                color: 0xcd5c5c,
            },
            {
                name: APOPHIS_DATA.name,
                mass: APOPHIS_DATA.mass,
                radius: APOPHIS_DATA.radius,
                color: APOPHIS_DATA.color,
            },
        ];

        bodies.forEach((body) => this.scene.addBody(body));
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners(): void {
        // Reset button
        document
            .getElementById("reset-apophis")
            ?.addEventListener("click", () => {
                this.resetToApophis2029();
            });

        // Play/Pause button
        const playButton = document.getElementById("toggle-play");
        const updatePlayButton = () => {
            if (playButton) {
                const icon = playButton.querySelector("i");
                const span = playButton.querySelector("span");
                if (icon && span) {
                    icon.setAttribute(
                        "data-lucide",
                        this.isPlaying ? "pause" : "play",
                    );
                    span.textContent = this.isPlaying ? "Pause" : "Play";
                    // Re-initialize icons
                    (window as any).lucide.createIcons();
                }
            }
        };

        playButton?.addEventListener("click", () => {
            this.isPlaying = !this.isPlaying;
            updatePlayButton();
        });

        // Set initial button state
        updatePlayButton();

        // Orbital elements change
        this.controls.onOrbitalElementsChanged((elements) => {
            this.currentOrbitalElements = {
                ...this.currentOrbitalElements,
                ...elements,
            };
            // Update Apophis with new orbital elements
            this.updateApophisOrbit();
        });

        // Simulation config change
        this.controls.onSimulationConfigChanged((config) => {
            this.simulator.updateConfig(config);
        });

        // Toggle labels button
        document
            .getElementById("toggle-labels")
            ?.addEventListener("click", () => {
                this.scene.toggleLabels();
            });

        // Focus on body dropdown
        document
            .getElementById("focus-body")
            ?.addEventListener("change", (event) => {
                const select = event.target as HTMLSelectElement;
                if (select.value) {
                    this.scene.focusOnBody(select.value);
                    // Reset selection
                    select.value = "";
                }
            });
    }

    /**
     * Reset simulation to today's date
     */
    private resetToApophis2029(): void {
        const startDate = new Date();
        const julianDate = this.dateToJulian(startDate);
        this.simulator.reset(julianDate);
        this.scene.clearOrbits();
        this.currentOrbitalElements = { ...APOPHIS_DATA.orbitalElements };
        this.controls.initializeOrbitalControls(this.currentOrbitalElements);
    }

    /**
     * Update Apophis orbit with new elements
     */
    private updateApophisOrbit(): void {
        // This would require rebuilding the simulator with new elements
        // For now, we'll just reset with the new elements
        const startDate = new Date("2029-01-01T00:00:00Z");
        const julianDate = this.dateToJulian(startDate);
        this.simulator.reset(julianDate);
        this.scene.clearOrbits();
    }

    /**
     * Animation loop
     */
    private animate = (): void => {
        requestAnimationFrame(this.animate);

        if (this.isPlaying) {
            // Update simulation
            this.simulator.step();

            // Get current states
            const states = this.simulator.getAllStates();

            // Update 3D scene
            this.scene.updateBodies(states);

            // Update info display
            this.updateInfo(states);
        }

        // Render scene
        this.scene.render();
    };

    /**
     * Update info display
     */
    private updateInfo(states: Map<string, any>): void {
        const apophisState = states.get(APOPHIS_DATA.name);
        const earthState = states.get("Earth");
        const sunState = states.get("Sun");

        if (apophisState && earthState && sunState) {
            // Calculate distances
            const apophisDistance = OrbitalMechanics.calculateDistance(
                apophisState.position,
                sunState.position,
            );
            const earthDistance = OrbitalMechanics.calculateDistance(
                apophisState.position,
                earthState.position,
            );

            // Calculate velocity magnitude
            const velocity = Math.sqrt(
                apophisState.velocity.x ** 2 +
                    apophisState.velocity.y ** 2 +
                    apophisState.velocity.z ** 2,
            );

            // Convert Julian date to readable date
            const currentTime = this.simulator.getCurrentTime();
            const date = this.julianToDate(currentTime);

            // Format date nicely
            const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            this.controls.updateInfo({
                time: formattedDate,
                apophisDistance,
                earthDistance,
                velocity,
            });
        }
    }

    /**
     * Convert Date to Julian date
     */
    private dateToJulian(date: Date): number {
        return date.getTime() / 86400000 + 2440587.5;
    }

    /**
     * Convert Julian date to Date
     */
    private julianToDate(julian: number): Date {
        return new Date((julian - 2440587.5) * 86400000);
    }
}

// Initialize the application
new ApophisSimulator();
