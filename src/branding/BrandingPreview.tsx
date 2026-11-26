import { Canvas, useThree } from '@react-three/fiber'
import { Box, Cylinder, Icosahedron } from '@react-three/drei'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Pedestrian } from '../game/world/Environment'
import { getVehicleColor, VehicleModel, type VehicleVisualConfig } from '../game/traffic/Vehicle'

type BrandingVariant = 'logo' | 'favicon'
type ExportImage = (size: number) => Promise<Blob>

const LOGO_OUTPUTS = [
  { label: 'Logo master · 1024 px', filename: 'logo-1024.png', size: 1024 },
  { label: 'Product Hunt · 240 px', filename: 'product-hunt-240.png', size: 240 },
  { label: 'App logo · 512 px', filename: 'logo-512.png', size: 512 },
  { label: 'Apple touch icon · 180 px', filename: 'apple-touch-icon.png', size: 180 },
]

const FAVICON_OUTPUTS = [
  { label: 'Favicon master · 512 px', filename: 'favicon-master-512.png', size: 512 },
  { label: 'Favicon · 32 px', filename: 'favicon-32x32.png', size: 32 },
  { label: 'Favicon · 16 px', filename: 'favicon-16x16.png', size: 16 },
]

function LogoVehicle({ config, position, rotation = 0, scale = 1 }: { config: VehicleVisualConfig; position: [number, number, number]; rotation?: number; scale?: number }) {
  const wheelRefs = useRef<Array<THREE.Object3D | null>>([])
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <VehicleModel config={config} color={getVehicleColor(config)} wheelRefs={wheelRefs} />
    </group>
  )
}

function Storefront({ x, width, wall, sign, accent }: { x: number; width: number; wall: string; sign: string; accent: string }) {
  return (
    <group position={[x, 0, -4.8]}>
      <Box args={[width, 3.35, 0.32]} position={[0, 1.68, 0]}>
        <meshStandardMaterial color={wall} roughness={0.92} />
      </Box>
      <Box args={[width - 0.12, 0.58, 0.08]} position={[0, 2.78, 0.2]}>
        <meshStandardMaterial color={sign} roughness={0.7} metalness={0.08} />
      </Box>
      <Box args={[width - 0.38, 1.16, 0.06]} position={[0, 1.18, 0.2]}>
        <meshStandardMaterial color="#8ea9a3" roughness={0.25} metalness={0.12} />
      </Box>
      <Box args={[width - 0.32, 0.12, 0.7]} position={[0, 0.5, 0.38]} rotation={[0.12, 0, 0]}>
        <meshStandardMaterial color={accent} roughness={0.84} />
      </Box>
      <Box args={[0.12, 1.18, 0.07]} position={[-width * 0.25, 1.18, 0.25]}>
        <meshStandardMaterial color="#d7d0b5" roughness={0.78} />
      </Box>
      <Box args={[0.12, 1.18, 0.07]} position={[width * 0.25, 1.18, 0.25]}>
        <meshStandardMaterial color="#d7d0b5" roughness={0.78} />
      </Box>
      <Box args={[width * 0.58, 0.06, 0.06]} position={[0, 3.13, 0.2]}>
        <meshStandardMaterial color="#e7d38a" emissive="#5c4a19" emissiveIntensity={0.18} />
      </Box>
    </group>
  )
}

