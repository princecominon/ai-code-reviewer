"use client";


import { useState } from "react";

import { useRouter } from "next/navigation"; // 1. Import the router

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

import { ArrowRight, Loader2, Search } from "lucide-react";

import dynamic from "next/dynamic";


// Raw SVG for Github

const GithubIcon = ({ className }) => (

  <svg

    xmlns="http://www.w3.org/2000/svg"

    width="24"

    height="24"

    viewBox="0 0 24 24"

    fill="none"

    stroke="currentColor"

    strokeWidth="2"

    strokeLinecap="round"

    strokeLinejoin="round"

    className={className}

  >

    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />

    <path d="M9 18c-4.51 2-5-2-7-2" />

  </svg>

);


// Loaded client-side only (3D canvas can't SSR)

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {

  ssr: false,

  loading: () => (

    <div className="w-full h-full flex items-center justify-center text-cyan-500">

      <Loader2 className="w-8 h-8 animate-spin" />

    </div>

  ),

});


export default function Hero() {

  const [showInput, setShowInput] = useState(false);

  const [url, setUrl] = useState("");


  const router = useRouter(); // 2. Initialize the router


  // Parallax tilt - tracks the mouse anywhere in the section and tilts the

  // text container in 3D. Range is intentionally subtle (±3deg) to fit the

  // dark/cinematic tone without feeling "jiggly".

  const mouseX = useMotionValue(0);

  const mouseY = useMotionValue(0);

  const tiltX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), {

    stiffness: 150,

    damping: 20,

  });

  const tiltY = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), {

    stiffness: 150,

    damping: 20,

  });


  function handleSectionMouseMove(e) {

    const rect = e.currentTarget.getBoundingClientRect();

    mouseX.set(e.clientX - rect.left - rect.width / 2);

    mouseY.set(e.clientY - rect.top - rect.height / 2);

  }

  function handleSectionMouseLeave() {

    mouseX.set(0);

    mouseY.set(0);

  }


  const handleSubmit = (e) => {

    e.preventDefault();

    if (!url) return;


    // 3. Push the user to the new route with the URL attached as a query parameter

    router.push(`/review?pr=${encodeURIComponent(url)}`);

  };


  return (

    <section

      className="relative min-h-screen flex items-center pt-20 pb-10"

      onMouseMove={handleSectionMouseMove}

      onMouseLeave={handleSectionMouseLeave}

      style={{ perspective: "1500px" }}

    >

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">

        {/* Parallax-tilted text container. Children use translateZ for

            layered depth so the title, subtitle, etc. feel like floating

            panels when the container tilts. */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.8, ease: "easeOut" }}

          style={{

            rotateX: tiltX,

            rotateY: tiltY,

            transformPerspective: 1500,

            transformStyle: "preserve-3d",

          }}

          className="space-y-8 z-10"

        >

          <div style={{ transform: "translateZ(60px)" }}>

            <motion.div

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.8, ease: "easeOut" }}

              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cyan-400 backdrop-blur-md"

            >

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>

                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>

              </span>

              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-300">LIVE</span>

              <span className="text-white/40">•</span>

              <span>Multi-Agent PR Review</span>

            </motion.div>

          </div>


          <div style={{ transform: "translateZ(80px)" }}>

            <motion.h1

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}

              className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"

            >

              AI Code Reviewer

            </motion.h1>

          </div>


          <div style={{ transform: "translateZ(50px)" }}>

            <motion.p

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}

              className="text-xl text-gray-300 font-medium"

            >

              Multi-Agent GitHub Pull Request Analysis

            </motion.p>

          </div>


          <div style={{ transform: "translateZ(30px)" }}>

            <motion.p

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}

              className="text-gray-400 text-lg max-w-lg leading-relaxed"

            >

              Automatically reviews GitHub pull requests using Security,

              Performance, Design, Testing and Architecture specialist agents

              before posting a consolidated review.

            </motion.p>

          </div>


          <div className="pt-4 h-16" style={{ transform: "translateZ(70px)" }}>

            {!showInput ? (

              <motion.div

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}

                className="flex flex-wrap items-center gap-4"

              >

                <button

                  onClick={() => setShowInput(true)}

                  className="group relative px-6 py-3 bg-white text-black font-semibold rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 flex items-center gap-2"

                >

                  <span className="relative z-10 flex items-center gap-2">

                    Analyze Pull Request{" "}

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                  </span>

                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                </button>

                <a

                  href="https://github.com/princecominon/ai-code-reviewer"

                  target="_blank"

                  rel="noopener noreferrer"

                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer"

                >

                  <GithubIcon className="w-5 h-5" /> View GitHub

                </a>

              </motion.div>

            ) : (

              <motion.form

                initial={{ opacity: 0, x: -20 }}

                animate={{ opacity: 1, x: 0 }}

                transition={{ duration: 0.4 }}

                onSubmit={handleSubmit}

                className="flex gap-2 max-w-md"

              >

                <div className="relative flex-1">

                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

                  <input

                    type="url"

                    required

                    placeholder="Paste GitHub PR URL..."

                    value={url}

                    onChange={(e) => setUrl(e.target.value)}

                    className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500/50 transition-colors"

                  />

                </div>

                <button

                  type="submit"

                  className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors"

                >

                  Run

                </button>

              </motion.form>

            )}

          </div>

        </motion.div>


        {/* Right Side: 3D Scene */}

        <div className="h-[500px] lg:h-[700px] w-full relative z-0">

          <HeroCanvas />

        </div>

      </div>

    </section>

  );

}
