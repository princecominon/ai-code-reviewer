"use client";


import { useRef, useState, useCallback, Component, useMemo } from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import { Float, OrbitControls, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";


// === 3D PRIMITIVES =========================================================


// Inline geometry switch so each agent gets a unique, thematic shape.

function AgentGeometry({ type }) {

  switch (type) {

    case "octahedron":

      return <octahedronGeometry args={[0.42, 0]} />;

    case "dodecahedron":

      return <dodecahedronGeometry args={[0.4, 0]} />;

    case "tetrahedron":

      return <tetrahedronGeometry args={[0.5, 0]} />;

    case "torusKnot":

      return <torusKnotGeometry args={[0.28, 0.09, 64, 16]} />;

    default:

      return <icosahedronGeometry args={[0.42, 0]} />;

  }

}


// Animated data pulse - travels from the coordinator core outward toward an

// agent's orbital position. Visually represents the coordinator dispatching

// analysis tasks to specialist agents.

function DataPulse({ orbitRadius, orbitSpeed, orbitOffset, color, phase = 0 }) {

  const meshRef = useRef();

  useFrame((state) => {

    if (!meshRef.current) return;

    const t = state.clock.elapsedTime + phase;

    // 0 -> 1 over a cycle, then resets

    const cycle = ((t * orbitSpeed) % 2) / 2;

    const angle = orbitOffset + cycle * Math.PI * 2;

    meshRef.current.position.x = Math.cos(angle) * orbitRadius * cycle;

    meshRef.current.position.z = Math.sin(angle) * orbitRadius * cycle;

    meshRef.current.position.y = Math.sin(angle * 0.6) * 0.6 * cycle;

    // Subtle growth + fade-out as it travels outward

    meshRef.current.scale.setScalar(0.04 + cycle * 0.05);

    if (meshRef.current.material) {

      meshRef.current.material.opacity = 1 - cycle * cycle;

    }

  });

  return (

    <mesh ref={meshRef}>

      <sphereGeometry args={[1, 12, 12]} />

      <meshBasicMaterial color={color} transparent opacity={1} />

    </mesh>

  );

}


// Central AI brain - glassy icosahedron with inner wireframe + glowing core.

function CoordinatorCore({ safeMode }) {

  const glassRef = useRef();

  const wireRef = useRef();


  useFrame((state, delta) => {

    if (glassRef.current) {

      glassRef.current.rotation.x += delta * 0.12;

      glassRef.current.rotation.y += delta * 0.18;

    }

    if (wireRef.current) {

      wireRef.current.rotation.x -= delta * 0.25;

      wireRef.current.rotation.y -= delta * 0.35;

    }

  });


  return (

    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>

      {/* Outer glass icosahedron - high-res transmission */}

      <mesh ref={glassRef}>

        <icosahedronGeometry args={[1.2, 0]} />

        {safeMode ? (

          <meshPhysicalMaterial

            color="#a855f7"

            roughness={0.15}

            metalness={0.1}

            transmission={0.9}

            thickness={0.6}

            ior={1.4}

            transparent

            opacity={0.9}

            clearcoat={1}

            clearcoatRoughness={0.1}

          />

        ) : (

          <MeshTransmissionMaterial

            backside

            thickness={0.5}

            roughness={0.08}

            transmission={1}

            ior={1.5}

            chromaticAberration={0.06}

            anisotropy={0.4}

            distortion={0.3}

            distortionScale={0.4}

            temporalDistortion={0.1}

            color="#a855f7"

            resolution={512}

            samples={8}

          />

        )}

      </mesh>


      {/* Inner wireframe icosahedron - counter-rotating, "code structure" feel */}

      <mesh ref={wireRef}>

        <icosahedronGeometry args={[0.75, 1]} />

        <meshBasicMaterial color="#06b6d4" wireframe />

      </mesh>


      {/* Solid glowing nucleus */}

      <mesh>

        <sphereGeometry args={[0.32, 32, 32]} />

        <meshBasicMaterial color="#22d3ee" />

      </mesh>

    </Float>

  );

}


// One orbiting specialist agent.

function AgentNode({

  orbitRadius,

  orbitSpeed,

  orbitOffset,

  tiltX,

  tiltZ,

  color,

  emissive,

  geometryType,

}) {

  const orbitRef = useRef();

  const meshRef = useRef();


  useFrame((state) => {

    if (orbitRef.current) {

      const t = state.clock.elapsedTime * orbitSpeed + orbitOffset;

      orbitRef.current.position.x = Math.cos(t) * orbitRadius;

      orbitRef.current.position.z = Math.sin(t) * orbitRadius;

      orbitRef.current.position.y = Math.sin(t * 0.6) * 0.6;

    }

    if (meshRef.current) {

      meshRef.current.rotation.x += 0.008;

      meshRef.current.rotation.y += 0.012;

    }

  });


  return (

    <group ref={orbitRef} rotation={[tiltX, 0, tiltZ]}>

      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.5}>

        <mesh ref={meshRef}>

          <AgentGeometry type={geometryType} />

          <meshStandardMaterial

            color={color}

            emissive={emissive}

            emissiveIntensity={0.7}

            roughness={0.25}

            metalness={0.6}

          />

        </mesh>

        {/* Per-agent glow halo - ties each shape to its feature-card color */}

        <pointLight color={color} intensity={0.8} distance={2.5} />

      </Float>

    </group>

  );

}


