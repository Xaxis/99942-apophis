"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Scene3D } from "./Scene3D";
import { Controls } from "./Controls";
import { InfoPanel } from "./InfoPanel";
import { AboutModal } from "./AboutModal";
import { RiskAssessment } from "./RiskAssessment";
import { PresetSimulations } from "./PresetSimulations";
import { BODIES, SUN, APOPHIS, AU, G } from "@/lib/constants";
import { calculateOrbitalState, calculateDistance, metersToAU } from "@/lib/physics/orbital-mechanics";
import { NBodySimulator } from "@/lib/physics/nbody-simulator";
import { BodyState, OrbitalElements, SimulationConfig, CelestialBody } from "@/lib/types";
import { Info } from "lucide-react";
import { IconButton } from "./ui/IconButton";

export default function ApophisSimulator() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    // Orbital visualization architecture:
    // - Orbits: Subdued Keplerian ellipses (ideal 2-body orbits from orbital elements)
    // - Trails: Brighter actual paths from N-body simulation (shows perturbations)
    const [showTrails, setShowTrails] = useState(true);
    const [showOrbits, setShowOrbits] = useState(true);
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

    // Apophis orbital elements from NASA JPL Horizons (Epoch: 2459215.5 JD = 2021-Jan-01.0 TDB)
    const [apophisElements, setApophisElements] = useState<OrbitalElements>({
        semiMajorAxis: APOPHIS.orbitalElements!.semiMajorAxis,
        eccentricity: APOPHIS.orbitalElements!.eccentricity,
        inclination: APOPHIS.orbitalElements!.inclination,
        longitudeOfAscendingNode: APOPHIS.orbitalElements!.longitudeOfAscendingNode,
        argumentOfPeriapsis: APOPHIS.orbitalElements!.argumentOfPeriapsis,
        meanAnomaly: APOPHIS.orbitalElements!.meanAnomaly,
    });

    const simulatorRef = useRef<NBodySimulator | null>(null);
    const startTimeRef = useRef(new Date());
    const simulationTimeRef = useRef(0);
    const apophisElementsRef = useRef(apophisElements);
    const configRef = useRef(config);

    // Flatten BODIES array to include all satellites
    const allBodies = useMemo(() => {
        const flattened: CelestialBody[] = [];
        const parentIndices: Map<CelestialBody, number> = new Map(); // Track parent index for each satellite

        BODIES.forEach((body) => {
            const parentIndex = flattened.length; // Store parent's index in flattened array BEFORE adding satellites
            flattened.push(body);

            // Add satellites if they exist
            if (body.satellites) {
                body.satellites.forEach((satellite) => {
                    parentIndices.set(satellite, parentIndex); // Map satellite to parent's index in flattened array
                    flattened.push(satellite);
                });
            }
        });

        return { bodies: flattened, parentIndices };
    }, []);

    // Initialize simulation
    useEffect(() => {
        // Calculate time offset from epoch to current date
        // Epoch: 2459215.5 JD = 2021-Jan-01.0 TDB (NASA JPL Horizons JPL#220)
        const epochJD = 2459215.5;
        const currentDate = new Date();
        const currentJD = currentDate.getTime() / 86400000 + 2440587.5; // Convert to Julian Date
        const daysSinceEpoch = currentJD - epochJD;
        const secondsSinceEpoch = daysSinceEpoch * 86400; // Convert days to seconds

        const initialStates: BodyState[] = allBodies.bodies.map((body) => {
            if (!body.orbitalElements) {
                return { position: [0, 0, 0], velocity: [0, 0, 0] };
            }
            const elements = body.name === "99942 Apophis" ? apophisElements : body.orbitalElements;

            // If this body is a satellite, calculate relative to parent
            const parentIndex = allBodies.parentIndices.get(body);
            if (parentIndex !== undefined) {
                const parentBody = allBodies.bodies[parentIndex];
                const parentState = calculateOrbitalState(parentBody.orbitalElements!, SUN.mass, secondsSinceEpoch);
                return calculateOrbitalState(elements, parentBody.mass, secondsSinceEpoch, parentState);
            }

            return calculateOrbitalState(elements, SUN.mass, secondsSinceEpoch);
        });

        simulatorRef.current = new NBodySimulator(allBodies.bodies, initialStates, config.integrationMethod);

        setBodyStates(initialStates);
    }, [apophisElements, config.integrationMethod, allBodies]);

    // Update refs when values change
    useEffect(() => {
        apophisElementsRef.current = apophisElements;
        configRef.current = config;
    }, [apophisElements, config]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || !simulatorRef.current) return;

        let animationId: number;
        let lastTime = performance.now();

        const animate = (currentAnimationTime: number) => {
            const deltaTime = (currentAnimationTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentAnimationTime;

            const currentConfig = configRef.current;

            // Calculate signed time step based on timeScale direction
            const timeDirection = Math.sign(currentConfig.timeScale);
            const signedTimeStep = currentConfig.timeStep * timeDirection;

            // Step simulation
            if (currentConfig.enablePerturbations) {
                simulatorRef.current!.step(signedTimeStep);

                // After N-body step, update satellites using Kepler mechanics
                // (N-body forces from Sun would rip moons away from their planets)
                const updatedStates = simulatorRef.current!.getStates();
                allBodies.bodies.forEach((body, index) => {
                    const parentIndex = allBodies.parentIndices.get(body);
                    if (parentIndex !== undefined && body.orbitalElements) {
                        // This is a satellite - recalculate using Kepler mechanics relative to parent
                        const parentBody = allBodies.bodies[parentIndex];
                        const parentState = updatedStates[parentIndex];
                        const elements = body.orbitalElements;
                        updatedStates[index] = calculateOrbitalState(elements, parentBody.mass, simulationTimeRef.current, parentState);
                    }
                });
                simulatorRef.current!.resetStates(updatedStates);
            } else {
                // Simple 2-body mechanics
                const newStates: BodyState[] = allBodies.bodies.map((body) => {
                    if (!body.orbitalElements) {
                        return { position: [0, 0, 0], velocity: [0, 0, 0] };
                    }
                    const elements = body.name === "99942 Apophis" ? apophisElementsRef.current : body.orbitalElements;

                    // If this body is a satellite, calculate relative to parent
                    const parentIndex = allBodies.parentIndices.get(body);
                    if (parentIndex !== undefined) {
                        const parentBody = allBodies.bodies[parentIndex];
                        const parentState = calculateOrbitalState(parentBody.orbitalElements!, SUN.mass, simulationTimeRef.current);
                        return calculateOrbitalState(elements, parentBody.mass, simulationTimeRef.current, parentState);
                    }

                    return calculateOrbitalState(elements, SUN.mass, simulationTimeRef.current);
                });
                simulatorRef.current!.resetStates(newStates);
            }

            simulationTimeRef.current += signedTimeStep;

            // Update states
            const states = simulatorRef.current!.getStates();
            setBodyStates(states);

            // Update time
            const newTime = new Date(startTimeRef.current.getTime() + simulationTimeRef.current * 1000);
            setCurrentTime(newTime);

            // Calculate Apophis distance to Earth
            const apophisIndex = allBodies.bodies.findIndex((b) => b.name === "99942 Apophis");
            const earthIndex = allBodies.bodies.findIndex((b) => b.name === "Earth");
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    const handleReset = () => {
        simulationTimeRef.current = 0;
        startTimeRef.current = new Date();
        setCurrentTime(new Date());

        const initialStates: BodyState[] = allBodies.bodies.map((body) => {
            if (!body.orbitalElements) {
                return { position: [0, 0, 0], velocity: [0, 0, 0] };
            }
            const elements = body.name === "99942 Apophis" ? apophisElements : body.orbitalElements;

            // If this body is a satellite, calculate relative to parent
            const parentIndex = allBodies.parentIndices.get(body);
            if (parentIndex !== undefined) {
                const parentBody = allBodies.bodies[parentIndex];
                const parentState = calculateOrbitalState(parentBody.orbitalElements!, SUN.mass, 0);
                return calculateOrbitalState(elements, parentBody.mass, 0, parentState);
            }

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
                bodies={allBodies.bodies}
                bodyStates={bodyStates}
                showLabels={showLabels}
                showTrails={showTrails}
                showOrbits={showOrbits}
                selectedBodyIndex={selectedBodyIndex}
                onBodyClick={setSelectedBodyIndex}
                apophisElements={apophisElements}
                parentIndices={allBodies.parentIndices}
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
                selectedBody={selectedBodyIndex !== null ? allBodies.bodies[selectedBodyIndex] : null}
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
