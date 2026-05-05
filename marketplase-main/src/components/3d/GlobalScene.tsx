"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ═══ SCROLL STORE ═══ */
const scroll = { progress: 0, vh: 0, raw: 0 };
let prevRaw = 0;

if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => {
    const top = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scroll.raw = top;
    scroll.progress = h > 0 ? top / h : 0;
    scroll.vh = top / window.innerHeight;
    prevRaw = top;
  }, { passive: true });
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return clamp(outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin), Math.min(outMin, outMax), Math.max(outMin, outMax));
}

/* ═══ GLOW RING ═══ */
function GlowRing({ radius, color, speed, thickness = 0.02, scrollSpeed = 1 }: {
  radius: number; color: string; speed: number; thickness?: number; scrollSpeed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.progress;
    ref.current.rotation.x = Math.PI / 2 + t * speed + s * Math.PI * scrollSpeed;
    ref.current.rotation.z = t * speed * 0.3 + s * Math.PI * scrollSpeed * 0.5;
    matRef.current.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15 + s * 0.3;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} metalness={1} transparent opacity={0.7} />
    </mesh>
  );
}

/* ═══ HERO — Iridescent Torus Knot ═══ */
function HeroModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const smooth = useRef({ rotX: 0, rotY: 0, posX: 0, posY: 0, scale: 2.0 });

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;

    const targetRotX = t * 0.12 + s * Math.PI * 1.5;
    const targetRotY = t * 0.18 + s * Math.PI * 0.8;
    const targetPosX = s * 2.5;
    const targetPosY = -s * 1.5;
    const targetScale = Math.max(0.3, 2.0 - s * 0.5);

    const l = 0.08;
    smooth.current.rotX = lerp(smooth.current.rotX, targetRotX, l);
    smooth.current.rotY = lerp(smooth.current.rotY, targetRotY, l);
    smooth.current.posX = lerp(smooth.current.posX, targetPosX, l);
    smooth.current.posY = lerp(smooth.current.posY, targetPosY, l);
    smooth.current.scale = lerp(smooth.current.scale, targetScale, l);

    meshRef.current.rotation.x = smooth.current.rotX;
    meshRef.current.rotation.y = smooth.current.rotY;
    meshRef.current.rotation.z = t * 0.04 + s * 0.3;

    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
    groupRef.current.scale.setScalar(smooth.current.scale);

    // Iridescent color shift
    const hue = (t * 0.05 + s * 0.2) % 1;
    matRef.current.color.setHSL(hue, 0.8, 0.55);
    matRef.current.emissive.setHSL(hue, 0.9, 0.3);
    matRef.current.emissiveIntensity = 0.2 + Math.sin(t * 1.5) * 0.05 + s * 0.1;

    const fadeOut = clamp(1 - (s - 2.5) * 0.8, 0, 1);
    matRef.current.opacity = fadeOut;
    groupRef.current.visible = fadeOut > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.35, 256, 48]} />
        <meshPhysicalMaterial ref={matRef} color="#ff8040" roughness={0.02} metalness={1} emissive="#ff4500" emissiveIntensity={0.15} clearcoat={1} clearcoatRoughness={0.02} transparent opacity={1} />
      </mesh>
      <GlowRing radius={2.2} color="#a855f7" speed={0.35} scrollSpeed={1.2} />
      <GlowRing radius={2.8} color="#00d4ff" speed={-0.2} thickness={0.015} scrollSpeed={0.8} />
      <GlowRing radius={3.4} color="#ff8040" speed={0.15} thickness={0.012} scrollSpeed={1.5} />
    </group>
  );
}

