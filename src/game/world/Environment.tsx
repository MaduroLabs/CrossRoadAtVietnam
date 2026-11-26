import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Box, Cone, Cylinder, Icosahedron, Line, Torus } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import type { LevelConfig } from '../levels/level.config'

const ROOT = '/assets/environment/'
const ART = {
  pho: `${ROOT}signage/pho-minh-tam.svg`,
  menu: `${ROOT}signage/pho-menu.svg`,
  barber: `${ROOT}signage/nhan-barber.svg`,
  services: `${ROOT}signage/barber-services.svg`,
  repair: `${ROOT}signage/sua-xe-may.svg`,
  grocery: `${ROOT}signage/tap-hoa-minh-an.svg`,
  tea: `${ROOT}signage/tea-cart.svg`,
  products: `${ROOT}packaging/grocery-products-atlas.svg`,
  snacks: `${ROOT}packaging/snacks-atlas.svg`,
  tile: `${ROOT}surfaces/ceramic-tile.svg`,
  shutter: `${ROOT}surfaces/metal-shutter.svg`,
  wear: `${ROOT}surfaces/wall-wear.svg`,
} as const

type Vec3 = [number, number, number]
type BusinessType = 'pho' | 'barber' | 'repair' | 'grocery' | 'tea' | 'home' | 'cafe'

const SIZES: Record<BusinessType, { width: number; height: number; depth: number }> = {
  pho: { width: 7.2, height: 6.55, depth: 5.4 },
  barber: { width: 4.65, height: 5.9, depth: 4.9 },
  repair: { width: 5.35, height: 5.75, depth: 5.25 },
  grocery: { width: 5.45, height: 6.05, depth: 5.1 },
  tea: { width: 4.65, height: 5.75, depth: 4.7 },
  home: { width: 5, height: 5.95, depth: 4.8 },
  cafe: { width: 5.1, height: 6.15, depth: 5 },
}

function srgb(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
}

function ImagePlane({ src, width, height, position, rotation = [0, Math.PI, 0], opacity = 1 }: { src: string; width: number; height: number; position: Vec3; rotation?: Vec3; opacity?: number }) {
  const texture = useLoader(THREE.TextureLoader, src)
  useEffect(() => srgb(texture), [texture])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent={opacity < 1} opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  )
}

function TexturedBox({ src, args, position, color = '#a6a79a' }: { src: string; args: [number, number, number]; position: Vec3; color?: string }) {
  const texture = useLoader(THREE.TextureLoader, src)
  useEffect(() => srgb(texture), [texture])
  return <Box args={args} position={position}><meshStandardMaterial map={texture} color={color} roughness={0.9} /></Box>
}

function AtlasTile({ src, columns, width, height, position, column, row }: { src: string; columns: number; width: number; height: number; position: Vec3; column: number; row: number }) {
  const source = useLoader(THREE.TextureLoader, src)
  const texture = useMemo(() => {
    const next = source.clone()
    next.wrapS = THREE.ClampToEdgeWrapping
    next.wrapT = THREE.ClampToEdgeWrapping
    next.repeat.set(1 / columns, 0.5)
    next.offset.set(column / columns, row === 0 ? 0.5 : 0)
    srgb(next)
    return next
  }, [source, columns, column, row])
  return <mesh position={position} rotation={[0, Math.PI, 0]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
}

function Sign({ src, width, height, y, facadeZ, frame = '#303b3a' }: { src: string; width: number; height: number; y: number; facadeZ: number; frame?: string }) {
  return <group><Box args={[width + 0.16, height + 0.16, 0.18]} position={[0, y, facadeZ - 0.02]} castShadow><meshStandardMaterial color={frame} roughness={0.72} metalness={0.12} /></Box><ImagePlane src={src} width={width} height={height} position={[0, y, facadeZ - 0.125]} /></group>
}

function Poster({ src, width, height, position }: { src: string; width: number; height: number; position: Vec3 }) {
  return <group position={position}><Box args={[width + 0.08, height + 0.08, 0.05]} position={[0, 0, 0.02]}><meshStandardMaterial color="#504940" roughness={0.8} /></Box><ImagePlane src={src} width={width} height={height} position={[0, 0, -0.02]} /></group>
}

function UpperWindow({ x, y, facadeZ, variant }: { x: number; y: number; facadeZ: number; variant: number }) {
  const frame = variant % 2 ? '#3d4f4e' : '#5e5f58'
  return <group position={[x, y, facadeZ - 0.04]}><Box args={[1.12, 1.22, 0.08]}><meshStandardMaterial color={['#78a8ab', '#9eb5af', '#668d98'][variant % 3]} roughness={0.34} metalness={0.06} /></Box><Box args={[1.2, 0.07, 0.12]} position={[0, -0.67, -0.05]}><meshStandardMaterial color={frame} roughness={0.8} /></Box><Box args={[0.07, 1.22, 0.12]} position={[-0.02, 0, -0.05]}><meshStandardMaterial color={frame} roughness={0.8} /></Box>{variant % 2 === 1 && <Box args={[1.14, 0.07, 0.12]} position={[0, 0.05, -0.05]}><meshStandardMaterial color={frame} roughness={0.8} /></Box>}</group>
}

function AC({ x, y, facadeZ, variant }: { x: number; y: number; facadeZ: number; variant: number }) {
  return <group position={[x, y, facadeZ - 0.14]}><Box args={[0.78, 0.46, 0.24]}><meshStandardMaterial color={variant % 2 ? '#a7b3ad' : '#d6d0be'} roughness={0.78} /></Box>{[-0.22, -0.08, 0.08, 0.22].map((offset) => <Box key={offset} args={[0.035, 0.22, 0.025]} position={[offset, 0, -0.14]}><meshStandardMaterial color="#56615e" roughness={0.8} metalness={0.14} /></Box>)}<Box args={[0.92, 0.06, 0.33]} position={[0, -0.28, 0.08]}><meshStandardMaterial color="#4f5b58" roughness={0.85} metalness={0.14} /></Box></group>
}

function Balcony({ width, facadeZ, y, variant }: { width: number; facadeZ: number; y: number; variant: number }) {
  const railWidth = Math.min(width - 0.5, 3.8)
  const rail = variant % 2 ? '#7e604e' : '#465957'
  return <group position={[0, y, facadeZ - 0.28]}><Box args={[railWidth, 0.14, 0.9]} position={[0, 0, -0.22]}><meshStandardMaterial color="#b4a891" roughness={0.9} /></Box><Box args={[railWidth, 0.07, 0.07]} position={[0, 0.64, -0.68]}><meshStandardMaterial color={rail} roughness={0.72} metalness={0.15} /></Box>{Array.from({ length: 7 }, (_, index) => <Box key={index} args={[0.055, 0.68, 0.055]} position={[-railWidth / 2 + 0.22 + index * 0.54, 0.32, -0.68]}><meshStandardMaterial color={rail} roughness={0.72} metalness={0.15} /></Box>)}<Cylinder args={[0.16, 0.18, 0.22, 8]} position={[-0.9, 0.16, -0.42]}><meshStandardMaterial color="#ae6b4b" roughness={0.9} /></Cylinder><Icosahedron args={[0.26, 1]} position={[-0.9, 0.43, -0.42]}><meshStandardMaterial color="#4a7a5b" roughness={1} flatShading /></Icosahedron></group>
}

function ClothesRack({ x, y, facadeZ }: { x: number; y: number; facadeZ: number }) {
  return <group position={[x, y, facadeZ - 0.11]}><Cylinder args={[0.035, 0.035, 1.25, 6]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.62, 0]}><meshStandardMaterial color="#596762" roughness={0.72} metalness={0.25} /></Cylinder>{[-0.38, -0.13, 0.16, 0.4].map((offset, index) => <Box key={offset} args={[0.21, 0.68 + index * 0.05, 0.05]} position={[offset, 0.28, -0.01]}><meshStandardMaterial color={['#b74a3c', '#d3ad42', '#547e72', '#5c6e92'][index]} roughness={0.92} /></Box>)}</group>
}

