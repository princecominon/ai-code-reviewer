"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { GitPullRequest, Download, Cpu, Network, Combine, FileCode2, MessageSquare } from "lucide-react";

const steps = [
  { name: "GitHub PR", icon: <GitPullRequest className="w-5 h-5" /> },
  { name: "Fetch Diff", icon: <Download className="w-5 h-5" /> },
  { name: "Multi-Agent Analysis", icon: <Cpu className="w-5 h-5" /> },
  { name: "Coordinator AI", icon: <Network className="w-5 h-5" /> },
  { name: "Conflict Resolution", icon: <Combine className="w-5 h-5" /> },
  { name: "Markdown Report", icon: <FileCode2 className="w-5 h-5" /> },
  { name: "GitHub Comment", icon: <MessageSquare className="w-5 h-5" /> },
];

// Pulsing step-number orb in the top-left corner of each card.
function StepOrb({ index }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 + index * 0.08 }}
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 step-pulse"
      style={{ transform: "translateZ(45px)" }}
    >
      {String(index + 1).padStart(2, "0")}
      {/* Outer halo so the orb looks like it's emitting light */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 blur-md opacity-50 -z-10 scale-110" />
    </motion.div>
  );
}

// One step card with mouse-tracked 3D tilt and layered Z depth.
function StepCard({ step, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const springConfig = { stiffness: 250, damping: 25 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="w-full max-w-sm bg-white/5 border border-white/10 p-3 pr-5 rounded-2xl backdrop-blur-md flex items-center gap-3 text-base font-medium text-gray-200 shadow-xl group hover:border-cyan-500/40 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] transition-all duration-300"
    >
      <StepOrb index={index} />

      {/* Icon container with 3D depth */}
      <div
        className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-400 group-hover:from-cyan-500/25 group-hover:to-purple-500/25 group-hover:text-cyan-300 transition-all flex-shrink-0"
        style={{ transform: "translateZ(25px)" }}
      >
        {/* Subtle top-light inside the icon container */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-400/10 to-transparent rounded-t-lg pointer-events-none" />
        {step.icon}
      </div>

      <span style={{ transform: "translateZ(10px)" }}>{step.name}</span>
    </motion.div>
  );
}

// Connection between cards - 3 glowing endpoint dots + 3 layered traveling
// pulses so the line looks like a live data stream, not just a static rule.
function ConnectingBeam() {
  return (
    <div className="h-16 w-[2px] relative overflow-hidden my-2">
      {/* Glowing endpoint dots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_3px_rgba(6,182,212,0.8)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_3px_rgba(168,85,247,0.8)]" />

      {/* Base gradient line */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/40 to-purple-500/40" />

      {/* Three layered pulses: bright white + cyan + purple, phase-offset so
          they look like a continuous energy stream rather than one streak. */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-white to-transparent"
      />
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
        className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-cyan-300/70 to-transparent"
      />
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.8 }}
        className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-purple-300/70 to-transparent"
      />
    </div>
  );
}

export default function Workflow() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Pulsing animation defined locally for the step orbs */}
      <style>{`
        @keyframes stepPulse {
          0%, 100% {
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.5), 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 32px rgba(168, 85, 247, 0.6);
          }
        }
        .step-pulse { animation: stepPulse 2.4s ease-in-out infinite; }
      `}</style>

      {/* Ambient 3D background orbs - sit far back, very low opacity */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        >
          Autonomous Pipeline
        </motion.h2>

        <div className="flex flex-col items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              <StepCard step={step} index={index} />
              {index !== steps.length - 1 && <ConnectingBeam />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}