/* ═══ PRODUCTS — Glass Icosahedron ═══ */
function ProductsModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const smooth = useRef({ rotX: 0, rotY: 0, posX: 6, posY: -3, scale: 0, opacity: 0 });

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;
    const vis = clamp(mapRange(s, 2.5, 3.5, 0, 1) - mapRange(s, 5.5, 6.5, 0, 1), 0, 1);

    const l = 0.06;
    smooth.current.rotX = lerp(smooth.current.rotX, t * 0.25 + s * Math.PI * 1.2, l);
    smooth.current.rotY = lerp(smooth.current.rotY, t * 0.15 + s * Math.PI * 0.6, l);
    smooth.current.posX = lerp(smooth.current.posX, lerp(5, -2.5, vis), l);
    smooth.current.posY = lerp(smooth.current.posY, lerp(-3, -3.5, vis), l);
    smooth.current.scale = lerp(smooth.current.scale, vis * 1.4, l);
    smooth.current.opacity = lerp(smooth.current.opacity, vis, l);

    meshRef.current.rotation.x = smooth.current.rotX;
    meshRef.current.rotation.y = smooth.current.rotY;
    meshRef.current.rotation.z = t * 0.1;

    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
    groupRef.current.scale.setScalar(Math.max(0.01, smooth.current.scale));
    matRef.current.opacity = smooth.current.opacity;
    groupRef.current.visible = smooth.current.opacity > 0.01;
    matRef.current.transmission = 0.6 + Math.sin(t) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshPhysicalMaterial ref={matRef} color="#00d4ff" roughness={0.02} metalness={0.3} transmission={0.7} thickness={2.5} clearcoat={1} clearcoatRoughness={0.03} emissive="#003366" emissiveIntensity={0.15} transparent opacity={0} ior={1.5} />
      </mesh>
      <GlowRing radius={2.0} color="#ff8040" speed={0.4} thickness={0.015} scrollSpeed={2} />
      <GlowRing radius={2.5} color="#00d4ff" speed={-0.3} thickness={0.01} scrollSpeed={1} />
    </group>
  );
}

