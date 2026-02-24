import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface TransitionPageProps {
    isLoading: boolean;
    message?: string;
    subMessage?: string;
    onComplete?: () => void;
}

export function TransitionPage({ isLoading, message = "PROCESSING DATA", subMessage = "Accessing real-time sensor array...", onComplete }: TransitionPageProps) {
    const [show, setShow] = useState(isLoading);

    useEffect(() => {
        if (isLoading) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center pointer-events-auto"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse rounded-full" />

                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-t-2 border-r-2 border-primary rounded-full mx-auto relative z-10"
                            >
                                <div className="absolute inset-2 border-b-2 border-l-2 border-cyan-400 rounded-full" />
                            </motion.div>
                        </div>

                        <motion.h2
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="text-2xl font-display font-bold text-white mb-2 tracking-[0.2em] uppercase"
                        >
                            {message}
                        </motion.h2>
                        <p className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] opacity-80">
                            {subMessage}
                        </p>

                        <div className="mt-8 flex gap-1.5 justify-center">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scaleY: [1, 2.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                        backgroundColor: ["#0ea5e9", "#22d3ee", "#0ea5e9"]
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.15
                                    }}
                                    className="w-1 h-4 bg-primary rounded-full origin-center"
                                />
                            ))}
                        </div>
                    </motion.div>

                    <div className="absolute bottom-10 left-10 text-[10px] font-mono text-white/20 tracking-widest">
                        SYSTEM_STABLE // NETWORK_ENCRYPTED
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
