"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { OrbitalElements } from "@/lib/types";
import { calculateImpactProbability, calculateTorinoScale, getRiskLevel, calculateMOID } from "@/lib/physics/risk-calculator";
import { MinimizablePanel } from "./ui/MinimizablePanel";

interface RiskAssessmentProps {
    apophisElements: OrbitalElements;
    currentDistance: number; // in AU
}

export function RiskAssessment({ apophisElements, currentDistance }: RiskAssessmentProps) {
    const [isMinimized, setIsMinimized] = useState(true);
    const [probability, setProbability] = useState(0);
    const [animatedProbability, setAnimatedProbability] = useState(0);
    const previousProbabilityRef = useRef(0);

    useEffect(() => {
        const newProbability = calculateImpactProbability(apophisElements, currentDistance);
        setProbability(newProbability);

        // Animate the probability change
        let animationId: number;
        const startValue = previousProbabilityRef.current;
        const endValue = newProbability;
        const duration = 500; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setAnimatedProbability(current);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                previousProbabilityRef.current = endValue;
            }
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        apophisElements.semiMajorAxis,
        apophisElements.eccentricity,
        apophisElements.inclination,
        apophisElements.longitudeOfAscendingNode,
        apophisElements.argumentOfPeriapsis,
        apophisElements.meanAnomaly,
        currentDistance,
    ]);

    const torinoScale = calculateTorinoScale(probability);
    const moid = calculateMOID(apophisElements);
    const riskInfo = getRiskLevel(probability);

    // Calculate meter fill percentage
    const fillPercentage = animatedProbability * 100;

    // Minimized view - compact but informative
    const minimizedView = (
        <div className="p-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
            <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Risk</span>
                    <span className="text-sm font-bold" style={{ color: riskInfo.color }}>
                        {riskInfo.level}
                    </span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Probability</span>
                    <span className="text-sm font-mono font-semibold text-white">{(animatedProbability * 100).toFixed(2)}%</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Torino</span>
                    <span className="text-sm font-bold text-white">{torinoScale}</span>
                </div>
            </div>
        </div>
    );

    return (
        <MinimizablePanel
            title="Risk Assessment"
            icon={AlertTriangle}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
            position="bottom-left"
            fullHeight={false}
            minimizedContent={minimizedView}
        >
            <div className="p-6 w-96">
                {/* Risk Meter */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Impact Probability</span>
                        <span className="text-white font-mono font-semibold">{(animatedProbability * 100).toFixed(2)}%</span>
                    </div>

                    <div className="relative h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                        {/* Gradient background zones */}
                        <div className="absolute inset-0 flex">
                            <div className="flex-1 bg-green-900/30" />
                            <div className="flex-1 bg-blue-900/30" />
                            <div className="flex-1 bg-yellow-900/30" />
                            <div className="flex-1 bg-orange-900/30" />
                            <div className="flex-1 bg-red-900/30" />
                        </div>

                        {/* Animated fill */}
                        <div
                            className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                            style={{
                                width: `${fillPercentage}%`,
                                backgroundColor: riskInfo.color,
                                boxShadow: `0 0 20px ${riskInfo.color}`,
                            }}
                        />

                        {/* Threshold markers */}
                        <div className="absolute inset-0 flex items-center">
                            {[20, 40, 60, 80].map((threshold) => (
                                <div key={threshold} className="absolute h-full w-0.5 bg-slate-600" style={{ left: `${threshold}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Risk Level Badge */}
                <div
                    className="mb-4 p-3 rounded-lg border-2 transition-all duration-500"
                    style={{
                        backgroundColor: `${riskInfo.color}20`,
                        borderColor: riskInfo.color,
                    }}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-300">RISK LEVEL</span>
                        <span className="text-lg font-bold" style={{ color: riskInfo.color }}>
                            {riskInfo.level}
                        </span>
                    </div>
                    <p className="text-xs text-slate-300">{riskInfo.description}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Torino Scale</div>
                        <div className="text-2xl font-bold text-white">{torinoScale}</div>
                        <div className="text-xs text-slate-500">0-10 scale</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">MOID</div>
                        <div className="text-2xl font-bold text-white">{(moid * 149.6).toFixed(3)}</div>
                        <div className="text-xs text-slate-500">million km</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Current Distance</div>
                        <div className="text-2xl font-bold text-white">{(currentDistance * 149.6).toFixed(2)}</div>
                        <div className="text-xs text-slate-500">million km</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Close Approach</div>
                        <div className="text-2xl font-bold text-white">{currentDistance < 0.01 ? "YES" : "NO"}</div>
                        <div className="text-xs text-slate-500">&lt; 0.01 AU</div>
                    </div>
                </div>
            </div>
        </MinimizablePanel>
    );
}