/* ═══ CATEGORIES — Wireframe Dodecahedron ═══ */
function CategoriesModel() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const outerMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const smooth = useRef({ rotX: 0, rotY: 0, posX: -5, posY: -7, scale: 0, opacity: 0 });

  useFrame((state) => {
    if (!outerRef.current || !innerRef.current || !groupRef.current || !outerMatRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;
    const vis = clamp(mapRange(s, 5.5, 6.5, 0, 1) - mapRange(s, 8.5, 9.5, 0, 1), 0, 1);

    const l = 0.06;
    smooth.current.rotX = lerp(smooth.current.rotX, t * 0.1 + s * Math.PI * 2, l);
    smooth.current.rotY = lerp(smooth.current.rotY, t * 0.15 + s * Math.PI * 1.5, l);
    smooth.current.posX = lerp(smooth.current.posX, lerp(-5, 3, vis), l);
    smooth.current.posY = lerp(smooth.current.posY, lerp(-7, -7.5, vis), l);
    smooth.current.scale = lerp(smooth.current.scale, vis * 1.5, l);
    smooth.current.opacity = lerp(smooth.current.opacity, vis, l);

    outerRef.current.rotation.x = smooth.current.rotX;
    outerRef.current.rotation.y = smooth.current.rotY;
    innerRef.current.rotation.x = -smooth.current.rotX * 0.7;
    innerRef.current.rotation.y = -smooth.current.rotY * 0.5;

    const pulse = 1 + Math.sin(t * 2.5) * 0.04;
    groupRef.current.scale.setScalar(Math.max(0.01, smooth.current.scale * pulse));
    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
    outerMatRef.current.opacity = smooth.current.opacity;
    groupRef.current.visible = smooth.current.opacity > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={outerRef}>
        <dodecahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial ref={outerMatRef} color="#22c55e" wireframe emissive="#116633" emissiveIntensity={0.35} transparent opacity={0} />
      </mesh>
      <mesh ref={innerRef} scale={0.65}>
        <dodecahedronGeometry args={[1.3, 0]} />
        <meshPhysicalMaterial color="#22c55e" roughness={0.05} metalness={0.85} clearcoat={1} emissive="#116633" emissiveIntensity={0.12} transparent opacity={0.9} />
      </mesh>
      <GlowRing radius={2.2} color="#22c55e" speed={0.25} thickness={0.015} scrollSpeed={2} />
    </group>
  );
}

/* ═══ SELLERS — Double Octahedron ═══ */
function SellersModel() {
  const mesh1Ref = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const mat1Ref = useRef<THREE.MeshStandardMaterial>(null);
  const mat2Ref = useRef<THREE.MeshStandardMaterial>(null);
  const smooth = useRef({ posX: 5, posY: -10, scale: 0, opacity: 0 });

  useFrame((state) => {
    if (!mesh1Ref.current || !mesh2Ref.current || !groupRef.current) return;
    if (!mat1Ref.current || !mat2Ref.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;
    const vis = clamp(mapRange(s, 9, 10, 0, 1) - mapRange(s, 12, 13, 0, 1), 0, 1);

    const l = 0.06;
    smooth.current.posX = lerp(smooth.current.posX, lerp(5, -3, vis), l);
    smooth.current.posY = lerp(smooth.current.posY, lerp(-10, -11, vis), l);
    smooth.current.scale = lerp(smooth.current.scale, vis * 1.4, l);
    smooth.current.opacity = lerp(smooth.current.opacity, vis, l);

    mesh1Ref.current.rotation.x = t * 0.2 + s * Math.PI * 1.8;
    mesh1Ref.current.rotation.y = t * 0.3 + s * Math.PI;
    mesh2Ref.current.rotation.x = -t * 0.15 + s * Math.PI * 1.2;
    mesh2Ref.current.rotation.y = -t * 0.25 - s * Math.PI * 0.7;

    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
    groupRef.current.scale.setScalar(Math.max(0.01, smooth.current.scale));
    mat1Ref.current.opacity = smooth.current.opacity;
    mat2Ref.current.opacity = smooth.current.opacity * 0.5;
    groupRef.current.visible = smooth.current.opacity > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={mesh1Ref}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial ref={mat1Ref} color="#a855f7" roughness={0.08} metalness={0.92} emissive="#7c3aed" emissiveIntensity={0.25} transparent opacity={0} />
      </mesh>
      <mesh ref={mesh2Ref} scale={1.6}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial ref={mat2Ref} color="#a855f7" wireframe transparent opacity={0} />
      </mesh>
      <GlowRing radius={2.0} color="#a855f7" speed={0.3} thickness={0.02} scrollSpeed={1.5} />
      <GlowRing radius={2.6} color="#ff8040" speed={-0.2} thickness={0.012} scrollSpeed={1} />
    </group>
  );
}

/* ═══ ABOUT — Morphing Torus ═══ */
function AboutModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const smooth = useRef({ posX: -5, posY: -14, scale: 0, opacity: 0, scaleX: 1, scaleY: 1, scaleZ: 1 });

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;
    const vis = clamp(mapRange(s, 12, 13, 0, 1) - mapRange(s, 15.5, 16.5, 0, 1), 0, 1);

    const l = 0.06;
    smooth.current.posX = lerp(smooth.current.posX, lerp(-5, 2.5, vis), l);
    smooth.current.posY = lerp(smooth.current.posY, lerp(-14, -14.5, vis), l);
    smooth.current.scale = lerp(smooth.current.scale, vis * 1.4, l);
    smooth.current.opacity = lerp(smooth.current.opacity, vis, l);

    const morphFactor = mapRange(s, 12, 14, 0, 1);
    smooth.current.scaleX = lerp(smooth.current.scaleX, 1 + morphFactor * 0.5, l);
    smooth.current.scaleY = lerp(smooth.current.scaleY, 1 - morphFactor * 0.3, l);
    smooth.current.scaleZ = lerp(smooth.current.scaleZ, 1 + morphFactor * 0.3, l);

    meshRef.current.rotation.x = t * 0.15 + s * Math.PI * 1.5;
    meshRef.current.rotation.y = t * 0.2 + s * Math.PI;
    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;

    const baseScale = Math.max(0.01, smooth.current.scale);
    meshRef.current.scale.set(baseScale * smooth.current.scaleX, baseScale * smooth.current.scaleY, baseScale * smooth.current.scaleZ);
    matRef.current.opacity = smooth.current.opacity;
    groupRef.current.visible = smooth.current.opacity > 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.2, 0.4, 64, 128]} />
        <meshPhysicalMaterial ref={matRef} color="#f59e0b" roughness={0.03} metalness={0.9} emissive="#d97706" emissiveIntensity={0.2} clearcoat={0.6} transparent opacity={0} />
      </mesh>
      <GlowRing radius={2.0} color="#f59e0b" speed={0.3} thickness={0.018} scrollSpeed={2} />
      <GlowRing radius={2.6} color="#a855f7" speed={-0.15} thickness={0.012} scrollSpeed={1} />
    </group>
  );
}

