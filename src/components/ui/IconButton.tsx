"use client";

import { LucideIcon } from "lucide-react";

interface IconButtonProps {
    icon: LucideIcon;
    label?: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
    className?: string;
}

export function IconButton({ icon: Icon, label, onClick, variant = "primary", className = "" }: IconButtonProps) {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-colors z-10";
    const variantClasses = variant === "primary" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900/95 hover:bg-slate-800 text-white backdrop-blur-md";

    return (
        <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
            <Icon size={18} />
            {label && <span className="text-sm font-medium">{label}</span>}
        </button>
    );
}
