"use client";


import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

import { ShieldAlert, Zap, PenTool, TestTube2 } from "lucide-react";


const features = [

  {

    title: "Security Agent",

    description:

      "Detect vulnerabilities and insecure patterns before they merge.",

    icon: <ShieldAlert className="w-6 h-6 text-red-400" />,

    color: "group-hover:border-red-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(248,113,113,0.4)]",

    glow: "radial-gradient(circle at 50% 0%, rgba(248,113,113,0.18), transparent 60%)",

  },

  {

    title: "Performance Agent",

    description:

      "Find bottlenecks and optimization opportunities in your architecture.",

    icon: <Zap className="w-6 h-6 text-yellow-400" />,

    color: "group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(250,204,21,0.4)]",

    glow: "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.18), transparent 60%)",

  },

  {

    title: "Design Agent",

    description:

      "Review UI, accessibility and component architecture best practices.",

    icon: <PenTool className="w-6 h-6 text-blue-400" />,

    color: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.4)]",

    glow: "radial-gradient(circle at 50% 0%, rgba(96,165,250,0.18), transparent 60%)",

  },

  {

    title: "Testing Agent",

    description:

      "Suggest missing test coverage, mock strategies, and edge cases.",

    icon: <TestTube2 className="w-6 h-6 text-green-400" />,

    color: "group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)]",

    glow: "radial-gradient(circle at 50% 0%, rgba(74,222,128,0.18), transparent 60%)",

  },

];


// Single 3D-tilt card. Mouse position drives rotation; spring physics keeps

// the motion smooth. Children are layered in Z so the icon, title, and body

// float at different depths.

function TiltCard({ feature, index }) {

  const x = useMotionValue(0);

  const y = useMotionValue(0);


  const rotateX = useTransform(y, [-150, 150], [12, -12]);

  const rotateY = useTransform(x, [-150, 150], [-12, 12]);


  const springConfig = { stiffness: 300, damping: 30 };

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

      initial={{ opacity: 0, y: 30 }}

      whileInView={{ opacity: 1, y: 0 }}

      viewport={{ once: true, margin: "-100px" }}

      transition={{ duration: 0.5, delay: index * 0.1 }}

      onMouseMove={handleMouseMove}

      onMouseLeave={handleMouseLeave}

      style={{

        rotateX: rotateXSpring,

        rotateY: rotateYSpring,

        transformPerspective: 1200,

        transformStyle: "preserve-3d",

      }}

      whileHover={{ y: -5 }}

      className={`group relative bg-[#111] border border-white/10 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm ${feature.color}`}

    >

      {/* Color-tinted top-glow that lights up on hover. Layered behind content. */}

      <div

        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"

        style={{ background: feature.glow }}

      />


      {/* Icon (closest to viewer) */}

      <div

        className="bg-white/5 border border-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"

        style={{ transform: "translateZ(40px)" }}

      >

        {feature.icon}

      </div>


      {/* Title (mid-layer) */}

      <h3

        className="text-xl font-semibold text-white mb-3"

        style={{ transform: "translateZ(25px)" }}

      >

        {feature.title}

      </h3>


      {/* Body (back-layer) */}

      <p

        className="text-gray-400 leading-relaxed text-sm"

        style={{ transform: "translateZ(10px)" }}

      >

        {feature.description}

      </p>

    </motion.div>

  );

}


export default function Features() {

  return (

    <section className="py-24 relative z-10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature, index) => (

            <TiltCard key={index} feature={feature} index={index} />

          ))}

        </div>

      </div>

    </section>

  );

}
