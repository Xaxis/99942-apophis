"use client";

import { useState, useEffect, useRef } from "react";
import { Scene3D } from "./Scene3D";
import { Controls } from "./Controls";
import { InfoPanel } from "./InfoPanel";
import { AboutModal } from "./AboutModal";
import { RiskAssessment } from "./RiskAssessment";
import { PresetSimulations } from "./PresetSimulations";
import { BODIES, SUN } from "@/lib/constants";
import { calculateOrbitalState, calculateDistance, metersToAU } from "@/lib/physics/orbital-mechanics";
import { NBodySimulator } from "@/lib/physics/nbody-simulator";
import { BodyState, OrbitalElements, SimulationConfig } from "@/lib/types";
import { Info } from "lucide-react";
import { IconButton } from "./ui/IconButton";

export default function ApophisSimulator() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    // Orbital visualization architecture:
    // - Orbits: Subdued Keplerian ellipses (ideal 2-body orbits from orbital elements)
    // - Trails: Brighter actual paths from N-body simulation (shows perturbations)
    const [showTrails, setShowTrails] = useState(true); // Show actual simulated paths
    const [showOrbits, setShowOrbits] = useState(true); // Show ideal Keplerian orbits
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [apophisDistance, setApophisDistance] = useState(0);
    const [bodyStates, setBodyStates] = useState<BodyState[]>([]);
    const [selectedBodyIndex, setSelectedBodyIndex] = useState<number | null>(null);

    const [config, setConfig] = useState<SimulationConfig>({
        timeScale: 10,
        timeStep: 3600,
        integrationMethod: "rk4",
        enablePerturbations: true,
    });

    const [apophisElements, setApophisElements] = useState<OrbitalElements>({
        semiMajorAxis: 0.9224,
        eccentricity: 0.1914,
        inclination: 3.331,
        longitudeOfAscendingNode: 204.45,
        argumentOfPeriapsis: 126.4,
        meanAnomaly: 0.0,
    });

    const simulatorRef = useRef<NBodySimulator | null>(null);
    const startTimeRef = useRef(new Date());
    const simulationTimeRef = useRef(0);

    // Initialize simulation
    useEffect(() => {
        const initialStates: BodyState[] = BODIES.map((body) => {
            if (!body.orbitalElements) {
                return { position: [0, 0, 0], velocity: [0, 0, 0] };
            }
            const elements = body.name === "99942 Apophis" ? apophisElements : body.orbitalElements;
            return calculateOrbitalState(elements, SUN.mass, 0);
        });

        simulatorRef.current = new NBodySimulator(BODIES, initialStates, config.integrationMethod);

        setBodyStates(initialStates);
    }, [apophisElements, config.integrationMethod]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || !simulatorRef.current) return;

        let animationId: number;
        let lastTime = performance.now();

        const animate = (currentAnimationTime: number) => {
            const deltaTime = (currentAnimationTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentAnimationTime;

            const simulationDelta = deltaTime * config.timeScale;

            // Step simulation
            if (config.enablePerturbations) {
                simulatorRef.current!.step(config.timeStep);
            } else {
                // Simple 2-body mechanics
                const newStates: BodyState[] = BODIES.map((body, i) => {
                    if (!body.orbitalElements) {
                        return { position: [0, 0, 0], velocity: [0, 0, 0] };
                    }
                    const elements = body.name === "99942 Apophis" ? apophisElements : body.orbitalElements;
                    return calculateOrbitalState(elements, SUN.mass, simulationTimeRef.current);
                });
                simulatorRef.current!.resetStates(newStates);
            }

            simulationTimeRef.current += config.timeStep;

            // Update states
            const states = simulatorRef.current!.getStates();
            setBodyStates(states);

            // Update time
            const newTime = new Date(startTimeRef.current.getTime() + simulationTimeRef.current * 1000);
            setCurrentTime(newTime);

            // Calculate Apophis distance to Earth
            const apophisIndex = BODIES.findIndex((b) => b.name === "99942 Apophis");
            const earthIndex = BODIES.findIndex((b) => b.name === "Earth");
            if (apophisIndex >= 0 && earthIndex >= 0) {
                const distance = calculateDistance(states[apophisIndex].position, states[earthIndex].position);
                setApophisDistance(metersToAU(distance));
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isPlaying, config, apophisElements]);

    const handleReset = () => {
        simulationTimeRef.current = 0;
        startTimeRef.current = new Date();
        setCurrentTime(new Date());

        const initialStates: BodyState[] = BODIES.map((body) => {
            if (!body.orbitalElements) {
                return { position: [0, 0, 0], velocity: [0, 0, 0] };
            }
            const elements = body.name === "99942 Apophis" ? apophisElements : body.orbitalElements;
            return calculateOrbitalState(elements, SUN.mass, 0);
        });

        if (simulatorRef.current) {
            simulatorRef.current.resetStates(initialStates);
        }
        setBodyStates(initialStates);
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            <Scene3D
                bodies={BODIES}
                bodyStates={bodyStates}
                showLabels={showLabels}
                showTrails={showTrails}
                showOrbits={showOrbits}
                selectedBodyIndex={selectedBodyIndex}
                onBodyClick={setSelectedBodyIndex}
            />

            <div className="absolute top-4 left-4 flex items-start gap-2 z-10">
                <IconButton icon={Info} onClick={() => setShowAboutModal(true)} variant="secondary" />
            </div>

            <div className="absolute top-4 left-[4.5rem] z-20">
                <PresetSimulations onLoadPreset={setApophisElements} />
            </div>

            <div className="absolute top-4 left-[8.5rem] z-10">
                <InfoPanel currentTime={currentTime} apophisDistance={apophisDistance} />
            </div>

            <Controls
                config={config}
                apophisElements={apophisElements}
                isPlaying={isPlaying}
                showLabels={showLabels}
                showTrails={showTrails}
                showOrbits={showOrbits}
                selectedBody={selectedBodyIndex !== null ? BODIES[selectedBodyIndex] : null}
                onConfigChange={setConfig}
                onApophisElementsChange={setApophisElements}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onReset={handleReset}
                onToggleLabels={() => setShowLabels(!showLabels)}
                onToggleTrails={() => setShowTrails(!showTrails)}
                onToggleOrbits={() => setShowOrbits(!showOrbits)}
            />

            <RiskAssessment apophisElements={apophisElements} currentDistance={apophisDistance} />

            {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
        </div>
    );
}