function Shell({ width, height, depth, facadeZ, variant, balcony = false }: { width: number; height: number; depth: number; facadeZ: number; variant: number; balcony?: boolean }) {
  const upperHeight = Math.max(2.25, height - 3.05)
  return <group><Box args={[width, upperHeight, depth]} position={[0, 3.05 + upperHeight / 2, 0]} castShadow receiveShadow><meshStandardMaterial color={['#c78d70', '#8ca69c', '#c4ac79', '#ad9892', '#789ba0'][variant % 5]} roughness={0.9} /></Box><Box args={[width + 0.2, 0.16, depth + 0.18]} position={[0, height + 0.08, 0]} castShadow><meshStandardMaterial color={['#675046', '#53605b', '#76634f', '#5f5a58'][variant % 4]} roughness={0.86} /></Box><Box args={[width + 0.12, 0.14, depth]} position={[0, 3, 0]}><meshStandardMaterial color="#9f866f" roughness={0.92} /></Box><Box args={[width - 0.32, 2.72, 0.16]} position={[0, 1.48, depth / 2 - 0.13]}><meshStandardMaterial color={variant % 2 ? '#596a68' : '#806e5d'} roughness={0.98} /></Box><Box args={[width - 0.34, 0.08, depth - 0.2]} position={[0, 0.05, 0]}><meshStandardMaterial color="#b6a58b" roughness={0.94} /></Box><Box args={[0.2, 3, depth]} position={[-width / 2 + 0.1, 1.5, 0]} castShadow><meshStandardMaterial color="#a6745b" roughness={0.86} /></Box><Box args={[0.2, 3, depth]} position={[width / 2 - 0.1, 1.5, 0]} castShadow><meshStandardMaterial color="#a6745b" roughness={0.86} /></Box><Box args={[width, 0.16, 0.22]} position={[0, 2.9, facadeZ - 0.04]}><meshStandardMaterial color="#6e594a" roughness={0.84} /></Box><UpperWindow x={-width * 0.24} y={4.15} facadeZ={facadeZ} variant={variant} /><UpperWindow x={width * 0.18} y={4.15} facadeZ={facadeZ} variant={variant + 1} />{height > 6.2 && <UpperWindow x={width * 0.02} y={5.58} facadeZ={facadeZ} variant={variant + 2} />}{balcony && <Balcony width={width} facadeZ={facadeZ} y={3.12} variant={variant} />}<AC x={width * (variant % 2 ? -0.3 : 0.31)} y={height - 0.85} facadeZ={facadeZ} variant={variant} />{variant % 3 === 0 && <ClothesRack x={-width * 0.38} y={height - 1.15} facadeZ={facadeZ} />}{variant % 3 === 1 && <ImagePlane src={ART.wear} width={0.9} height={1.2} position={[width * 0.39, 3.8, facadeZ - 0.075]} opacity={0.56} />}{variant % 4 === 0 && <group position={[width * 0.33, height + 0.42, 0]}><Box args={[0.88, 0.08, 0.88]} position={[0, -0.38, 0]}><meshStandardMaterial color="#505b57" roughness={0.88} /></Box><Cylinder args={[0.4, 0.4, 0.76, 10]}><meshStandardMaterial color="#4c7379" roughness={0.72} metalness={0.05} /></Cylinder></group>}</group>
}

