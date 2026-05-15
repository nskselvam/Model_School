import React, { useEffect, useRef } from 'react'

const DOT_COUNT = 340
const NODE_COUNT = 28
const ROTATION_SPEED = 0.0022
const EDGE_DIST = 0.72

function randomOnSphere() {
  const u = Math.random()
  const v = Math.random()
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  }
}

function rotateY(pt, cos, sin) {
  return {
    x: pt.x * cos - pt.z * sin,
    y: pt.y,
    z: pt.x * sin + pt.z * cos,
  }
}

function project(pt, cx, cy, R) {
  const fov = 3.6
  const scale = fov / (fov + pt.z)
  return {
    x: cx + pt.x * R * scale,
    y: cy - pt.y * R * scale,
    depth: pt.z,
    visible: pt.z > -0.96,
    scale,
  }
}

const LATS = 8
const LONS = 10
const STEPS = 90

function buildLatLines() {
  const lines = []
  for (let li = 0; li < LATS; li++) {
    const phi = (Math.PI / (LATS + 1)) * (li + 1)
    const row = []
    for (let s = 0; s <= STEPS; s++) {
      const theta = (2 * Math.PI * s) / STEPS
      row.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      })
    }
    lines.push(row)
  }
  return lines
}

function buildLonLines() {
  const lines = []
  for (let li = 0; li < LONS; li++) {
    const theta = (Math.PI * li) / LONS
    const row = []
    for (let s = 0; s <= STEPS; s++) {
      const phi = (Math.PI * s) / STEPS
      row.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      })
    }
    lines.push(row)
  }
  return lines
}

export default function GlobeCanvas({ size = 500 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const R = size * 0.44

    // Static geometry
    const surfaceDots = Array.from({ length: DOT_COUNT }, randomOnSphere)
    const nodes = Array.from({ length: NODE_COUNT }, randomOnSphere)

    const edges = []
    const triangles = []
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < EDGE_DIST) {
          edges.push([i, j])
          if (triangles.length < 24) {
            for (let k = j + 1; k < NODE_COUNT; k++) {
              const dx2 = nodes[i].x - nodes[k].x
              const dy2 = nodes[i].y - nodes[k].y
              const dz2 = nodes[i].z - nodes[k].z
              const dx3 = nodes[j].x - nodes[k].x
              const dy3 = nodes[j].y - nodes[k].y
              const dz3 = nodes[j].z - nodes[k].z
              if (
                Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2) < EDGE_DIST &&
                Math.sqrt(dx3 * dx3 + dy3 * dy3 + dz3 * dz3) < EDGE_DIST
              ) {
                triangles.push([i, j, k])
              }
            }
          }
        }
      }
    }

    const latLines = buildLatLines()
    const lonLines = buildLonLines()

    let angle = 0
    let rafId

    function draw() {
      ctx.clearRect(0, 0, size, size)

      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      function rot(pt) { return rotateY(pt, cos, sin) }
      function proj(pt) { return project(rot(pt), cx, cy, R) }

      // Outer circle
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(90, 155, 255, 0.32)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Sphere inner glow
      const grd = ctx.createRadialGradient(
        cx - R * 0.14, cy - R * 0.10, R * 0.02,
        cx, cy, R
      )
      grd.addColorStop(0,    'rgba(215, 232, 255, 0.78)')
      grd.addColorStop(0.28, 'rgba(215, 232, 255, 0.30)')
      grd.addColorStop(0.62, 'rgba(215, 232, 255, 0.10)')
      grd.addColorStop(1,    'rgba(215, 232, 255, 0.00)')

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, size, size)
      ctx.restore()

      // All globe content clipped to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2)
      ctx.clip()

      // Latitude grid lines
      for (const row of latLines) {
        ctx.beginPath()
        let started = false
        for (const pt of row) {
          const p = proj(pt)
          if (!p.visible) { started = false; continue }
          const op = 0.08 + 0.16 * ((p.depth + 1) / 2)
          if (!started) { ctx.beginPath(); ctx.moveTo(p.x, p.y); started = true }
          else ctx.lineTo(p.x, p.y)
        }
        ctx.strokeStyle = 'rgba(78, 142, 255, 0.18)'
        ctx.lineWidth = 0.65
        ctx.stroke()
      }

      // Longitude grid lines
      for (const row of lonLines) {
        ctx.beginPath()
        let started = false
        for (const pt of row) {
          const p = proj(pt)
          if (!p.visible) { started = false; continue }
          if (!started) { ctx.beginPath(); ctx.moveTo(p.x, p.y); started = true }
          else ctx.lineTo(p.x, p.y)
        }
        ctx.strokeStyle = 'rgba(78, 142, 255, 0.18)'
        ctx.lineWidth = 0.65
        ctx.stroke()
      }

      // Surface dot cloud
      for (const pt of surfaceDots) {
        const p = proj(pt)
        if (!p.visible) continue
        const t = (p.depth + 1) / 2
        const opacity = 0.14 + 0.46 * t
        const r = 0.8 + 1.0 * t
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(68, 138, 255, ${opacity.toFixed(2)})`
        ctx.fill()
      }

      // Pre-project nodes
      const nodeP = nodes.map(n => proj(n))

      // Filled triangles
      for (const [i, j, k] of triangles) {
        const pi = nodeP[i], pj = nodeP[j], pk = nodeP[k]
        const avgDepth = (pi.depth + pj.depth + pk.depth) / 3
        if (avgDepth < -0.55) continue
        const t = (avgDepth + 1) / 2
        const opacity = 0.05 + 0.16 * t
        ctx.beginPath()
        ctx.moveTo(pi.x, pi.y)
        ctx.lineTo(pj.x, pj.y)
        ctx.lineTo(pk.x, pk.y)
        ctx.closePath()
        ctx.fillStyle = `rgba(78, 148, 255, ${opacity.toFixed(3)})`
        ctx.fill()
      }

      // Network edges
      for (const [i, j] of edges) {
        const pi = nodeP[i], pj = nodeP[j]
        if (!pi.visible && !pj.visible) continue
        const t = ((pi.depth + pj.depth) / 2 + 1) / 2
        const opacity = 0.22 + 0.58 * t
        ctx.beginPath()
        ctx.moveTo(pi.x, pi.y)
        ctx.lineTo(pj.x, pj.y)
        ctx.strokeStyle = `rgba(58, 135, 255, ${opacity.toFixed(2)})`
        ctx.lineWidth = 0.8 + 0.7 * t
        ctx.stroke()
      }

      // Network nodes (larger dots)
      for (const p of nodeP) {
        if (!p.visible) continue
        const t = (p.depth + 1) / 2
        const opacity = 0.55 + 0.45 * t
        const r = 2.6 + 1.8 * t
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(44, 122, 255, ${opacity.toFixed(2)})`
        ctx.fill()
      }

      ctx.restore()

      angle += ROTATION_SPEED
      rafId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafId)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    />
  )
}
