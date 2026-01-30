"use client";

import { OrbitalElements, SimulationConfig, CelestialBody } from "@/lib/types";
import { Play, Pause, RotateCcw, Eye, EyeOff, Settings, Info } from "lucide-react";
import { useState } from "react";
import { ParameterInfoModal } from "./ParameterInfoModal";
import { MinimizablePanel } from "./ui/MinimizablePanel";

interface ControlsProps {
    config: SimulationConfig;
    apophisElements: OrbitalElements;
    isPlaying: boolean;
    showLabels: boolean;
    showTrails: boolean;
    showOrbits: boolean;
    selectedBody: CelestialBody | null;
    onConfigChange: (config: SimulationConfig) => void;
    onApophisElementsChange: (elements: OrbitalElements) => void;
    onPlayPause: () => void;
    onReset: () => void;
    onToggleLabels: () => void;
    onToggleTrails: () => void;
    onToggleOrbits: () => void;
}

export function Controls({
    config,
    apophisElements,
    isPlaying,
    showLabels,
    showTrails,
    showOrbits,
    selectedBody,
    onConfigChange,
    onApophisElementsChange,
    onPlayPause,
    onReset,
    onToggleLabels,
    onToggleTrails,
    onToggleOrbits,
}: ControlsProps) {
    const [showParamInfo, setShowParamInfo] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    const handleSliderChange = (key: keyof OrbitalElements, value: number) => {
        onApophisElementsChange({ ...apophisElements, [key]: value });
    };

    const handleConfigChange = (key: keyof SimulationConfig, value: any) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <>
            <MinimizablePanel
                title="Controls"
                icon={Settings}
                isMinimized={isMinimized}
                onToggleMinimize={() => setIsMinimized(!isMinimized)}
                position="top-right"
                fullHeight={true}
            >
                <div className="p-6 max-w-sm">
                    {/* Selected Body Info */}
                    {selectedBody && (
                        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                            <div className="text-blue-200 text-xs font-semibold mb-1">SELECTED</div>
                            <div className="text-white font-semibold">{selectedBody.name}</div>
                            <div className="text-slate-300 text-xs mt-1">Mass: {selectedBody.mass.toExponential(2)} kg</div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <button
                            onClick={onPlayPause}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            <span>{isPlaying ? "Pause" : "Play"}</span>
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            <RotateCcw size={18} />
                            <span>Reset</span>
                        </button>
                    </div>

                    {/* Orbital Elements */}
                    <div className="mb-6">
                        <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Apophis Orbital Elements</h3>

                        <ControlSlider
                            label="Semi-Major Axis (AU)"
                            value={apophisElements.semiMajorAxis}
                            min={0.5}
                            max={2.0}
                            step={0.001}
                            onChange={(v) => handleSliderChange("semiMajorAxis", v)}
                            onInfoClick={() => setShowParamInfo("semiMajorAxis")}
                        />

                        <ControlSlider
                            label="Eccentricity"
                            value={apophisElements.eccentricity}
                            min={0}
                            max={0.9}
                            step={0.001}
                            onChange={(v) => handleSliderChange("eccentricity", v)}
                            onInfoClick={() => setShowParamInfo("eccentricity")}
                        />

                        <ControlSlider
                            label="Inclination (°)"
                            value={apophisElements.inclination}
                            min={0}
                            max={30}
                            step={0.1}
                            onChange={(v) => handleSliderChange("inclination", v)}
                            onInfoClick={() => setShowParamInfo("inclination")}
                        />

                        <ControlSlider
                            label="Long. of Asc. Node (°)"
                            value={apophisElements.longitudeOfAscendingNode}
                            min={0}
                            max={360}
                            step={0.1}
                            onChange={(v) => handleSliderChange("longitudeOfAscendingNode", v)}
                            onInfoClick={() => setShowParamInfo("longitudeOfAscendingNode")}
                        />

                        <ControlSlider
                            label="Arg. of Periapsis (°)"
                            value={apophisElements.argumentOfPeriapsis}
                            min={0}
                            max={360}
                            step={0.1}
                            onChange={(v) => handleSliderChange("argumentOfPeriapsis", v)}
                            onInfoClick={() => setShowParamInfo("argumentOfPeriapsis")}
                        />

                        <ControlSlider
                            label="Mean Anomaly (°)"
                            value={apophisElements.meanAnomaly}
                            min={0}
                            max={360}
                            step={0.1}
                            onChange={(v) => handleSliderChange("meanAnomaly", v)}
                            onInfoClick={() => setShowParamInfo("meanAnomaly")}
                        />
                    </div>

                    {/* Simulation Settings */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Simulation Settings</h3>

                        <ControlSlider
                            label="Time Scale"
                            value={config.timeScale}
                            min={1}
                            max={1000}
                            step={1}
                            onChange={(v) => handleConfigChange("timeScale", v)}
                            onInfoClick={() => setShowParamInfo("timeScale")}
                        />

                        <ControlSlider
                            label="Time Step (s)"
                            value={config.timeStep}
                            min={60}
                            max={86400}
                            step={60}
                            onChange={(v) => handleConfigChange("timeStep", v)}
                            onInfoClick={() => setShowParamInfo("timeStep")}
                        />

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-white text-sm">Integration Method</label>
                                <button onClick={() => setShowParamInfo("integrationMethod")} className="text-slate-400 hover:text-white transition-colors">
                                    <Info size={14} />
                                </button>
                            </div>
                            <select
                                value={config.integrationMethod}
                                onChange={(e) => handleConfigChange("integrationMethod", e.target.value as "euler" | "verlet" | "rk4")}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="euler">Euler (Fast)</option>
                                <option value="verlet">Verlet (Balanced)</option>
                                <option value="rk4">RK4 (Accurate)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.enablePerturbations}
                                    onChange={(e) => handleConfigChange("enablePerturbations", e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span>N-body Perturbations</span>
                            </label>
                            <button onClick={() => setShowParamInfo("perturbations")} className="text-slate-400 hover:text-white transition-colors">
                                <Info size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div className="mt-6">
                        <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Display Options</h3>

                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showTrails}
                                    onChange={onToggleTrails}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span>Show Orbital Trails</span>
                            </label>
                            <button onClick={() => setShowParamInfo("trails")} className="text-slate-400 hover:text-white transition-colors">
                                <Info size={14} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showOrbits}
                                    onChange={onToggleOrbits}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span>Show Orbit Paths</span>
                            </label>
                            <button onClick={() => setShowParamInfo("orbits")} className="text-slate-400 hover:text-white transition-colors">
                                <Info size={14} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showLabels}
                                    onChange={onToggleLabels}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span>Show Body Labels</span>
                            </label>
                            <button onClick={() => setShowParamInfo("labels")} className="text-slate-400 hover:text-white transition-colors">
                                <Info size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Visualization Hint */}
                    <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <div className="text-slate-300 text-xs">
                            <strong className="text-white">Tip:</strong> Click on any celestial body to select and highlight it. Use mouse to rotate, zoom, and pan the view.
                        </div>
                    </div>
                </div>
            </MinimizablePanel>

            {showParamInfo && <ParameterInfoModal paramId={showParamInfo} onClose={() => setShowParamInfo(null)} />}
        </>
    );
}

interface ControlSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    onInfoClick: () => void;
}

function ControlSlider({ label, value, min, max, step, onChange, onInfoClick }: ControlSliderProps) {
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm">{label}</label>
                <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-sm font-mono">{value.toFixed(3)}</span>
                    <button onClick={onInfoClick} className="text-slate-400 hover:text-white transition-colors">
                        <Info size={14} />
                    </button>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
        </div>
    );
}