// Two tilted orbital rings (Saturn-style) - reduced radii so the ellipses

// they project stay fully inside the camera viewport.

function OrbitRings() {

  const ring1Ref = useRef();

  const ring2Ref = useRef();

  useFrame((state, delta) => {

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.3;

    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.2;

  });

  return (

    <>

      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>

        <torusGeometry args={[2.1, 0.012, 16, 128]} />

        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />

      </mesh>

      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>

        <torusGeometry args={[2.4, 0.008, 16, 128]} />

        <meshBasicMaterial color="#a855f7" transparent opacity={0.25} />

      </mesh>

    </>

  );

}


// Large wireframe icosphere - sets the scene's scale and depth.

function WireframeGlobe() {

  const ref = useRef();

  useFrame((state, delta) => {

    if (ref.current) {

      ref.current.rotation.y += delta * 0.04;

      ref.current.rotation.x += delta * 0.015;

    }

  });

  return (

    <mesh ref={ref} scale={4}>

      <icosahedronGeometry args={[1, 2]} />

      <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.2} />

    </mesh>

  );

}


// Floating data/code cubes drifting in space.

function DataParticles() {

  const groupRef = useRef();

  const particles = useMemo(() => {

    return new Array(50).fill(0).map(() => ({

      basePos: [

        (Math.random() - 0.5) * 9,

        (Math.random() - 0.5) * 7,

        (Math.random() - 0.5) * 9,

      ],

      speed: 0.3 + Math.random() * 0.6,

      offset: Math.random() * Math.PI * 2,

      isPurple: Math.random() > 0.5,

    }));

  }, []);


  useFrame((state) => {

    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {

      const p = particles[i];

      child.position.y =

        p.basePos[1] + Math.sin(t * p.speed + p.offset) * 0.35;

      child.position.x =

        p.basePos[0] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.25;

      child.position.z =

        p.basePos[2] + Math.sin(t * p.speed * 0.5 + p.offset) * 0.2;

      child.rotation.x += 0.005;

      child.rotation.y += 0.008;

    });

  });


  return (

    <group ref={groupRef}>

      {particles.map((p, i) => (

        <mesh key={i} position={p.basePos}>

          <boxGeometry args={[0.07, 0.07, 0.07]} />

          <meshBasicMaterial color={p.isPurple ? "#a855f7" : "#06b6d4"} />

        </mesh>

      ))}

    </group>

  );

}


// === FALLBACKS =============================================================


// Shown if the scene fails to mount (error boundary catch).

function CanvasFallback() {

  return (

    <div className="w-full h-full flex items-center justify-center">

      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 blur-2xl" />

    </div>

  );

}


// React error boundary so a render-time throw doesn't blank the whole hero.

class CanvasErrorBoundary extends Component {

  constructor(props) {

    super(props);

    this.state = { hasError: false };

  }

  static getDerivedStateFromError() {

    return { hasError: true };

  }

  componentDidCatch(error) {

    console.error("HeroCanvas failed to render:", error);

  }