function Awning({ width, facadeZ, colors = ['#f4f0dc', '#32658a', '#c84a3d'] }: { width: number; facadeZ: number; colors?: string[] }) {
  const segmentWidth = (width - 0.35) / 6
  return <group position={[0, 2.72, facadeZ - 0.34]}>{Array.from({ length: 6 }, (_, index) => <Box key={index} args={[segmentWidth + 0.02, 0.1, 0.78]} position={[-width / 2 + 0.18 + segmentWidth / 2 + index * segmentWidth, 0, -0.12]} rotation={[0.18, 0, 0]} castShadow><meshStandardMaterial color={colors[index % colors.length]} roughness={0.82} /></Box>)}{[-width / 2 + 0.16, width / 2 - 0.16].map((x) => <Cylinder key={x} args={[0.035, 0.035, 0.86, 7]} position={[x, -0.25, -0.22]} rotation={[0.18, 0, 0]}><meshStandardMaterial color="#606a66" roughness={0.78} metalness={0.2} /></Cylinder>)}</group>
}

function Stool({ position, color, scale = 1 }: { position: Vec3; color: string; scale?: number }) {
  return <group position={position} scale={scale}><Cylinder args={[0.21, 0.24, 0.08, 10]} position={[0, 0.54, 0]}><meshStandardMaterial color={color} roughness={0.82} /></Cylinder>{[-1, 1].map((side) => <Cylinder key={side} args={[0.025, 0.035, 0.52, 6]} position={[side * 0.1, 0.28, 0]} rotation={[0, 0, side * 0.12]}><meshStandardMaterial color="#68716d" roughness={0.8} metalness={0.15} /></Cylinder>)}</group>
}

function Table({ position, variant }: { position: Vec3; variant: number }) {
  return <group position={position}><Box args={[1.18, 0.08, 0.7]} position={[0, 1, 0]}><meshStandardMaterial color={variant % 2 ? '#6b5a45' : '#73533d'} roughness={0.84} /></Box>{[-0.44, 0.44].flatMap((x) => [-0.22, 0.22].map((z) => <Cylinder key={`${x}-${z}`} args={[0.035, 0.045, 0.98, 6]} position={[x, 0.5, z]}><meshStandardMaterial color="#59625e" roughness={0.8} metalness={0.16} /></Cylinder>))}<Cylinder args={[0.1, 0.12, 0.15, 8]} position={[-0.2, 1.12, 0]}><meshStandardMaterial color="#d8c9a0" roughness={0.7} /></Cylinder><Cylinder args={[0.09, 0.11, 0.13, 8]} position={[0.12, 1.11, 0.08]}><meshStandardMaterial color="#4d7770" roughness={0.78} /></Cylinder></group>
}

function Fan({ position }: { position: Vec3 }) {
  return <group position={position}><Cylinder args={[0.07, 0.07, 0.38, 8]} position={[0, 0.2, 0]}><meshStandardMaterial color="#59615d" metalness={0.25} roughness={0.7} /></Cylinder><Cylinder args={[0.13, 0.13, 0.08, 10]}><meshStandardMaterial color="#b5b6a2" roughness={0.62} metalness={0.2} /></Cylinder>{[0, 1, 2, 3].map((index) => <Box key={index} args={[0.78, 0.025, 0.12]} position={[Math.cos(index * Math.PI / 2) * 0.34, -0.05, Math.sin(index * Math.PI / 2) * 0.34]} rotation={[0, index * Math.PI / 2, 0]}><meshStandardMaterial color="#747b70" roughness={0.75} /></Box>)}</group>
}

function PhoInterior({ width, depth, facadeZ }: { width: number; depth: number; facadeZ: number }) {
  const tables: Vec3[] = [[-1.9, 0, -1.25], [0, 0, -0.25], [1.88, 0, 0.78], [-1.35, 0, 1.48], [0.88, 0, 1.66]]
  return <group><TexturedBox src={ART.tile} args={[width - 0.46, 0.025, depth - 0.3]} position={[0, 0.09, 0]} /><Box args={[width - 0.7, 2.2, 0.14]} position={[0, 1.42, depth / 2 - 0.19]}><meshStandardMaterial color="#e8d5a8" roughness={0.92} /></Box><ImagePlane src={ART.wear} width={width - 0.9} height={1.4} position={[0, 1.44, depth / 2 - 0.27]} rotation={[0, 0, 0]} opacity={0.22} />{tables.map((position, index) => <group key={position.join('-')}><Table position={position} variant={index} /><Stool position={[position[0] - 0.8, 0, position[2]]} color={index % 2 ? '#c64f40' : '#3e7772'} /><Stool position={[position[0] + 0.8, 0, position[2]]} color={index % 2 ? '#3e7772' : '#c64f40'} /></group>)}<group position={[width * 0.32, 1.08, depth / 2 - 0.62]}><Box args={[1.45, 1.55, 0.52]}><meshStandardMaterial color="#9aa4a0" roughness={0.42} metalness={0.52} /></Box><Box args={[1.35, 0.58, 0.06]} position={[0, 0.25, -0.3]}><meshStandardMaterial color="#bdd0c7" roughness={0.24} /></Box><Cylinder args={[0.3, 0.33, 0.45, 12]} position={[-0.35, 0.93, 0]}><meshStandardMaterial color="#4d5d5b" metalness={0.44} roughness={0.42} /></Cylinder><Cylinder args={[0.28, 0.3, 0.42, 12]} position={[0.3, 0.93, 0]}><meshStandardMaterial color="#59645d" metalness={0.42} roughness={0.44} /></Cylinder></group><group position={[-width * 0.36, 0.28, depth / 2 - 0.55]}>{[-0.3, 0, 0.3].map((x) => <Cylinder key={x} args={[0.1, 0.12, 0.2, 10]} position={[x, 0, 0]}><meshStandardMaterial color="#e8e0c8" roughness={0.66} /></Cylinder>)}<Cylinder args={[0.34, 0.38, 0.4, 12]} position={[0, 0.32, 0]}><meshStandardMaterial color="#4e5d5b" metalness={0.5} roughness={0.4} /></Cylinder><Cylinder args={[0.2, 0.21, 0.15, 10]} position={[0, 0.62, 0]}><meshStandardMaterial color="#242b2c" roughness={0.8} /></Cylinder></group><Poster src={ART.menu} width={1.42} height={1.02} position={[-width * 0.27, 1.58, facadeZ - 0.13]} /><Box args={[width - 0.8, 0.035, 0.035]} position={[0, 2.62, facadeZ - 0.35]}><meshStandardMaterial color="#d7d6c0" emissive="#d7d6c0" emissiveIntensity={0.25} /></Box><Fan position={[-1.3, 2.76, 0.3]} /><Fan position={[1.45, 2.76, 1.45]} /><pointLight position={[0, 2.3, 0.7]} color="#ffd889" intensity={1.2} distance={7} decay={2} /></group>
}

