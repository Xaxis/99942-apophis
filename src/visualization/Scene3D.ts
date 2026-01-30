import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { StateVector, CelestialBodyProperties, CONSTANTS } from "../types";

/**
 * 3D visualization using Three.js
 */
export class Scene3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private labelRenderer: CSS2DRenderer;
    private controls: OrbitControls;
    private bodies: Map<string, THREE.Mesh> = new Map();
    private labels: Map<string, CSS2DObject> = new Map();
    private orbits: Map<string, THREE.Line> = new Map();
    private orbitPoints: Map<string, THREE.Vector3[]> = new Map();
    private labelsVisible: boolean = true;
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000814);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000 * CONSTANTS.AU,
        );
        this.camera.position.set(
            2 * CONSTANTS.AU,
            1 * CONSTANTS.AU,
            2 * CONSTANTS.AU,
        );

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Create CSS2D renderer for labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(
            container.clientWidth,
            container.clientHeight,
        );
        this.labelRenderer.domElement.style.position = "absolute";
        this.labelRenderer.domElement.style.top = "0";
        this.labelRenderer.domElement.style.pointerEvents = "none";
        container.appendChild(this.labelRenderer.domElement);

        // Add orbit controls
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement,
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1e7;
        this.controls.maxDistance = 5 * CONSTANTS.AU;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 5, 0);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Add coordinate axes helper for debugging (optional)
        // const axesHelper = new THREE.AxesHelper(CONSTANTS.AU);
        // this.scene.add(axesHelper);

        // Add stars background
        this.addStarField();

        // Handle window resize
        window.addEventListener("resize", () => this.onWindowResize(container));

        // Handle clicks for focusing on bodies
        container.addEventListener("click", (event) =>
            this.onMouseClick(event),
        );
    }

    /**
     * Add a celestial body to the scene
     */
    addBody(body: CelestialBodyProperties): void {
        // Use much smaller scaling - bodies should be visible but not dominate
        // 1 AU = 1.496e11 meters
        let visualRadius: number;

        if (body.isCenter) {
            // Sun - small but visible point
            visualRadius = 5e8; // 500,000 km
        } else if (body.radius > 1000) {
            // Planets - tiny but visible
            visualRadius = body.radius * 1000 * 20; // 20x scale
        } else {
            // Small bodies like asteroids - make them visible
            visualRadius = body.radius * 1000 * 50000; // 50,000x scale
        }

        const geometry = new THREE.SphereGeometry(visualRadius, 32, 32);

        // Use different materials for Sun vs other bodies
        let material: THREE.Material;
        if (body.isCenter) {
            // Sun: use emissive material that glows
            material = new THREE.MeshBasicMaterial({
                color: body.color,
            });
        } else {
            // Other bodies: use standard material with lighting
            material = new THREE.MeshStandardMaterial({
                color: body.color,
                emissive: body.color,
                emissiveIntensity: 0.1, // Slight glow for visibility
                roughness: 0.8,
                metalness: 0.2,
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = body.name;
        this.scene.add(mesh);
        this.bodies.set(body.name, mesh);

        console.log(
            `Added body: ${body.name}, radius: ${visualRadius.toExponential(2)}m, color: #${body.color.toString(16)}`,
        );

        // Add label positioned above the body
        this.addLabel(body.name, mesh, visualRadius);

        // Initialize orbit trail
        this.orbitPoints.set(body.name, []);
    }

    /**
     * Add a text label to a body, positioned above it
     */
    private addLabel(name: string, mesh: THREE.Mesh, bodyRadius: number): void {
        const labelDiv = document.createElement("div");
        labelDiv.className = "body-label";
        labelDiv.textContent = name;
        labelDiv.style.color = "#ffffff";
        labelDiv.style.fontSize = "11px";
        labelDiv.style.fontFamily = "Arial, sans-serif";
        labelDiv.style.fontWeight = "600";
        labelDiv.style.padding = "2px 6px";
        labelDiv.style.background = "rgba(0, 0, 0, 0.75)";
        labelDiv.style.borderRadius = "3px";
        labelDiv.style.border = "1px solid rgba(255, 255, 255, 0.5)";
        labelDiv.style.whiteSpace = "nowrap";
        labelDiv.style.userSelect = "none";
        labelDiv.style.cursor = "pointer";
        labelDiv.style.transition = "opacity 0.2s";

        const label = new CSS2DObject(labelDiv);
        // Position label above the body (2x the radius above center for better separation)
        label.position.set(0, bodyRadius * 2.0, 0);
        mesh.add(label);
        this.labels.set(name, label);
    }

    /**
     * Update body positions
     */
    updateBodies(states: Map<string, StateVector>): void {
        states.forEach((state, name) => {
            const mesh = this.bodies.get(name);
            if (mesh) {
                mesh.position.set(
                    state.position.x,
                    state.position.z,
                    -state.position.y,
                );

                // Update orbit trail
                const points = this.orbitPoints.get(name)!;
                const newPoint = new THREE.Vector3(
                    state.position.x,
                    state.position.z,
                    -state.position.y,
                );

                points.push(newPoint);

                // Limit orbit trail length
                const maxPoints = 1000;
                if (points.length > maxPoints) {
                    points.shift();
                }

                // Update orbit line
                this.updateOrbitLine(name, points);
            }
        });
    }

    /**
     * Update orbit trail line
     */
    private updateOrbitLine(name: string, points: THREE.Vector3[]): void {
        // Remove old line
        const oldLine = this.orbits.get(name);
        if (oldLine) {
            this.scene.remove(oldLine);
            oldLine.geometry.dispose();
            (oldLine.material as THREE.Material).dispose();
        }

        // Create new line
        if (points.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            // Get color from the body mesh
            const mesh = this.bodies.get(name);
            const bodyColor = mesh
                ? (mesh.material as THREE.MeshStandardMaterial).color
                : new THREE.Color(0x4ecdc4);

            const material = new THREE.LineBasicMaterial({
                color: bodyColor,
                opacity: 0.5,
                transparent: true,
            });
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.orbits.set(name, line);
        }
    }

    /**
     * Clear orbit trails
     */
    clearOrbits(): void {
        this.orbitPoints.forEach((_, name) => {
            this.orbitPoints.set(name, []);
        });
        this.orbits.forEach((line) => {
            this.scene.remove(line);
            line.geometry.dispose();
            (line.material as THREE.Material).dispose();
        });
        this.orbits.clear();
    }

    /**
     * Add star field background
     */
    private addStarField(): void {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5e9,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
        });

        const starsVertices = [];
        // Reduced to 2000 stars for less density
        for (let i = 0; i < 2000; i++) {
            const x = (Math.random() - 0.5) * 10 * CONSTANTS.AU;
            const y = (Math.random() - 0.5) * 10 * CONSTANTS.AU;
            const z = (Math.random() - 0.5) * 10 * CONSTANTS.AU;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(starsVertices, 3),
        );
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    /**
     * Handle window resize
     */
    private onWindowResize(container: HTMLElement): void {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.labelRenderer.setSize(
            container.clientWidth,
            container.clientHeight,
        );
    }

    /**
     * Render the scene
     */
    render(): void {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    /**
     * Get camera for external manipulation
     */
    getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    /**
     * Get controls for external manipulation
     */
    getControls(): OrbitControls {
        return this.controls;
    }

    /**
     * Handle mouse click to focus on bodies
     */
    private onMouseClick(event: MouseEvent): void {
        // Calculate mouse position in normalized device coordinates
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections
        const bodiesArray = Array.from(this.bodies.values());
        const intersects = this.raycaster.intersectObjects(bodiesArray);

        if (intersects.length > 0) {
            const clickedBody = intersects[0].object as THREE.Mesh;
            this.focusOnBody(clickedBody.name);
        }
    }

    /**
     * Focus camera on a specific body
     */
    focusOnBody(bodyName: string): void {
        const mesh = this.bodies.get(bodyName);
        if (!mesh) return;

        const position = mesh.position;
        const geometry = mesh.geometry as THREE.SphereGeometry;
        const radius =
            geometry.parameters.radius ||
            (mesh.geometry.boundingSphere?.radius ?? 1e10);

        // Calculate appropriate distance based on body size
        const distance = radius * 5; // 5x the radius for good viewing
        const minDistance = 1e9; // Minimum 1 million km
        const maxDistance = 5e11; // Maximum 500 million km
        const targetDistance = Math.max(
            minDistance,
            Math.min(maxDistance, distance),
        );

        // Animate camera to new position
        const direction = this.camera.position
            .clone()
            .sub(position)
            .normalize();
        const newPosition = position
            .clone()
            .add(direction.multiplyScalar(targetDistance));

        // Smoothly move camera
        this.camera.position.copy(newPosition);
        this.controls.target.copy(position);
        this.controls.update();

        console.log(
            `Focused on ${bodyName} at distance ${(targetDistance / 1e9).toFixed(2)} million km`,
        );
    }

    /**
     * Toggle label visibility
     */
    toggleLabels(): void {
        this.labelsVisible = !this.labelsVisible;
        this.labels.forEach((label) => {
            (label.element as HTMLElement).style.opacity = this.labelsVisible
                ? "1"
                : "0";
        });
    }

    /**
     * Set label visibility
     */
    setLabelsVisible(visible: boolean): void {
        this.labelsVisible = visible;
        this.labels.forEach((label) => {
            (label.element as HTMLElement).style.opacity = visible ? "1" : "0";
        });
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.bodies.forEach((mesh) => {
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        });
        this.orbits.forEach((line) => {
            line.geometry.dispose();
            (line.material as THREE.Material).dispose();
        });
        this.labels.forEach((label) => {
            label.element.remove();
        });
        this.renderer.dispose();
    }
}
