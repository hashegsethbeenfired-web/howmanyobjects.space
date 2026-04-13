"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { seededRandom } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/constants";
import type { CountsResponse } from "@/lib/types";

/* ──────────────────────────────────────────────
   Earth Sphere
   ────────────────────────────────────────────── */
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#1a3a5c"
        emissive="#0a1628"
        emissiveIntensity={0.3}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────
   Atmosphere Glow
   ────────────────────────────────────────────── */
function Atmosphere() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={1.15}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        ref={shaderRef}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            float pulse = 1.0 + 0.05 * sin(uTime * 0.5);
            gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.4 * pulse);
          }
        `}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────
   Orbit Rings (LEO, MEO, GEO)
   ────────────────────────────────────────────── */
function OrbitRings() {
  const groupRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00005;
    }
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  // Orbit rings at relative scales (not real scale — compressed for visual)
  const rings = [
    { radius: 1.5, color: "#4da6ff", label: "LEO" },
    { radius: 2.2, color: "#a78bfa", label: "MEO" },
    { radius: 3.0, color: "#fbbf24", label: "GEO" },
  ];

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={ring.label} rotation={[Math.PI / 2 + i * 0.15, 0, i * 0.3]}>
          <ringGeometry args={[ring.radius - 0.005, ring.radius + 0.005, 128]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────
   Orbital Particles
   ────────────────────────────────────────────── */
function OrbitalParticles({ counts }: { counts: CountsResponse | null }) {
  const pointsRef = useRef<THREE.Points>(null);

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const maxParticles = isMobile ? 500 : 2000;

  const { positions, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(maxParticles * 3);
    const col = new Float32Array(maxParticles * 3);
    const spd = new Float32Array(maxParticles);

    // Distribution based on counts
    const total = counts?.totalCount || 10000;
    const activeRatio =
      (counts?.countsByType.active_satellite || 7000) / total;
    const debrisRatio = (counts?.countsByType.debris || 2000) / total;
    const rocketRatio =
      (counts?.countsByType.rocket_body || 500) / total;

    for (let i = 0; i < maxParticles; i++) {
      const seed = i;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed + 1000);
      const r3 = seededRandom(seed + 2000);

      // Determine orbit radius (compressed for visual)
      let radius: number;
      const regionRoll = seededRandom(seed + 3000);
      if (regionRoll < 0.75) {
        radius = 1.3 + r1 * 0.7; // LEO band
      } else if (regionRoll < 0.88) {
        radius = 2.0 + r1 * 0.5; // MEO band
      } else {
        radius = 2.8 + r1 * 0.4; // GEO band
      }

      // Spherical distribution
      const theta = r2 * Math.PI * 2;
      const phi = Math.acos(2 * r3 - 1);
      // Flatten slightly for more realistic orbital distribution
      const flatPhi = phi * 0.6 + Math.PI * 0.2;

      pos[i * 3] = radius * Math.sin(flatPhi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(flatPhi) * 0.4;
      pos[i * 3 + 2] = radius * Math.sin(flatPhi) * Math.sin(theta);

      // Colors based on type distribution
      const typeRoll = seededRandom(seed + 4000);
      let color: THREE.Color;
      if (typeRoll < activeRatio) {
        color = new THREE.Color(TYPE_COLORS.active_satellite);
      } else if (typeRoll < activeRatio + debrisRatio) {
        color = new THREE.Color(TYPE_COLORS.debris);
      } else if (typeRoll < activeRatio + debrisRatio + rocketRatio) {
        color = new THREE.Color(TYPE_COLORS.rocket_body);
      } else {
        color = new THREE.Color(TYPE_COLORS.inactive_satellite);
      }

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // Orbital speed (inverse of radius for Keplerian feel)
      spd[i] = (0.2 + seededRandom(seed + 5000) * 0.3) / radius;
    }

    return { positions: pos, colors: col, speeds: spd };
  }, [maxParticles, counts]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < maxParticles; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const radius = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x) + speeds[i] * t;

      posArray[i * 3] = radius * Math.cos(angle);
      // Y stays the same
      posArray[i * 3 + 2] = radius * Math.sin(angle);
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.015 : 0.012}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ──────────────────────────────────────────────
   Scene Setup
   ────────────────────────────────────────────── */
function Scene({ counts }: { counts: CountsResponse | null }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#b0c4de" />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#4da6ff" />

      <Stars
        radius={100}
        depth={60}
        count={3000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.3}
      />

      <Earth />
      <Atmosphere />
      <OrbitRings />
      <OrbitalParticles counts={counts} />
    </>
  );
}

/* ──────────────────────────────────────────────
   Camera Controller — Slow drift
   ────────────────────────────────────────────── */
function CameraDrift() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.05;
    camera.position.x = 5 * Math.cos(t) * 0.3;
    camera.position.y = 1.5 + Math.sin(t * 0.5) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ──────────────────────────────────────────────
   Main Export
   ────────────────────────────────────────────── */
interface EarthVisualizationProps {
  counts: CountsResponse | null;
}

export default function EarthVisualization({
  counts,
}: EarthVisualizationProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Don't render on server
  if (!mounted) {
    return (
      <div className="hero__canvas-container">
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at center, #0a1628 0%, #060a14 100%)",
          }}
        />
      </div>
    );
  }

  // Fallback if WebGL not available
  if (hasError) {
    return (
      <div className="hero__canvas-container">
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at center, #0a1628 0%, #060a14 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="hero__canvas-container" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onError={handleError}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#060a14"]} />
        <fog attach="fog" args={["#060a14", 8, 20]} />
        <Scene counts={counts} />
        <CameraDrift />
      </Canvas>
    </div>
  );
}