function LogoTree() {
  return (
    <group position={[-3.05, 0, -4.08]} scale={0.74}>
      <Cylinder args={[0.18, 0.24, 2.2, 7]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#6f4e38" roughness={1} />
      </Cylinder>
      <Icosahedron args={[1.15, 1]} position={[0, 2.78, 0]}>
        <meshStandardMaterial color="#5d8760" roughness={1} flatShading />
      </Icosahedron>
      <Icosahedron args={[0.68, 1]} position={[0.58, 3.06, 0.08]}>
        <meshStandardMaterial color="#78a06d" roughness={1} flatShading />
      </Icosahedron>
    </group>
  )
}

function RoadSurface({ compact }: { compact: boolean }) {
  const roadLength = compact ? 6.6 : 8.8
  const roadHalfWidth = compact ? 2.6 : 3.25
  const crosswalkZs = compact ? [-1.6, -1.05, -0.5, 0.05, 0.6, 1.15, 1.7] : [-2.15, -1.55, -0.95, -0.35, 0.25, 0.85, 1.45, 2.05]
  return (
    <group>
      <Box args={[roadLength, 0.12, roadHalfWidth * 2]} position={[0, -0.08, 0]} receiveShadow>
        <meshStandardMaterial color="#3b4648" roughness={0.98} />
      </Box>
      <Box args={[roadLength, 0.16, 0.96]} position={[0, -0.01, roadHalfWidth + 0.5]} receiveShadow>
        <meshStandardMaterial color="#b9d1b0" roughness={0.9} />
      </Box>
      <Box args={[roadLength, 0.16, 0.96]} position={[0, -0.01, -roadHalfWidth - 0.5]} receiveShadow>
        <meshStandardMaterial color="#d7c8a2" roughness={0.9} />
      </Box>
      <Box args={[roadLength, 0.18, 0.15]} position={[0, 0.28, roadHalfWidth - 0.02]}>
        <meshStandardMaterial color="#f1cf5a" />
      </Box>
      <Box args={[roadLength, 0.18, 0.15]} position={[0, 0.28, -roadHalfWidth + 0.02]}>
        <meshStandardMaterial color="#f1cf5a" />
      </Box>
      {crosswalkZs.map((z) => (
        <Box key={z} args={[3.55, 0.032, 0.3]} position={[0, 0.03, z]}>
          <meshStandardMaterial color="#d8dddd" roughness={0.92} />
        </Box>
      ))}
      {[-1.42, 1.42].map((z) => (
        <Box key={z} args={[roadLength, 0.012, 0.07]} position={[0, 0.01, z]}>
          <meshStandardMaterial color="#303839" roughness={1} transparent opacity={0.46} />
        </Box>
      ))}
      <Box args={[roadLength, 0.04, 0.65]} position={[0, 0.29, roadHalfWidth + 0.5]}>
        <meshStandardMaterial color="#4f8b62" />
      </Box>
      <Box args={[roadLength, 0.04, 0.65]} position={[0, 0.29, -roadHalfWidth - 0.5]}>
        <meshStandardMaterial color="#c59b52" />
      </Box>
    </group>
  )
}

function LogoScene({ variant }: { variant: BrandingVariant }) {
  const compact = variant === 'favicon'
  const waveConfig: VehicleVisualConfig = { id: 4, kind: 'motorcycle', direction: 1, width: 0.69, length: 1.9, style: 'underbone' }
  const visionConfig: VehicleVisualConfig = { id: 0, kind: 'motorcycle', direction: 1, width: 0.69, length: 1.87, style: 'scooter' }

  return (
    <>
      <RoadSurface compact={compact} />
      {!compact && <><Storefront x={-2.6} width={2.8} wall="#c7b5a2" sign="#4d817a" accent="#d35a46" /><Storefront x={0.15} width={2.45} wall="#d6c09f" sign="#3f6b6b" accent="#e4d9b3" /><Storefront x={2.65} width={2.55} wall="#a9bbb2" sign="#ca5d4a" accent="#d9cfae" /><LogoTree /></>}
      <LogoVehicle config={waveConfig} position={compact ? [-0.9, 0, -0.6] : [-2.1, 0, -0.98]} rotation={compact ? -0.22 : -0.42} scale={compact ? 1.45 : 1.05} />
      {!compact && <LogoVehicle config={visionConfig} position={[1.82, 0, 1.12]} rotation={Math.PI + 0.56} scale={1.0} />}
      <Pedestrian x={compact ? 0.35 : 0.12} z={compact ? 0.15 : 0.1} direction={1} bound={0} index={1} static scale={compact ? 1.5 : 1.12} />
    </>
  )
}

function SceneBridge({ onReady, compact }: { onReady: (exportImage: ExportImage) => void; compact: boolean }) {
  const { gl, scene, camera } = useThree()

  useLayoutEffect(() => {
    const position = compact ? [3.7, 6.4, 8.0] : [5.6, 9.6, 12.4]
    camera.position.set(position[0], position[1], position[2])
    camera.lookAt(0, 0.7, compact ? 0.15 : 0.65)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = 1
      camera.updateProjectionMatrix()
    }
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [camera, compact, gl])

  useEffect(() => {
    const exportImage: ExportImage = async (size) => {
      const previousSize = new THREE.Vector2()
      gl.getSize(previousSize)
      const previousPixelRatio = gl.getPixelRatio()
      const previousAspect = camera instanceof THREE.PerspectiveCamera ? camera.aspect : 1
      gl.setPixelRatio(1)
      gl.setSize(size, size, false)
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = 1
        camera.updateProjectionMatrix()
      }
      gl.render(scene, camera)
      const blob = await new Promise<Blob>((resolve, reject) => {
        gl.domElement.toBlob((result) => result ? resolve(result) : reject(new Error('Unable to export the WebGL canvas')), 'image/png')
      })
      gl.setPixelRatio(previousPixelRatio)
      gl.setSize(previousSize.x, previousSize.y, false)
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = previousAspect
        camera.updateProjectionMatrix()
      }
      return blob
    }
    onReady(exportImage)
  }, [camera, gl, onReady, scene])

  return null
}