  render() {

    if (this.state.hasError) return <CanvasFallback />;

    return this.props.children;

  }

}


// === MAIN ==================================================================


// 4 specialist agents - colors match the feature cards (Security / Performance

// / Design / Testing) so the 3D scene visually ties back to the rest of the

// page without introducing a new color scheme.

const AGENTS = [

  { color: "#f87171", emissive: "#7f1d1d", geometryType: "octahedron" },    // Security

  { color: "#facc15", emissive: "#713f12", geometryType: "dodecahedron" }, // Performance

  { color: "#60a5fa", emissive: "#1e3a8a", geometryType: "tetrahedron" },  // Design

  { color: "#4ade80", emissive: "#14532d", geometryType: "torusKnot" },    // Testing

];


export default function HeroCanvas() {

  // contextLost: currently in a lost-context state (briefly shows fallback)

  const [contextLost, setContextLost] = useState(false);

  // safeMode: sticky flag - once true, stays true for this mount so we

  // don't keep re-crashing the GPU on the same heavy material.

  const [safeMode, setSafeMode] = useState(false);


  const handleCreated = useCallback(({ gl }) => {

    const canvasEl = gl.domElement;

    canvasEl.addEventListener(

      "webglcontextlost",

      (event) => {

        event.preventDefault();

        console.warn("WebGL context lost, switching to lighter material.");

        setContextLost(true);

        setSafeMode(true); // downgrade material permanently for this session

      },

      false

    );

    canvasEl.addEventListener(

      "webglcontextrestored",

      () => {

        console.info("WebGL context restored.");

        setContextLost(false);

      },

      false

    );

  }, []);


  if (contextLost) {

    return <CanvasFallback />;

  }


  return (

    <CanvasErrorBoundary>

      <Canvas

        key={safeMode ? "safe" : "full"}

        // Pushed back to z=10 with FOV=50 so the tilted rings (which project

        // as ellipses) are never clipped at the canvas edge, even on narrow

        // vertical aspect ratios.

        camera={{ position: [0, 0, 10], fov: 50 }}

        dpr={[1, 1.5]}

        gl={{

          antialias: false,

          alpha: true,

          powerPreference: "default",

          failIfMajorPerformanceCaveat: false,

        }}

        onCreated={handleCreated}

      >

        {/* Pure mathematical lighting - no network downloads to crash WSL */}

        <ambientLight intensity={0.6} />

        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#06b6d4" />

        <directionalLight position={[-10, -10, -5]} intensity={2.5} color="#a855f7" />

        <pointLight position={[0, 5, 0]} intensity={1.5} color="#22d3ee" />


        <WireframeGlobe />

        <OrbitRings />

        <CoordinatorCore safeMode={safeMode} />


        {/* 4 specialist agent satellites - tighter orbits keep them in view */}

        {AGENTS.map((agent, i) => (

          <AgentNode

            key={i}

            orbitRadius={1.9 + i * 0.08}

            orbitSpeed={0.35 + i * 0.04}

            orbitOffset={(i * Math.PI) / 2}

            tiltX={i % 2 === 0 ? 0.3 : -0.3}

            tiltZ={i % 2 === 0 ? 0.2 : -0.2}

            color={agent.color}

            emissive={agent.emissive}

            geometryType={agent.geometryType}

          />

        ))}


        {/* Flowing data pulses - coordinator dispatching tasks to each agent */}

        {AGENTS.map((agent, i) => (

          <DataPulse

            key={`pulse-${i}`}

            orbitRadius={1.9 + i * 0.08}

            orbitSpeed={0.3}

            orbitOffset={(i * Math.PI) / 2}

            color={agent.color}

            phase={i * 0.7}

          />

        ))}


        <DataParticles />


        {/* Layered sparkles - cyan core + purple accent */}

        <Sparkles count={120} scale={12} size={2.5} speed={0.4} opacity={0.7} color="#22d3ee" />

        <Sparkles count={50} scale={8} size={1.5} speed={0.6} opacity={0.5} color="#a855f7" />


        <OrbitControls

          enableZoom={false}

          enablePan={false}

          autoRotate

          autoRotateSpeed={0.4}

        />

      </Canvas>

    </CanvasErrorBoundary>

  );

}
