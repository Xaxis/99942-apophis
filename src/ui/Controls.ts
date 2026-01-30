import { OrbitalElements, SimulationConfig } from "../types";

/**
 * Parameter information for tooltips/modals
 */
const PARAMETER_INFO: Record<string, { title: string; description: string }> =
    {
        semiMajorAxis: {
            title: "Semi-Major Axis",
            description:
                "The semi-major axis defines the size of the orbit - it's half the longest diameter of the elliptical orbit. Measured in Astronomical Units (AU), where 1 AU is the average Earth-Sun distance (150 million km). A larger value means a bigger orbit and longer orbital period. For Apophis, this is approximately 0.92 AU, placing it mostly inside Earth's orbit.",
        },
        eccentricity: {
            title: "Eccentricity",
            description:
                "Eccentricity measures how elliptical (stretched) the orbit is. A value of 0 is a perfect circle, while values closer to 1 are more elongated. Apophis has an eccentricity of about 0.19, meaning its orbit is moderately elliptical. This causes its distance from the Sun to vary significantly during each orbit, affecting its speed and position.",
        },
        inclination: {
            title: "Inclination",
            description:
                "Inclination is the tilt of the orbit relative to Earth's orbital plane (the ecliptic), measured in degrees. An inclination of 0° means the orbit is in the same plane as Earth's. Apophis has an inclination of about 3.3°, meaning it crosses Earth's orbital plane twice per orbit. This is crucial for determining potential close approaches.",
        },
        longitudeOfAscendingNode: {
            title: "Longitude of Ascending Node (Ω)",
            description:
                "This defines where the orbit crosses Earth's orbital plane going northward (ascending). Measured in degrees from the vernal equinox (0-360°). It essentially rotates the entire orbital plane around the Sun. Changes to this parameter shift where in space the orbit intersects the ecliptic plane, affecting when and where close approaches might occur.",
        },
        argumentOfPeriapsis: {
            title: "Argument of Periapsis (ω)",
            description:
                "This parameter defines the orientation of the ellipse within its orbital plane - specifically, where the closest point to the Sun (periapsis) is located. Measured in degrees (0-360°). Changing this rotates the ellipse within its plane, which can significantly affect whether the asteroid's path crosses Earth's orbit at a dangerous location.",
        },
        meanAnomaly: {
            title: "Mean Anomaly",
            description:
                "Mean anomaly represents the asteroid's position along its orbit at a specific time, measured in degrees (0-360°). It's like a clock showing where the object is in its orbital cycle. 0° is at periapsis (closest to Sun), 180° is at apoapsis (farthest from Sun). Adjusting this changes the starting position of the asteroid in its orbit.",
        },
        timeScale: {
            title: "Time Scale",
            description:
                "Controls how fast the simulation runs compared to real time. A value of 1 means real-time (very slow for orbital mechanics). Higher values speed up the simulation - for example, 100 means 100 seconds of simulation time pass for every real second. Useful for observing long-term orbital evolution and close approaches that would take years in real time.",
        },
        timeStep: {
            title: "Time Step",
            description:
                "The time interval (in seconds) between each simulation calculation. Smaller steps (e.g., 60s) give more accurate results but run slower. Larger steps (e.g., 86400s = 1 day) run faster but may lose accuracy. For orbital mechanics, 1-hour steps (3600s) typically provide a good balance between speed and accuracy.",
        },
        integrationMethod: {
            title: "Integration Method",
            description:
                "The numerical algorithm used to calculate orbital positions. <strong>Euler</strong>: Simplest but least accurate, can accumulate errors. <strong>Velocity Verlet</strong>: Better energy conservation, good for simple orbits. <strong>RK4 (Runge-Kutta 4th order)</strong>: Most accurate, recommended for precise simulations. RK4 is best for studying close approaches and long-term orbital evolution.",
        },
        perturbations: {
            title: "N-Body Perturbations",
            description:
                "When enabled, the simulation includes gravitational effects from all bodies (Sun, Earth, Venus, Mars) on each other. This is more realistic - in reality, planets slightly tug on asteroids and each other. Disabling this uses simpler 2-body mechanics (only Sun-asteroid interaction). Perturbations are crucial for accurate long-term predictions and understanding how planetary flybys alter orbits.",
        },
    };

/**
 * UI Controls for the simulation
 */
export class Controls {
    private orbitalControlsContainer: HTMLElement;
    private simulationControlsContainer: HTMLElement;
    private infoContainer: HTMLElement;

    private onOrbitalElementsChange?: (elements: OrbitalElements) => void;
    private onSimulationConfigChange?: (
        config: Partial<SimulationConfig>,
    ) => void;

    constructor() {
        this.orbitalControlsContainer =
            document.getElementById("orbital-controls")!;
        this.simulationControlsContainer = document.getElementById(
            "simulation-controls",
        )!;
        this.infoContainer = document.getElementById("info-content")!;

        // Make showParameterInfo accessible globally for inline onclick handlers
        (window as any).showParamInfo = (paramId: string) =>
            this.showParameterInfo(paramId);
    }

