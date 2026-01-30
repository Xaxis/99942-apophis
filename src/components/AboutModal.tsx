"use client";

import { X, Github } from "lucide-react";

interface AboutModalProps {
    onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }} onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                    <h2 className="text-white text-2xl font-bold">About 99942 Apophis</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <section>
                        <h3 className="text-white text-xl font-semibold mb-3">Overview</h3>
                        <p className="text-slate-300 leading-relaxed">
                            99942 Apophis is a near-Earth asteroid approximately 370 meters in diameter. Discovered in 2004, it initially caused concern due to a small probability
                            of Earth impact in 2029. Further observations have since ruled out any impact risk for at least the next 100 years.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white text-xl font-semibold mb-3">The 2029 Close Approach</h3>
                        <p className="text-slate-300 leading-relaxed mb-3">
                            On April 13, 2029, Apophis will pass within approximately 31,000 kilometers (19,000 miles) of Earth's surface - closer than some satellites in
                            geostationary orbit. This will be the closest approach of an asteroid this size in recorded history.
                        </p>
                        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <p className="text-blue-200 text-sm">
                                <strong>Key Facts:</strong> Apophis will be visible to the naked eye from some locations. The close approach will provide unprecedented
                                opportunities for scientific observation.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-white text-xl font-semibold mb-3">Orbital Mechanics & Perturbations</h3>
                        <p className="text-slate-300 leading-relaxed mb-3">Apophis's orbit is influenced by gravitational interactions with multiple bodies in the solar system:</p>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>
                                    <strong className="text-white">Solar Gravity:</strong> The Sun's massive gravitational field is the primary force governing Apophis's elliptical
                                    orbit.
                                </div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>
                                    <strong className="text-white">Planetary Perturbations:</strong> All eight planets (Mercury through Neptune) cause gravitational perturbations,
                                    with Jupiter and Saturn having the largest effects due to their massive size.
                                </div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>
                                    <strong className="text-white">Yarkovsky Effect:</strong> Thermal radiation from the asteroid creates a tiny thrust that slowly changes its
                                    orbit over decades.
                                </div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>
                                    <strong className="text-white">Resonances:</strong> Gravitational resonances with Earth can amplify small orbital changes.
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-white text-xl font-semibold mb-3">Risk Assessment</h3>
                        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-3">
                            <p className="text-green-200 text-sm">
                                <strong>Current Risk Level: ZERO</strong>
                                <br />
                                As of 2021, NASA has confirmed that Apophis poses no impact threat to Earth for at least the next 100 years. The 2029 close approach is safe.
                            </p>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            However, the 2029 flyby will slightly alter Apophis's orbit due to Earth's gravity. Scientists will carefully track these changes to refine long-term
                            predictions.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white text-xl font-semibold mb-3">About This Simulator</h3>
                        <p className="text-slate-300 leading-relaxed mb-3">
                            This interactive tool uses N-body gravitational simulation to model the orbital mechanics of Apophis and other solar system bodies. You can:
                        </p>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>Adjust orbital parameters to see how they affect the trajectory</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>Enable/disable gravitational perturbations from other planets</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>Choose different numerical integration methods (RK4 recommended for accuracy)</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <div>Speed up or slow down time to observe long-term orbital evolution</div>
                            </li>
                        </ul>
                    </section>

                    <section className="border-t border-slate-700 pt-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <p className="text-slate-300 text-sm text-center mb-4">
                                <strong className="text-white">apophis.bot</strong> - An interactive educational tool for exploring orbital mechanics and near-Earth asteroid
                                dynamics. Built with React, Next.js, Three.js, and TypeScript.
                            </p>
                            <div className="flex justify-center">
                                <a
                                    href="https://github.com/wilneeley/99942-apophis"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    <Github size={18} />
                                    <span className="text-sm font-medium">View on GitHub</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