function BarberChair({ position, color }: { position: Vec3; color: string }) {
  return <group position={position}><Cylinder args={[0.22, 0.27, 0.84, 10]} position={[0, 0.56, 0]}><meshStandardMaterial color="#4a5553" metalness={0.35} roughness={0.58} /></Cylinder><Box args={[0.62, 0.54, 0.66]} position={[0, 1.18, 0]}><meshStandardMaterial color={color} roughness={0.68} /></Box><Box args={[0.56, 0.82, 0.18]} position={[0, 1.75, 0.18]} rotation={[-0.1, 0, 0]}><meshStandardMaterial color={color} roughness={0.68} /></Box><Box args={[0.22, 0.24, 0.2]} position={[0, 2.25, 0.12]}><meshStandardMaterial color="#b68a67" roughness={0.82} /></Box><Box args={[0.22, 0.06, 0.72]} position={[0, 0.86, 0]}><meshStandardMaterial color="#d0b85c" metalness={0.32} roughness={0.48} /></Box></group>
}

function BarberInterior({ width, depth, facadeZ }: { width: number; depth: number; facadeZ: number }) {
  return <group><TexturedBox src={ART.tile} args={[width - 0.45, 0.025, depth - 0.25]} position={[0, 0.09, 0]} />{[-1.4, 0, 1.4].map((x, index) => <group key={x} position={[x, 0, 1.28]}><Box args={[1.02, 1.45, 0.08]} position={[0, 2.03, 0.02]}><meshStandardMaterial color="#b7d2d0" roughness={0.16} metalness={0.34} /></Box><Box args={[1.1, 0.08, 0.22]} position={[0, 1.25, -0.04]}><meshStandardMaterial color="#493c34" roughness={0.66} /></Box>{[-0.35, -0.1, 0.18, 0.42].map((bottle, bottleIndex) => <Cylinder key={bottle} args={[0.045, 0.06, 0.3 + (bottleIndex % 2) * 0.12, 8]} position={[bottle, 1.48, -0.04]}><meshStandardMaterial color={['#d59c3d', '#6f8a78', '#b64e47', '#517790'][bottleIndex]} roughness={0.62} /></Cylinder>)}</group>)}<BarberChair position={[-1.35, 0, -0.78]} color="#542f2c" /><BarberChair position={[0, 0, -0.58]} color="#343c43" /><BarberChair position={[1.35, 0, -0.38]} color="#5a382c" /><Box args={[width - 0.65, 0.66, 0.52]} position={[0, 0.42, depth / 2 - 0.55]}><meshStandardMaterial color="#384246" roughness={0.76} /></Box><Poster src={ART.services} width={0.56} height={1.66} position={[width / 2 - 0.36, 1.38, facadeZ - 0.13]} /><Box args={[width - 0.8, 0.035, 0.035]} position={[0, 2.67, 0.35]}><meshStandardMaterial color="#e7ddc3" emissive="#e7ddc3" emissiveIntensity={0.32} /></Box><pointLight position={[0, 2.1, 0]} color="#f8dc9b" intensity={1} distance={6} decay={2} /></group>
}

function Bike({ x, z, color, flip = false, scale = 0.72 }: { x: number; z: number; color: string; flip?: boolean; scale?: number }) {
  return <group position={[x, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]} scale={scale}><Cylinder args={[0.3, 0.3, 0.1, 10]} rotation={[Math.PI / 2, 0, 0]} position={[-0.62, 0.3, 0]}><meshStandardMaterial color="#242b2c" roughness={0.92} /></Cylinder><Cylinder args={[0.3, 0.3, 0.1, 10]} rotation={[Math.PI / 2, 0, 0]} position={[0.62, 0.3, 0]}><meshStandardMaterial color="#242b2c" roughness={0.92} /></Cylinder><Box args={[0.2, 0.4, 0.28]} position={[0.5, 0.96, 0]} rotation={[0, 0, -0.1]}><meshStandardMaterial color={color} roughness={0.72} /></Box><Box args={[0.8, 0.11, 0.25]} position={[-0.22, 0.98, 0]}><meshStandardMaterial color="#171f20" roughness={0.92} /></Box><Box args={[0.34, 0.26, 0.28]} position={[-0.62, 0.8, 0]}><meshStandardMaterial color={color} roughness={0.7} /></Box><Cylinder args={[0.023, 0.028, 0.64, 7]} rotation={[0, 0, -0.13]} position={[0.55, 0.56, 0.12]}><meshStandardMaterial color="#9fa7a0" roughness={0.66} metalness={0.28} /></Cylinder><Box args={[0.035, 0.13, 0.18]} position={[0.626, 1.03, 0]}><meshStandardMaterial color="#d5d4b8" roughness={0.36} /></Box></group>
}

