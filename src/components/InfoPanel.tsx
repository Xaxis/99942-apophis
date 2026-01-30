"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { MinimizablePanel } from "./ui/MinimizablePanel";

interface InfoPanelProps {
    currentTime: Date;
    apophisDistance: number;
}

export function InfoPanel({ currentTime, apophisDistance }: InfoPanelProps) {
    const [isMinimized, setIsMinimized] = useState(true);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Minimized view - compact single-line display matching icon button height
    const minimizedView = (
        <div className="px-4 py-2 flex items-center gap-2">
            <Activity size={18} className="text-blue-500 flex-shrink-0" />
            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="text-white font-mono">{formatDate(currentTime)}</span>
                <span className="text-slate-600">|</span>
                <span className="text-white font-mono">{apophisDistance.toFixed(4)} AU</span>
            </div>
        </div>
    );

    return (
        <MinimizablePanel
            title="Simulation Data"
            icon={Activity}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
            position="inline"
            fullHeight={false}
            minimizedContent={minimizedView}
        >
            <div className="p-6 w-96">
                <div className="space-y-3">
                    <div>
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Date</div>
                        <div className="text-white text-sm font-mono">{formatDate(currentTime)}</div>
                    </div>

                    <div>
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Apophis Distance to Earth</div>
                        <div className="text-white text-sm font-mono">{apophisDistance.toFixed(4)} AU</div>
                        <div className="text-slate-400 text-xs mt-1">{(apophisDistance * 149.6).toFixed(2)} million km</div>
                    </div>
                </div>
            </div>
        </MinimizablePanel>
    );
}
