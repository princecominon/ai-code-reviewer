"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "4+", label: "Specialist Agents" },
  { value: "95%", label: "Issue Detection Accuracy" },
  { value: "10x", label: "Faster than Manual Review" }
];

export default function Stats() {
  return (
    <section className="py-24 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent mb-2">
              {stat.value}
            </div>
            <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}