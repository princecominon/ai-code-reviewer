import Hero from "@/components/Hero";

import Features from "@/components/Features";

import Workflow from "@/components/Workflow";

import Stats from "@/components/Stats";

import Footer from "@/components/Footer";


export default function Home() {

  return (

    <main className="min-h-screen bg-[#030712] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Keyframes for the 3D grid scroll. Inlined so we don't need a separate

          globals.css edit. */}

      <style>{`

        @keyframes gridScroll {

          0%   { background-position: 0 0; }

          100% { background-position: 0 60px; }

        }

        .animate-grid-scroll {

          animation: gridScroll 8s linear infinite;

        }

      `}</style>


      {/* Ambient background glows (existing) */}

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />


      {/* 3D perspective grid that scrolls downward across the WHOLE page.

          Rotated 70deg on X for a "floor receding into the distance" feel.

          Masked top + bottom so it fades in/out smoothly. */}

      <div

        className="fixed inset-0 pointer-events-none -z-10"

        style={{ perspective: "500px", perspectiveOrigin: "50% 0%" }}

      >

        <div

          className="absolute inset-0 animate-grid-scroll"

          style={{

            backgroundImage: `

              linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px),

              linear-gradient(90deg, rgba(168, 85, 247, 0.07) 1px, transparent 1px)

            `,

            backgroundSize: "60px 60px",

            transform: "rotateX(70deg)",

            transformOrigin: "50% 0%",

            maskImage:

              "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",

            WebkitMaskImage:

              "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",

          }}

        />

      </div>


      <Hero />

      <Features />

      <Workflow />

      <Stats />

      <Footer />

    </main>

  );

}