function ToolRack({ position }: { position: Vec3 }) {
  return <group position={position}><Box args={[1.45, 0.95, 0.08]}><meshStandardMaterial color="#4c5c5b" roughness={0.7} metalness={0.25} /></Box>{[-0.52, -0.26, 0, 0.27, 0.54].map((x, index) => <group key={x} position={[x, 0, -0.08]}><Cylinder args={[0.025, 0.03, 0.55 + (index % 2) * 0.25, 6]} rotation={[0, 0, (index - 2) * 0.15]}><meshStandardMaterial color="#a6aaa0" metalness={0.6} roughness={0.34} /></Cylinder><Box args={[0.12, 0.08, 0.04]} position={[0, -0.3, 0]}><meshStandardMaterial color="#c55d3c" roughness={0.62} /></Box></group>)}</group>
}

function RepairInterior({ width, depth, facadeZ }: { width: number; depth: number; facadeZ: number }) {
  return <group><TexturedBox src={ART.wear} args={[width - 0.4, 0.025, depth - 0.2]} position={[0, 0.09, 0]} color="#8e765e" /><TexturedBox src={ART.shutter} args={[width - 0.42, 1.12, 0.06]} position={[0, 2.25, facadeZ - 0.03]} /><Box args={[0.13, 2.55, 0.16]} position={[-width / 2 + 0.27, 1.37, facadeZ - 0.05]}><meshStandardMaterial color="#465454" metalness={0.35} roughness={0.7} /></Box><Box args={[1.5, 0.22, 2.25]} position={[-0.8, 0.25, 0.28]}><meshStandardMaterial color="#6d706a" roughness={0.6} metalness={0.36} /></Box><Box args={[1.62, 0.08, 2.3]} position={[-0.8, 0.39, 0.28]}><meshStandardMaterial color="#bc934e" roughness={0.54} metalness={0.36} /></Box><group position={[1.15, 0, depth / 2 - 0.57]}><Box args={[1.5, 0.95, 0.62]} position={[0, 0.64, 0]}><meshStandardMaterial color="#76523b" roughness={0.88} /></Box><Box args={[1.62, 0.08, 0.7]} position={[0, 1.15, 0]}><meshStandardMaterial color="#4a5552" roughness={0.78} metalness={0.22} /></Box>{[-0.45, -0.18, 0.1, 0.38].map((x, index) => <Cylinder key={x} args={[0.05, 0.07, 0.36 + (index % 2) * 0.18, 8]} position={[x, 1.42, 0]}><meshStandardMaterial color={['#b5a15e', '#4a7f83', '#b45342', '#677c93'][index]} roughness={0.7} metalness={0.25} /></Cylinder>)}</group><ToolRack position={[1.05, 2.1, depth / 2 - 0.25]} />{[[-1.75, 0.4, 0.65], [-1.45, 0.4, 1.25], [1.65, 0.36, 1.44]].map(([x, y, z]) => <Torus key={`${x}-${z}`} args={[0.28, 0.08, 10, 20]} rotation={[Math.PI / 2, 0, 0]} position={[x, y, z]}><meshStandardMaterial color="#20282a" roughness={0.94} /></Torus>)}<Bike x={0.8} z={-0.88} color="#9a4b42" scale={0.64} /><Bike x={1.65} z={-0.05} color="#4b6873" scale={0.52} flip /><pointLight position={[0, 2.6, 0.3]} color="#f2c67c" intensity={0.85} distance={6} decay={2} /></group>
}

function GroceryShelf({ x, z, rowOffset }: { x: number; z: number; rowOffset: number }) {
  const width = 1.15
  return <group position={[x, 0, z]}><Box args={[width, 2.25, 0.22]} position={[0, 1.18, 0]}><meshStandardMaterial color="#76553e" roughness={0.88} /></Box>{[-0.8, -0.1, 0.6].map((y, index) => <group key={y}><Box args={[width + 0.12, 0.065, 0.58]} position={[0, y + 0.45, -0.03]}><meshStandardMaterial color="#b38152" roughness={0.82} /></Box>{Array.from({ length: 4 }, (_, packageIndex) => <group key={packageIndex} position={[-width / 2 + 0.16 + packageIndex * 0.28, y + 0.59, -0.34]}><Box args={[0.24, 0.32 + ((packageIndex + index + rowOffset) % 2) * 0.1, 0.15]}><meshStandardMaterial color={['#d65c43', '#3b7c73', '#d4ab3c', '#5979a0'][(packageIndex + rowOffset) % 4]} roughness={0.82} /></Box><AtlasTile src={ART.products} columns={4} width={0.2} height={0.17} position={[0, 0.01, -0.09]} column={(packageIndex + rowOffset) % 4} row={(index + rowOffset) % 2} /></group>)}</group>)}</group>
}

