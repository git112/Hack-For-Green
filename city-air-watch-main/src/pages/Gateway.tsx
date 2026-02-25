import { motion } from "framer-motion";
import { Shield, User, ArrowRight, Wind, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Gateway() {
    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [target, setTarget] = useState("");

    const handleNavigation = (path: string, label: string) => {
        setTarget(label);
        setIsRedirecting(true);
        setTimeout(() => {
            navigate(path);
        }, 2000);
    };

    if (isRedirecting) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative text-center"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-t-2 border-r-2 border-primary rounded-full mx-auto mb-8 relative"
                    >
                        <div className="absolute inset-2 border-b-2 border-l-2 border-cyan-400 rounded-full animate-reverse-spin" />
                    </motion.div>

                    <motion.h2
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="text-3xl font-display font-bold text-white mb-2 tracking-widest"
                    >
                        INITIALIZING ACCESS
                    </motion.h2>
                    <p className="text-primary font-mono text-sm uppercase tracking-[0.3em]">
                        Connecting to {target}...
                    </p>

                    <div className="mt-8 flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [4, 16, 4],
                                    backgroundColor: ["#0ea5e9", "#22d3ee", "#0ea5e9"]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.1
                                }}
                                className="w-1 bg-primary rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] selection:bg-primary/30 relative overflow-hidden flex items-center justify-center p-6">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            </div>

            <div className="max-w-6xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-xs font-mono text-white/70 uppercase tracking-widest">Global Air Infrastructure</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
                        City Air <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Watch</span>
                    </h1>
                    <p className="text-white/40 max-w-xl mx-auto text-lg">
                        Select your access point. Monitor, simulate, and act in real-time with our neural air quality network.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Citizen Card */}
                    <motion.button
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => handleNavigation("/citizen/dashboard", "Citizen Portal")}
                        className="group relative text-left bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.06] hover:border-primary/50"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
                            <User className="w-32 h-32 text-primary" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 group-hover:border-primary/40">
                                <Wind className="w-7 h-7 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white mb-3">Citizen Portal</h2>
                            <p className="text-white/40 mb-8 leading-relaxed">
                                Check your local AQI, report pollution events, and earn rewards for contributing to a cleaner city.
                            </p>
                            <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                                Enter Portal <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>

                    {/* Admin Card */}
                    <motion.button
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => handleNavigation("/admin/dashboard", "Admin Command Center")}
                        className="group relative text-left bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.06] hover:border-cyan-500/50"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
                            <Shield className="w-32 h-32 text-cyan-400" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 group-hover:border-cyan-400/40">
                                <Activity className="w-7 h-7 text-cyan-400" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-white mb-3">Admin Command</h2>
                            <p className="text-white/40 mb-8 leading-relaxed">
                                Execute policy simulations, analyze city-wide health trends, and manage automated responses.
                            </p>
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-4 transition-all">
                                Access Center <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex justify-center gap-12 border-t border-white/5 pt-12"
                >
                    <div className="text-center">
                        <p className="text-white/20 text-xs uppercase tracking-[0.2em] mb-1">Total Wards</p>
                        <p className="text-2xl font-display font-medium text-white/60">08 Monitored</p>
                    </div>
                    <div className="text-center border-x border-white/5 px-12">
                        <p className="text-white/20 text-xs uppercase tracking-[0.2em] mb-1">State</p>
                        <p className="text-2xl font-display font-medium text-white/60">Real-time Stream</p>
                    </div>
                    <div className="text-center">
                        <p className="text-white/20 text-xs uppercase tracking-[0.2em] mb-1">Node Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-2xl font-display font-medium text-white/60">Operational</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