export function BrandingPreview({ variant = 'logo' }: { variant?: BrandingVariant }) {
  const exporter = useRef<ExportImage | null>(null)
  const [status, setStatus] = useState('Ready to export')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState('branding.png')
  const outputs = variant === 'favicon' ? FAVICON_OUTPUTS : LOGO_OUTPUTS

  useEffect(() => {
    document.title = variant === 'favicon' ? 'Favicon Preview · Cross Roads in Vietnam' : 'Logo Preview · Cross Roads in Vietnam'
  }, [variant])

  const handleReady = useCallback((exportImage: ExportImage) => {
    exporter.current = exportImage
  }, [])

  const download = async (filename: string, size: number) => {
    if (!exporter.current) return
    setStatus(`Rendering ${filename}…`)
    const blob = await exporter.current(size)
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
    setDownloadName(filename)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus(`Exported ${filename} (${size}×${size})`)
  }

  return (
    <main className="branding-page">
      <section className="branding-card">
        <div className="branding-heading">
          <p className="eyebrow">CROSS ROADS IN VIETNAM · BRANDING QA</p>
          <h1>{variant === 'favicon' ? 'Browser favicon' : 'Product Hunt logo'}</h1>
          <p>Rendered from the game’s existing low-poly traffic, pedestrian, road, and lighting language.</p>
        </div>
        <div className="branding-stage">
          <Canvas
            shadows
            dpr={1.5}
            camera={{ position: variant === 'favicon' ? [3.7, 6.4, 8.0] : [5.6, 9.6, 12.4], fov: variant === 'favicon' ? 34 : 38, near: 0.1, far: 100 }}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            onCreated={({ gl, scene }) => {
              scene.background = new THREE.Color('#cadadd')
              gl.outputColorSpace = THREE.SRGBColorSpace
            }}
          >
            <hemisphereLight args={['#dbe9ed', '#70806d', 1.6]} />
            <ambientLight intensity={1.15} color="#fff7e6" />
            <directionalLight position={[-10, 16, -12]} intensity={2.15} color="#fff4d6" castShadow shadow-bias={-0.00025} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <LogoScene variant={variant} />
            <SceneBridge onReady={handleReady} compact={variant === 'favicon'} />
          </Canvas>
        </div>
        <div className="branding-toolbar">
          <span>{status}</span>
          <div className="branding-actions">
            {outputs.map((output) => <button key={output.filename} type="button" data-export={output.filename} onClick={() => void download(output.filename, output.size)}>{output.label}</button>)}
          </div>
          {downloadUrl && <a className="branding-download-link" data-download-link href={downloadUrl} download={downloadName}>Download {downloadName}</a>}
          {downloadUrl && <img className="branding-export-preview" src={downloadUrl} alt="" />}
        </div>
      </section>
    </main>
  )
}
