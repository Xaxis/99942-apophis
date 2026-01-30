"use client";

import { ReactNode } from "react";
import { LucideIcon, Minimize2, Maximize2 } from "lucide-react";

interface MinimizablePanelProps {
    title: string;
    icon: LucideIcon;
    isMinimized: boolean;
    onToggleMinimize: () => void;
    children: ReactNode;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
    fullHeight?: boolean;
    minimizedContent?: ReactNode; // Custom content to show when minimized
}

export function MinimizablePanel({
    title,
    icon: Icon,
    isMinimized,
    onToggleMinimize,
    children,
    position = "top-right",
    fullHeight = false,
    minimizedContent,
}: MinimizablePanelProps) {
    const positionClasses = {
        "top-left": "absolute top-4 left-4",
        "top-right": "absolute top-4 right-4",
        "bottom-left": "absolute bottom-4 left-4",
        "bottom-right": "absolute bottom-4 right-4",
        inline: "absolute top-0 left-0",
    };

    const heightClass = fullHeight && !isMinimized ? "max-h-[calc(100vh-8rem)]" : "";

    // When minimized with custom content, show the custom minimized view
    if (isMinimized && minimizedContent) {
        return (
            <div
                className={`${positionClasses[position]} bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-10 transition-all duration-300 cursor-pointer hover:bg-slate-800/95`}
                onClick={onToggleMinimize}
            >
                {minimizedContent}
            </div>
        );
    }

    // When minimized without custom content, show just an icon button
    if (isMinimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className={`${positionClasses[position]} flex items-center gap-2 px-4 py-2 bg-slate-900/95 hover:bg-slate-800 text-white rounded-lg shadow-lg transition-colors backdrop-blur-md z-10`}
            >
                <Icon size={18} />
            </button>
        );
    }

    // Full expanded panel
    return (
        <div className={`${positionClasses[position]} bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-10 transition-all duration-300`}>
            {/* Header */}
            <button onClick={onToggleMinimize} className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Icon size={20} className="text-blue-500" />
                    <h2 className="text-white text-sm font-semibold uppercase tracking-wide">{title}</h2>
                </div>
                <Minimize2 size={18} className="text-slate-400" />
            </button>

            {/* Content */}
            <div className={`${heightClass} overflow-y-auto`}>{children}</div>
        </div>
    );
}