    /**
     * Initialize orbital element controls
     */
    initializeOrbitalControls(elements: OrbitalElements): void {
        this.orbitalControlsContainer.innerHTML = "<h2>Orbital Elements</h2>";

        this.addSlider(
            "Semi-major Axis (AU)",
            "semiMajorAxis",
            elements.semiMajorAxis,
            0.5,
            2.0,
            0.001,
            (value) => this.updateOrbitalElement("semiMajorAxis", value),
        );

        this.addSlider(
            "Eccentricity",
            "eccentricity",
            elements.eccentricity,
            0,
            0.9,
            0.001,
            (value) => this.updateOrbitalElement("eccentricity", value),
        );

        this.addSlider(
            "Inclination (°)",
            "inclination",
            elements.inclination,
            0,
            90,
            0.1,
            (value) => this.updateOrbitalElement("inclination", value),
        );

        this.addSlider(
            "Long. of Asc. Node (°)",
            "longitudeOfAscendingNode",
            elements.longitudeOfAscendingNode,
            0,
            360,
            0.1,
            (value) =>
                this.updateOrbitalElement("longitudeOfAscendingNode", value),
        );

        this.addSlider(
            "Arg. of Periapsis (°)",
            "argumentOfPeriapsis",
            elements.argumentOfPeriapsis,
            0,
            360,
            0.1,
            (value) => this.updateOrbitalElement("argumentOfPeriapsis", value),
        );

        this.addSlider(
            "Mean Anomaly (°)",
            "meanAnomalyAtEpoch",
            elements.meanAnomalyAtEpoch,
            0,
            360,
            0.1,
            (value) => this.updateOrbitalElement("meanAnomalyAtEpoch", value),
        );
    }

    /**
     * Initialize simulation controls
     */
    initializeSimulationControls(config: SimulationConfig): void {
        this.simulationControlsContainer.innerHTML =
            "<h2>Simulation Settings</h2>";

        this.addSlider(
            "Time Scale",
            "timeScale",
            config.timeScale,
            1,
            1000,
            1,
            (value) => this.updateSimulationConfig({ timeScale: value }),
        );

        this.addSlider(
            "Time Step (s)",
            "timeStep",
            config.timeStep,
            60,
            86400,
            60,
            (value) => this.updateSimulationConfig({ timeStep: value }),
        );

        // Integration method selector
        const methodGroup = document.createElement("div");
        methodGroup.className = "control-group";

        const methodLabelWrapper = document.createElement("div");
        methodLabelWrapper.className = "label-with-info";
        methodLabelWrapper.innerHTML = `
      <div style="display: flex; align-items: center;">
        <label style="margin-bottom: 0;">Integration Method</label>
        <button class="info-icon-btn" onclick="document.querySelector('[data-controls]').showParamInfo('integrationMethod')">
          <i data-lucide="info" style="width: 14px; height: 14px"></i>
        </button>
      </div>
    `;

        const methodSelect = document.createElement("select");
        methodSelect.id = "integration-method";
        methodSelect.style.cssText =
            "width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 8px; margin-top: 8px;";
        methodSelect.innerHTML = `
      <option value="euler" ${config.integrationMethod === "euler" ? "selected" : ""}>Euler (Fast)</option>
      <option value="verlet" ${config.integrationMethod === "verlet" ? "selected" : ""}>Verlet (Balanced)</option>
      <option value="rk4" ${config.integrationMethod === "rk4" ? "selected" : ""}>RK4 (Accurate)</option>
    `;

        methodGroup.appendChild(methodLabelWrapper);
        methodGroup.appendChild(methodSelect);
        this.simulationControlsContainer.appendChild(methodGroup);

        methodSelect.addEventListener("change", () => {
            this.updateSimulationConfig({
                integrationMethod: methodSelect.value as
                    | "euler"
                    | "verlet"
                    | "rk4",
            });
        });

        // Perturbations toggle
        const perturbGroup = document.createElement("div");
        perturbGroup.className = "control-group";

        const perturbLabelWrapper = document.createElement("div");
        perturbLabelWrapper.style.display = "flex";
        perturbLabelWrapper.style.alignItems = "center";
        perturbLabelWrapper.style.gap = "8px";

        const perturbLabel = document.createElement("label");
        perturbLabel.style.marginBottom = "0";
        perturbLabel.style.display = "flex";
        perturbLabel.style.alignItems = "center";
        perturbLabel.style.gap = "8px";
        perturbLabel.style.cursor = "pointer";

        const perturbCheckbox = document.createElement("input");
        perturbCheckbox.type = "checkbox";
        perturbCheckbox.id = "perturbations";
        perturbCheckbox.checked = config.enablePerturbations;

        const perturbText = document.createTextNode(
            "Enable N-body Perturbations",
        );

        const perturbInfoBtn = document.createElement("button");
        perturbInfoBtn.className = "info-icon-btn";
        perturbInfoBtn.innerHTML =
            '<i data-lucide="info" style="width: 14px; height: 14px"></i>';
        perturbInfoBtn.onclick = () => this.showParameterInfo("perturbations");

        perturbLabel.appendChild(perturbCheckbox);
        perturbLabel.appendChild(perturbText);
        perturbLabelWrapper.appendChild(perturbLabel);
        perturbLabelWrapper.appendChild(perturbInfoBtn);

        perturbGroup.appendChild(perturbLabelWrapper);
        this.simulationControlsContainer.appendChild(perturbGroup);

        perturbCheckbox.addEventListener("change", () => {
            this.updateSimulationConfig({
                enablePerturbations: perturbCheckbox.checked,
            });
        });

        // Re-initialize Lucide icons
        (window as any).lucide?.createIcons();
    }