function GroceryInterior({ width, depth, facadeZ }: { width: number; depth: number; facadeZ: number }) {
  return <group><TexturedBox src={ART.tile} args={[width - 0.45, 0.025, depth - 0.25]} position={[0, 0.09, 0]} color="#bca87c" /><TexturedBox src={ART.shutter} args={[width - 0.4, 0.78, 0.06]} position={[0, 2.5, facadeZ - 0.03]} /><GroceryShelf x={-1.7} z={0.62} rowOffset={0} /><GroceryShelf x={0} z={1.15} rowOffset={1} /><GroceryShelf x={1.7} z={0.6} rowOffset={2} /><group position={[0, 0, facadeZ - 0.55]}>{[-1.75, -0.65, 0.52, 1.68].map((x, index) => <group key={x} position={[x, 0, 0]}><Box args={[0.62, 0.54 + (index % 2) * 0.2, 0.65]} position={[0, 0.29, 0]}><meshStandardMaterial color={['#cf5c41', '#54826e', '#d4ab3e', '#55789a'][index]} roughness={0.88} /></Box><AtlasTile src={ART.products} columns={4} width={0.52} height={0.32} position={[0, 0.32, -0.34]} column={index % 4} row={(index + 1) % 2} /></group>)}</group><Box args={[0.9, 0.76, 0.82]} position={[-width / 2 - 0.25, 0.45, facadeZ - 0.65]}><meshStandardMaterial color="#ad774b" roughness={0.94} /></Box><Box args={[0.78, 0.52, 0.76]} position={[width / 2 + 0.18, 0.31, facadeZ - 0.6]}><meshStandardMaterial color="#7a9c7d" roughness={0.92} /></Box><Box args={[0.72, 0.42, 0.7]} position={[width / 2 + 0.35, 0.85, facadeZ - 0.55]}><meshStandardMaterial color="#d0a141" roughness={0.92} /></Box><pointLight position={[0, 2.1, 0.65]} color="#ffe09a" intensity={0.72} distance={6} decay={2} /></group>
}

function TeaStall({ width, depth, facadeZ }: { width: number; depth: number; facadeZ: number }) {
  return <group><TexturedBox src={ART.tile} args={[width - 0.45, 0.025, depth - 0.25]} position={[0, 0.09, 0]} color="#b5a17c" /><Cone args={[1.75, 0.55, 10]} position={[-0.35, 3.05, facadeZ - 0.65]} scale={[1, 0.8, 1]}><meshStandardMaterial color="#dc5b42" roughness={0.88} /></Cone><Cylinder args={[0.035, 0.045, 2.45, 7]} position={[-0.35, 1.65, facadeZ - 0.65]}><meshStandardMaterial color="#626b65" roughness={0.8} metalness={0.18} /></Cylinder><group position={[0.95, 0.9, facadeZ - 0.46]}><Box args={[1.65, 1.1, 0.48]}><meshStandardMaterial color="#48766f" roughness={0.78} /></Box><Box args={[1.4, 0.64, 0.06]} position={[0, 0.12, -0.27]}><meshStandardMaterial color="#b8d3cb" roughness={0.24} metalness={0.12} /></Box>{[-0.55, -0.25, 0.05, 0.38, 0.62].map((x, index) => <Cylinder key={x} args={[0.07, 0.08, 0.45 + (index % 2) * 0.12, 8]} position={[x, 0.9, -0.12]}><meshStandardMaterial color={['#b9d0c7', '#d8a847', '#76a2a5', '#dc6149', '#e0d8b5'][index]} roughness={0.4} /></Cylinder>)}<ImagePlane src={ART.tea} width={1.16} height={0.48} position={[0, 0.37, -0.28]} /></group><Stool position={[-1.38, 0, facadeZ - 1.62]} color="#d15b42" scale={0.84} /><Stool position={[-0.82, 0, facadeZ - 0.75]} color="#3e7772" scale={0.84} /><Stool position={[-0.1, 0, facadeZ - 1.72]} color="#e1bd42" scale={0.84} /><Stool position={[0.86, 0, facadeZ - 1.05]} color="#c8554b" scale={0.84} /><Stool position={[1.38, 0, facadeZ - 1.72]} color="#3c7770" scale={0.84} /><Cylinder args={[0.3, 0.32, 0.62, 10]} position={[-1.85, 0.42, facadeZ - 0.42]}><meshStandardMaterial color="#afb6a5" roughness={0.68} metalness={0.14} /></Cylinder><Cylinder args={[0.16, 0.18, 0.56, 10]} position={[-0.55, 0.48, facadeZ - 0.82]}><meshStandardMaterial color="#9da5a0" roughness={0.52} metalness={0.22} /></Cylinder>{[-1.62, -1.35, -1.08].map((x, index) => <AtlasTile key={x} src={ART.snacks} columns={3} width={0.32} height={0.25} position={[x, 0.98, facadeZ - 0.7]} column={index} row={0} />)}</group>
}

function HomeFront({ width, facadeZ, variant }: { width: number; depth: number; facadeZ: number; variant: number }) {
  return <group><Box args={[width - 0.42, 2.4, 0.08]} position={[0, 1.32, facadeZ - 0.03]}><meshStandardMaterial color={variant % 2 ? '#4c5556' : '#3a5b60'} roughness={0.26} metalness={0.12} /></Box><Box args={[0.08, 2.5, 0.12]} position={[-width * 0.12, 1.35, facadeZ - 0.08]}><meshStandardMaterial color="#8d714f" roughness={0.82} /></Box><Box args={[0.08, 2.5, 0.12]} position={[width * 0.34, 1.35, facadeZ - 0.08]}><meshStandardMaterial color="#8d714f" roughness={0.82} /></Box><Box args={[0.74, 1.7, 0.1]} position={[width * 0.22, 1.2, facadeZ - 0.1]}><meshStandardMaterial color="#6c453b" roughness={0.8} /></Box><ImagePlane src={ART.wear} width={0.9} height={1.25} position={[-width * 0.3, 1.52, facadeZ - 0.095]} opacity={0.5} /></group>
}

