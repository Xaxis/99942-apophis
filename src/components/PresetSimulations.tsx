"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { PRESET_SIMULATIONS, PresetSimulation } from "@/lib/constants";
import { OrbitalElements } from "@/lib/types";
import { MinimizablePanel } from "./ui/MinimizablePanel";

interface PresetSimulationsProps {
    onLoadPreset: (elements: OrbitalElements) => void;
}

export function PresetSimulations({ onLoadPreset }: PresetSimulationsProps) {
    const [isMinimized, setIsMinimized] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<string>("current");

    const handleLoadPreset = (preset: PresetSimulation) => {
        setSelectedPreset(preset.id);
        onLoadPreset(preset.elements);
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case "safe":
                return "bg-green-900/30 border-green-700/50 text-green-200";
            case "low":
                return "bg-blue-900/30 border-blue-700/50 text-blue-200";
            case "moderate":
                return "bg-yellow-900/30 border-yellow-700/50 text-yellow-200";
            case "high":
                return "bg-orange-900/30 border-orange-700/50 text-orange-200";
            case "critical":
                return "bg-red-900/30 border-red-700/50 text-red-200";
            default:
                return "bg-slate-900/30 border-slate-700/50 text-slate-200";
        }
    };

    return (
        <MinimizablePanel
            title="Preset Scenarios"
            icon={Rocket}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
            position="inline"
            fullHeight={false}
        >
            <div className="p-4 pt-0 max-h-[70vh] overflow-y-auto w-96">
                <p className="text-slate-400 text-xs mb-4">Load pre-configured orbital scenarios to explore different risk levels and impact possibilities.</p>

                <div className="space-y-2">
                    {PRESET_SIMULATIONS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                selectedPreset === preset.id ? "ring-2 ring-blue-500 " + getRiskColor(preset.riskLevel) : "hover:bg-slate-800/50 " + getRiskColor(preset.riskLevel)
                            }`}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-sm">{preset.name}</h3>
                                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded">{preset.riskLevel}</span>
                            </div>
                            <p className="text-xs opacity-90">{preset.description}</p>

                            {selectedPreset === preset.id && (
                                <div className="mt-2 pt-2 border-t border-current/20">
                                    <div className="text-xs opacity-75 grid grid-cols-2 gap-1">
                                        <div>a: {preset.elements.semiMajorAxis.toFixed(3)} AU</div>
                                        <div>e: {preset.elements.eccentricity.toFixed(3)}</div>
                                        <div>i: {preset.elements.inclination.toFixed(1)}°</div>
                                        <div>Ω: {preset.elements.longitudeOfAscendingNode.toFixed(1)}°</div>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <p className="text-slate-300 text-xs">
                        <strong className="text-white">Note:</strong> These scenarios are for educational purposes. The "Impact Trajectory" and high-risk scenarios are hypothetical
                        and do not represent actual threats.
                    </p>
                </div>
            </div>
        </MinimizablePanel>
    );
}