    /**
     * Update info display
     */
    updateInfo(data: {
        time: string;
        apophisDistance: number;
        earthDistance: number;
        velocity: number;
    }): void {
        const earthDistanceAU = (data.earthDistance / 1.496e11).toFixed(4);
        const apophisDistanceAU = (data.apophisDistance / 1.496e11).toFixed(3);

        this.infoContainer.innerHTML = `
      <div class="info-item">
        <span class="info-label">Current Date</span>
        <div class="info-value">${data.time}</div>
      </div>
      <div class="info-item">
        <span class="info-label">Apophis Distance from Sun</span>
        <div class="info-value">${apophisDistanceAU} AU</div>
      </div>
      <div class="info-item">
        <span class="info-label">Apophis Distance from Earth</span>
        <div class="info-value">${earthDistanceAU} AU</div>
      </div>
      <div class="info-item">
        <span class="info-label">Apophis Velocity</span>
        <div class="info-value">${(data.velocity / 1000).toFixed(2)} km/s</div>
      </div>
    `;
    }

    /**
     * Set orbital elements change callback
     */
    onOrbitalElementsChanged(
        callback: (elements: OrbitalElements) => void,
    ): void {
        this.onOrbitalElementsChange = callback;
    }

    /**
     * Set simulation config change callback
     */
    onSimulationConfigChanged(
        callback: (config: Partial<SimulationConfig>) => void,
    ): void {
        this.onSimulationConfigChange = callback;
    }

    /**
     * Update orbital element
     */
    private updateOrbitalElement(
        key: keyof OrbitalElements,
        value: number,
    ): void {
        if (this.onOrbitalElementsChange) {
            const elements = {} as OrbitalElements;
            elements[key] = value;
            this.onOrbitalElementsChange(elements);
        }
    }

    /**
     * Update simulation config
     */
    private updateSimulationConfig(config: Partial<SimulationConfig>): void {
        if (this.onSimulationConfigChange) {
            this.onSimulationConfigChange(config);
        }
    }

    /**
     * Add a slider control
     */
    private addSlider(
        label: string,
        id: string,
        value: number,
        min: number,
        max: number,
        step: number,
        onChange: (value: number) => void,
    ): void {
        const group = document.createElement("div");
        group.className = "control-group";

        const valueDisplay = document.createElement("span");
        valueDisplay.className = "value-display";
        valueDisplay.textContent = value.toFixed(3);

        const labelWrapper = document.createElement("div");
        labelWrapper.className = "label-with-info";

        const labelElement = document.createElement("label");
        labelElement.textContent = label;
        labelElement.style.marginBottom = "0";

        // Add info icon if parameter info exists
        if (PARAMETER_INFO[id]) {
            const infoBtn = document.createElement("button");
            infoBtn.className = "info-icon-btn";
            infoBtn.innerHTML =
                '<i data-lucide="info" style="width: 14px; height: 14px"></i>';
            infoBtn.onclick = () => this.showParameterInfo(id);

            const labelContainer = document.createElement("div");
            labelContainer.style.display = "flex";
            labelContainer.style.alignItems = "center";
            labelContainer.appendChild(labelElement);
            labelContainer.appendChild(infoBtn);

            labelWrapper.appendChild(labelContainer);
            labelWrapper.appendChild(valueDisplay);
        } else {
            labelElement.appendChild(valueDisplay);
            labelWrapper.appendChild(labelElement);
        }

        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = id;
        slider.min = min.toString();
        slider.max = max.toString();
        slider.step = step.toString();
        slider.value = value.toString();

        slider.addEventListener("input", () => {
            const newValue = parseFloat(slider.value);
            valueDisplay.textContent = newValue.toFixed(3);
            onChange(newValue);
        });

        group.appendChild(labelWrapper);
        group.appendChild(slider);
        this.orbitalControlsContainer.appendChild(group);

        // Re-initialize Lucide icons
        (window as any).lucide?.createIcons();
    }

    /**
     * Show parameter information modal
     */
    private showParameterInfo(paramId: string): void {
        const info = PARAMETER_INFO[paramId];
        if (!info) return;

        const modal = document.getElementById("param-info-modal");
        const title = document.getElementById("param-modal-title");
        const content = document.getElementById("param-modal-content");

        if (modal && title && content) {
            title.textContent = info.title;
            content.innerHTML = `
                <div class="modal-section">
                    <p>${info.description}</p>
                </div>
            `;
            modal.style.display = "block";
            (window as any).lucide?.createIcons();
        }
    }
}