/* ═══ TESTIMONIALS — Sphere Cluster ═══ */
function TestimonialsModel() {
  const groupRef = useRef<THREE.Group>(null);
  const spheresRef = useRef<THREE.Group>(null);
  const smooth = useRef({ posX: 5, posY: -17, scale: 0, opacity: 0 });

  useFrame((state) => {
    if (!groupRef.current || !spheresRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.vh;
    const vis = clamp(mapRange(s, 16, 17, 0, 1) - mapRange(s, 19, 20, 0, 1), 0, 1);

    const l = 0.06;
    smooth.current.posX = lerp(smooth.current.posX, lerp(5, -2.5, vis), l);
    smooth.current.posY = lerp(smooth.current.posY, lerp(-17, -17.5, vis), l);
    smooth.current.scale = lerp(smooth.current.scale, vis * 1.2, l);
    smooth.current.opacity = lerp(smooth.current.opacity, vis, l);

    spheresRef.current.rotation.x = t * 0.12 + s * Math.PI;
    spheresRef.current.rotation.y = t * 0.18 + s * Math.PI * 0.6;

    groupRef.current.position.x = smooth.current.posX;
    groupRef.current.position.y = smooth.current.posY;
    groupRef.current.scale.setScalar(Math.max(0.01, smooth.current.scale));
    groupRef.current.visible = smooth.current.opacity > 0.01;

    const scatter = mapRange(s, 16, 19, 0, 1);
    spheresRef.current?.children.forEach((child, i) => {
      if (i === 0) return;
      const angle = (i / (spheresRef.current.children.length - 1)) * Math.PI * 2;
      const dist = 0.6 + scatter * 1.2;
      child.position.x = Math.cos(angle + t * 0.3) * dist;
      child.position.y = Math.sin(angle + t * 0.3) * dist;
      child.position.z = Math.sin(angle * 2 + t * 0.5) * dist * 0.5;
    });
  });

  const sphereColors = ["#ff8040", "#00d4ff", "#a855f7", "#22c55e", "#f59e0b"];

  return (
    <group ref={groupRef}>
      <group ref={spheresRef}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhysicalMaterial color="#ff8040" roughness={0.05} metalness={0.9} emissive="#ff4500" emissiveIntensity={0.2} clearcoat={0.8} transparent opacity={0.9} />
        </mesh>
        {sphereColors.map((color, i) => (
          <mesh key={i} position={[0.6, 0, 0]}>
            <sphereGeometry args={[0.25, 24, 24]} />
            <meshPhysicalMaterial color={color} roughness={0.05} metalness={0.85} emissive={color} emissiveIntensity={0.15} clearcoat={0.6} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      <GlowRing radius={2.0} color="#ff8040" speed={0.2} thickness={0.015} scrollSpeed={1.5} />
    </group>
  );
}

/* ═══ FLOATING PARTICLES ═══ */
function Particles({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#ff8040");
    const c2 = new THREE.Color("#00d4ff");
    const c3 = new THREE.Color("#a855f7");
    const palette = [c1, c2, c3];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 4;
      const c = palette[i % 3];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.progress;
    ref.current.rotation.y = t * 0.015 + s * Math.PI * 0.5;
    ref.current.rotation.x = s * 0.15;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ═══ CAMERA CONTROLLER ═══ */
function CameraController() {
  const smooth = useRef({ y: 0, x: 0, lookY: 0 });

  useFrame((state) => {
    const s = scroll.vh;
    const cam = state.camera as THREE.PerspectiveCamera;
    const targetY = -s * 1.0;
    const targetX = Math.sin(s * 0.4) * 0.8;
    const l = 0.05;
    smooth.current.y = lerp(smooth.current.y, targetY, l);
    smooth.current.x = lerp(smooth.current.x, targetX, l);
    smooth.current.lookY = lerp(smooth.current.lookY, targetY, l);
    cam.position.y = smooth.current.y;
    cam.position.x = smooth.current.x;
    cam.lookAt(smooth.current.x * 0.3, smooth.current.lookY, 0);
  });
  return null;
}

/* ═══ LIGHTS ═══ */
function Rig() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    lightRef.current.position.x = Math.sin(t * 0.3) * 4;
    lightRef.current.position.z = Math.cos(t * 0.3) * 4 + 2;
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#00d4ff" />
      <pointLight ref={lightRef} position={[2, 3, 4]} intensity={1.0} color="#ff8040" distance={20} />
      <pointLight position={[0, -5, -3]} intensity={0.4} color="#a855f7" distance={15} />
      <pointLight position={[-4, 2, 2]} intensity={0.3} color="#00d4ff" distance={12} />
    </>
  );
}

/* ═══ MAIN SCENE ═══ */
export function GlobalScene() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "transparent" }}
      >
        <Rig />
        <CameraController />
        <HeroModel />
        <ProductsModel />
        <CategoriesModel />
        <SellersModel />
        <AboutModel />
        <TestimonialsModel />
        <Particles count={350} />
        <fog attach="fog" args={["#000000", 12, 28]} />
      </Canvas>
    </div>
  );
}