function Business({ x, z, type, variant }: { x: number; z: number; type: BusinessType; variant: number }) {
  const size = SIZES[type]
  const facadeZ = -size.depth / 2 - 0.02
  let contents: ReactNode
  if (type === 'pho') contents = <group><Sign src={ART.pho} width={size.width - 0.35} height={1.7} y={size.height - 0.92} facadeZ={facadeZ} frame="#703c2d" /><PhoInterior width={size.width} depth={size.depth} facadeZ={facadeZ} /><Awning width={size.width - 0.6} facadeZ={facadeZ} colors={['#e8d9ad', '#ca4b39', '#e8d9ad']} /></group>
  else if (type === 'barber') contents = <group><Sign src={ART.barber} width={size.width - 0.18} height={1.36} y={size.height - 0.8} facadeZ={facadeZ} frame="#11181c" /><BarberInterior width={size.width} depth={size.depth} facadeZ={facadeZ} /><Awning width={size.width - 0.12} facadeZ={facadeZ} /><Poster src={ART.services} width={0.48} height={1.44} position={[size.width / 2 + 0.1, 1.35, facadeZ - 0.13]} /><Bike x={-1.9} z={facadeZ - 0.85} color="#5f6870" scale={0.58} /><Bike x={1.78} z={facadeZ - 0.78} color="#ad4942" scale={0.55} flip /></group>
  else if (type === 'repair') contents = <group><Sign src={ART.repair} width={size.width - 0.2} height={1.28} y={size.height - 0.78} facadeZ={facadeZ} frame="#213c4a" /><RepairInterior width={size.width} depth={size.depth} facadeZ={facadeZ} /></group>
  else if (type === 'grocery') contents = <group><Sign src={ART.grocery} width={size.width - 0.2} height={1.25} y={size.height - 0.76} facadeZ={facadeZ} frame="#174e51" /><GroceryInterior width={size.width} depth={size.depth} facadeZ={facadeZ} /></group>
  else if (type === 'home') contents = <HomeFront width={size.width} depth={size.depth} facadeZ={facadeZ} variant={variant} />
  else contents = <group><Sign src={ART.tea} width={size.width - 0.38} height={0.85} y={size.height - 0.74} facadeZ={facadeZ} frame="#365b59" /><TeaStall width={size.width} depth={size.depth} facadeZ={facadeZ} /></group>
  return <group position={[x, 0, z]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}><Shell {...size} facadeZ={facadeZ} variant={variant} balcony={type === 'home' || variant % 4 === 0} />{contents}</group>
}

function Pole({ x, z, transformer = false, flag = false }: { x: number; z: number; transformer?: boolean; flag?: boolean }) {
  return <group position={[x, 0, z]}><Cylinder args={[0.11, 0.16, 7.3, 6]} position={[0, 3.65, 0]} castShadow><meshStandardMaterial color="#4c514d" roughness={0.9} /></Cylinder><Box args={[1.8, 0.12, 0.12]} position={[0, 6.65, 0]}><meshStandardMaterial color="#4c514d" roughness={0.9} metalness={0.08} /></Box>{transformer && <Box args={[0.65, 0.62, 0.55]} position={[0.42, 5.72, 0.18]}><meshStandardMaterial color="#737b72" roughness={0.78} metalness={0.12} /></Box>}{flag && <group position={[0.05, 5.75, -0.18]}><Box args={[0.82, 0.48, 0.04]}><meshStandardMaterial color="#b8443e" roughness={0.84} /></Box></group>}</group>
}

function Tree({ x, z, scale, color }: { x: number; z: number; scale: number; color: string }) {
  return <group position={[x, 0, z]} scale={scale}><Box args={[1.12, 0.035, 1.12]} position={[0, 0.32, 0]}><meshStandardMaterial color="#83735c" roughness={1} /></Box><Cylinder args={[0.18, 0.24, 2.4, 7]} position={[0, 1.2, 0]}><meshStandardMaterial color="#6f4e38" roughness={1} /></Cylinder><Icosahedron args={[1.18, 1]} position={[0, 3, 0]} castShadow><meshStandardMaterial color={color} roughness={1} flatShading /></Icosahedron><Icosahedron args={[0.7, 1]} position={[0.62, 3.35, 0.1]} castShadow><meshStandardMaterial color="#78a06d" roughness={1} flatShading /></Icosahedron></group>
}

function Lamp({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}><Cylinder args={[0.06, 0.09, 3.8, 6]} position={[0, 1.9, 0]} castShadow><meshStandardMaterial color="#55615c" roughness={0.82} /></Cylinder><Box args={[0.38, 0.13, 0.18]} position={[0, 3.82, -0.16]}><meshStandardMaterial color="#e7d38a" emissive="#5c4a19" emissiveIntensity={0.18} roughness={0.65} /></Box></group>
}

function Span({ start, end, z, y, sag, color }: { start: number; end: number; z: number; y: number; sag: number; color: string }) {
  return <Line points={[[start, y, z], [(start + end) / 2, y - sag, z], [end, y, z]]} color={color} lineWidth={0.7} />
}

