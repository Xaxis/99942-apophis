"use client";

import { X } from "lucide-react";

interface ParameterInfoModalProps {
    paramId: string;
    onClose: () => void;
}

const PARAMETER_INFO: Record<string, { title: string; description: string }> = {
    semiMajorAxis: {
        title: "Semi-Major Axis (a)",
        description:
            "The semi-major axis defines the size of the orbit - it's half the longest diameter of the elliptical orbit.\n\nMeasured in Astronomical Units (AU), where 1 AU = 150 million km (Earth-Sun distance).\n\n• Larger value → bigger orbit, longer orbital period\n• Apophis: ~0.92 AU (mostly inside Earth's orbit)\n• Determines orbital energy and period via Kepler's Third Law",
    },
    eccentricity: {
        title: "Eccentricity (e)",
        description:
            "Eccentricity measures how elliptical (stretched) the orbit is.\n\n• e = 0: Perfect circle\n• 0 < e < 1: Ellipse (most asteroids and planets)\n• e = 1: Parabola (escape trajectory)\n• e > 1: Hyperbola (interstellar object)\n\nApophis has e ≈ 0.19 (moderately elliptical), causing its distance from the Sun to vary significantly during each orbit, which affects its orbital speed.",
    },
    inclination: {
        title: "Inclination (i)",
        description:
            "Inclination is the tilt of the orbit relative to Earth's orbital plane (the ecliptic), measured in degrees.\n\n• i = 0°: Same plane as Earth\n• i = 90°: Polar orbit\n• i = 180°: Retrograde orbit\n\nApophis has i ≈ 3.3°, meaning it crosses Earth's orbital plane twice per orbit. This crossing geometry is crucial for determining potential close approaches and impact scenarios.",
    },
    longitudeOfAscendingNode: {
        title: "Longitude of Ascending Node (Ω)",
        description:
            "Defines where the orbit crosses Earth's orbital plane going northward (ascending node).\n\nMeasured in degrees (0-360°) from the vernal equinox direction.\n\n• Rotates the entire orbital plane around the Sun\n• Changes where in space the orbit intersects the ecliptic\n• Critical for determining close approach geometry\n\nSmall changes can shift potential Earth encounters by millions of kilometers.",
    },
    argumentOfPeriapsis: {
        title: "Argument of Periapsis (ω)",
        description:
            "Defines the orientation of the ellipse within its orbital plane - specifically, the angle from the ascending node to periapsis (closest point to Sun).\n\nMeasured in degrees (0-360°).\n\n• Rotates the ellipse within its plane\n• Determines where periapsis occurs relative to Earth's orbit\n• Can significantly affect whether the asteroid's path crosses Earth's orbit at a dangerous location\n\nCombined with Ω, this fully orients the orbit in 3D space.",
    },
    meanAnomaly: {
        title: "Mean Anomaly (M)",
        description:
            "Represents the asteroid's position along its orbit at a specific time, measured in degrees (0-360°).\n\nThink of it as a clock showing where the object is in its orbital cycle:\n\n• M = 0°: At periapsis (closest to Sun)\n• M = 90°: Quarter way through orbit\n• M = 180°: At apoapsis (farthest from Sun)\n• M = 270°: Three-quarters through orbit\n\nAdjusting this changes the starting position of the asteroid, which affects timing of close approaches.",
    },
    timeScale: {
        title: "Time Scale",
        description:
            "Controls how fast the simulation runs compared to real time.\n\n• 1× = Real-time (very slow for orbital mechanics)\n• 100× = 100 seconds of simulation per real second\n• 1000× = Fast-forward through months in minutes\n\nHigher values let you observe long-term orbital evolution and close approaches that would take years in real time. Lower values provide smoother animation for detailed observation of specific events.",
    },
    timeStep: {
        title: "Time Step (Δt)",
        description:
            "The time interval (in seconds) between each physics calculation.\n\n• Smaller steps (60s): More accurate, slower performance\n• Larger steps (86400s = 1 day): Faster, less accurate\n• Recommended: 3600s (1 hour) for good balance\n\nToo large a time step can cause energy drift and inaccurate orbits. Too small wastes computation. The optimal value depends on the integration method and desired accuracy.",
    },
    integrationMethod: {
        title: "Integration Method",
        description:
            "The numerical algorithm used to calculate orbital positions over time.\n\n• Euler (Fast): Simplest, least accurate, accumulates errors quickly\n• Velocity Verlet (Balanced): Better energy conservation, symplectic, good for most orbits\n• RK4 (Accurate): 4th-order Runge-Kutta, most accurate, best for N-body systems\n\nRecommendation: Use RK4 for studying close approaches, long-term evolution, and when N-body perturbations are enabled. Use Verlet for quick exploration.",
    },
    perturbations: {
        title: "N-Body Perturbations",
        description:
            "When enabled, the simulation includes gravitational effects from all bodies (Sun, Earth, Venus, Mars, Jupiter, Saturn, Mercury, and Moon) on each other. This is more realistic - in reality, planets slightly tug on asteroids and each other. Disabling this uses simpler 2-body mechanics (only Sun-asteroid interaction). Perturbations are crucial for accurate long-term predictions and understanding how planetary flybys alter orbits.",
    },
    trails: {
        title: "Orbital Trails",
        description:
            "Orbital trails show the actual path each body has traveled through space based on the N-body simulation. These bright, dynamic trails reveal the real trajectory including gravitational perturbations from other bodies. When N-body perturbations are enabled, you'll see the trails deviate slightly from the ideal Keplerian orbits, showing how planets and asteroids influence each other's paths over time.",
    },
    orbits: {
        title: "Orbit Paths",
        description:
            "Orbit paths display the ideal Keplerian ellipses calculated from each body's orbital elements. These subdued ellipses represent the theoretical 2-body orbit (if only the Sun's gravity mattered). Comparing orbit paths with orbital trails reveals the effect of gravitational perturbations - the trails show where bodies actually go, while the paths show where they would go in a perfect 2-body system.",
    },
    labels: {
        title: "Body Labels",
        description:
            "When enabled, displays the name of each celestial body next to its position in the 3D scene. This helps identify planets, moons, and asteroids at a glance. Labels are especially useful when zoomed out to see the entire solar system, or when tracking specific bodies during close approaches. Click on any body to select it and view detailed information in the controls panel.",
    },
};

export function ParameterInfoModal({ paramId, onClose }: ParameterInfoModalProps) {
    const info = PARAMETER_INFO[paramId];

    if (!info) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-white text-xl font-bold">{info.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-300 leading-relaxed">{info.description}</p>
                </div>
            </div>
        </div>
    );
}