function Pedestrian({ x, z, direction, bound, index }: { x: number; z: number; direction: 1 | -1; bound: number; index: number }) {
  const group = useRef<THREE.Group>(null)
  const phase = useRef(index * 1.7)
  useFrame((_, delta) => { phase.current += delta * 6; if (!group.current) return; group.current.position.x += direction * delta * 0.35; if (group.current.position.x > bound) group.current.position.x = -bound; if (group.current.position.x < -bound) group.current.position.x = bound })
  return <group ref={group} position={[x, 0, z]} rotation={[0, direction === 1 ? 0 : Math.PI, 0]}><Box args={[0.28, 0.58, 0.22]} position={[0, 1.02, 0]}><meshStandardMaterial color={index % 2 ? '#a05c48' : '#536d68'} roughness={0.9} /></Box><Icosahedron args={[0.17, 1]} position={[0, 1.48, 0]}><meshStandardMaterial color="#b88462" roughness={0.96} flatShading /></Icosahedron><Box args={[0.09, 0.54, 0.09]} position={[-0.09, 0.5, 0]}><meshStandardMaterial color="#303b3d" roughness={0.92} /></Box><Box args={[0.09, 0.54, 0.09]} position={[0.09, 0.5, 0]}><meshStandardMaterial color="#303b3d" roughness={0.92} /></Box></group>
}

function Backdrop({ z, length }: { z: number; length: number }) {
  return <group>{Array.from({ length: 9 }, (_, index) => <Box key={index} args={[5.4, 5.5 + (index % 3), 2]} position={[-length / 2 + 2.5 + index * ((length - 5) / 8), 2.75 + (index % 3) * 0.5, z]}><meshStandardMaterial color={['#9ca9a4', '#a9b2aa', '#8e9e9a'][index % 3]} roughness={1} /></Box>)}</group>
}

function plan(types: BusinessType[], length: number) {
  const total = types.reduce((sum, type) => sum + SIZES[type].width, 0)
  let cursor = -Math.min(total, length - 2) / 2
  return types.map((type, index) => { const width = SIZES[type].width; const x = cursor + width / 2; cursor += width; return { type, x, index } })
}

export function Environment({ level }: { level: LevelConfig }) {
  const shopZ = level.roadHalfWidth + level.sidewalkWidth + 1.7
  const streetZ = level.roadHalfWidth + level.sidewalkWidth - 0.7
  const scootersZ = level.roadHalfWidth + level.sidewalkWidth + 0.1
  const north = plan(['tea', 'home', 'barber', 'pho', 'grocery', 'home', 'repair', 'cafe', 'home', 'tea'], level.roadLength)
  const south = plan(['home', 'grocery', 'tea', 'repair', 'barber', 'pho', 'home', 'cafe', 'grocery', 'tea'], level.roadLength)
  const poleXs = [-0.44, -0.22, 0, 0.22, 0.44].map((ratio) => ratio * level.roadLength)
  const scooterColors = ['#6b7470', '#2d5f69', '#74383b', '#536d68', '#c7c9c2', '#29383d']
  return <group><Backdrop z={shopZ + 3.8} length={level.roadLength} />{north.map(({ type, x, index }) => <Business key={`north-${type}-${x}`} x={x} z={shopZ} type={type} variant={index} />)}{south.map(({ type, x, index }) => <Business key={`south-${type}-${x}`} x={x} z={-shopZ} type={type} variant={index + 2} />)}{poleXs.map((x, index) => <group key={x}><Pole x={x} z={streetZ} transformer={index === 1} flag={index === 0} /><Pole x={x + 1.2} z={-streetZ} transformer={index === 3} flag={index === 4} /></group>)}{poleXs.slice(0, -1).map((x, index) => <group key={`span-${x}`}><Span start={x} end={poleXs[index + 1]} z={streetZ} y={6.6} sag={0.24} color="#3e4d4b" /><Span start={x} end={poleXs[index + 1]} z={-streetZ} y={6.35} sag={0.2} color="#5a6560" /></group>)}{[-0.4, -0.2, 0.02, 0.24, 0.41].map((ratio, index) => <group key={ratio}><Tree x={ratio * level.roadLength} z={(index % 2 ? -1 : 1) * (streetZ - 0.38)} scale={[1.08, 0.86, 1.18, 0.94, 1.04][index]} color={['#5d8760', '#4e7857', '#6c8d5f', '#557d5b', '#668961'][index]} />{index !== 1 && <Lamp x={ratio * level.roadLength + 1.25} z={(index % 2 ? -1 : 1) * (streetZ - 0.42)} />}</group>)}{[-0.37, -0.12, 0.14, 0.39].map((ratio, index) => <Bike key={`bike-n-${ratio}`} x={ratio * level.roadLength} z={scootersZ} color={scooterColors[index]} />)}{[-0.32, -0.08, 0.18, 0.4].map((ratio, index) => <Bike key={`bike-s-${ratio}`} x={ratio * level.roadLength} z={-scootersZ} color={scooterColors[index + 2]} flip />)}<Pedestrian x={-level.roadLength * 0.28} z={level.roadHalfWidth + level.sidewalkWidth * 0.54} direction={1} bound={level.roadLength / 2 - 1.5} index={0} /><Pedestrian x={level.roadLength * 0.22} z={-(level.roadHalfWidth + level.sidewalkWidth * 0.54)} direction={-1} bound={level.roadLength / 2 - 1.5} index={1} />{level.environmentPreset !== 'smallStreet' && <><Pedestrian x={level.roadLength * 0.42} z={level.roadHalfWidth + level.sidewalkWidth * 0.48} direction={-1} bound={level.roadLength / 2 - 1.5} index={2} /><Pedestrian x={-level.roadLength * 0.46} z={-(level.roadHalfWidth + level.sidewalkWidth * 0.48)} direction={1} bound={level.roadLength / 2 - 1.5} index={3} /></>}</group>
}
