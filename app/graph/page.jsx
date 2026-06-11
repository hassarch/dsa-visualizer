'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { bfsTraversal, dfsTraversal } from '../../engines/graphEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  bfs: { label: 'BFS — Breadth First', fn: bfsTraversal },
  dfs: { label: 'DFS — Depth First', fn: dfsTraversal },
}

const DEFAULT_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','F'], ['D','F']],
  start: 'A',
}

const NODE_POSITIONS = {
  A: { x: 400, y: 80 },
  B: { x: 200, y: 230 },
  C: { x: 600, y: 230 },
  D: { x: 100, y: 400 },
  E: { x: 300, y: 400 },
  F: { x: 500, y: 400 },
}

export default function GraphPage() {
  const [algoKey, setAlgoKey] = useState('bfs')

  const genFn = useCallback((g) => ALGOS[algoKey].fn(g), [algoKey])
  const playback = usePlayback(genFn, DEFAULT_GRAPH)
  const frame = playback.currentFrame

  const visited = new Set(frame?.visited ?? [])
  const queue = frame?.queue ?? []
  const stack = frame?.stack ?? []
  const current = frame?.current

  function getNodeColor(node) {
    if (node === current) return 'var(--current)'
    if (visited.has(node)) return 'var(--visited)'
    return 'var(--primary)'
  }

  function getEdgeVisited(u, v) {
    return visited.has(u) && visited.has(v)
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') { e.preventDefault(); playback.isPlaying ? playback.pause() : playback.play() }
      if (e.code === 'ArrowRight') playback.stepForward()
      if (e.code === 'ArrowLeft') playback.stepBack()
      if (e.code === 'KeyR') playback.reset()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [playback])

  const dataStructure = algoKey === 'bfs' ? queue : stack

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key} onClick={() => { setAlgoKey(key); playback.reset() }} style={{
                  padding: '5px 12px', borderRadius: 7, border: '1px solid',
                  borderColor: algoKey === key ? 'var(--primary)' : 'var(--border)',
                  background: algoKey === key ? 'var(--primary-glow)' : 'transparent',
                  color: algoKey === key ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: algoKey === key ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
                }}>{label}</button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Start node: <span style={{ color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>A</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Graph SVG */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 520" style={{ display: 'block', maxWidth: '1400px', maxHeight: '700px' }}>
                <defs>
                  <filter id="node-glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {DEFAULT_GRAPH.edges.map(([u, v]) => {
                  const pu = NODE_POSITIONS[u], pv = NODE_POSITIONS[v]
                  const isVisited = getEdgeVisited(u, v)
                  return (
                    <line key={`${u}-${v}`}
                      x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y}
                      stroke={isVisited ? 'var(--visited)' : 'var(--border)'}
                      strokeWidth={isVisited ? 4 : 2.5}
                      opacity={isVisited ? 1 : 0.5}
                      style={{ transition: 'all 0.4s' }}
                    />
                  )
                })}

                {/* Nodes */}
                {DEFAULT_GRAPH.nodes.map(node => {
                  const pos = NODE_POSITIONS[node]
                  const color = getNodeColor(node)
                  const isActive = node === current
                  const isVisited = visited.has(node)

                  return (
                    <g key={node}>
                      {/* Glow ring for active */}
                      {isActive && (
                        <circle cx={pos.x} cy={pos.y} r={56}
                          fill="none" stroke={color} strokeWidth={2} opacity={0.25}
                          filter="url(#node-glow)" />
                      )}

                      {/* Node circle */}
                      <circle cx={pos.x} cy={pos.y} r={isActive ? 42 : 36}
                        fill={`${color}20`}
                        stroke={color}
                        strokeWidth={isActive ? 4 : isVisited ? 3 : 2}
                        style={{ transition: 'all 0.3s', filter: isActive ? 'url(#node-glow)' : 'none' }}
                      />

                      {/* Node label */}
                      <text x={pos.x} y={pos.y + 10} textAnchor="middle"
                        fill={color} fontSize={isActive ? 28 : 24} fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                        style={{ transition: 'all 0.3s' }}>
                        {node}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Queue / Stack + Visited panel */}
            <div style={{ width: 180, borderLeft: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  {algoKey === 'bfs' ? 'Queue (FIFO)' : 'Stack (LIFO)'}
                </div>
                {dataStructure.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dataStructure.map((n, i) => (
                      <div key={i} style={{
                        padding: '7px 12px', borderRadius: 8, textAlign: 'center',
                        fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                        background: i === 0 ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                        border: `1px solid ${i === 0 ? 'var(--current)' : 'var(--border)'}`,
                        color: i === 0 ? 'var(--current)' : 'var(--text-secondary)',
                        transition: 'all 0.2s'
                      }}>
                        {n}
                        {i === 0 && <span style={{ fontSize: 9, marginLeft: 6, opacity: 0.7 }}>next</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Visited ({visited.size})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...visited].map((n, i) => (
                    <div key={n} style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                      background: 'rgba(167,139,250,0.15)', border: '1.5px solid var(--visited)', color: 'var(--visited)',
                      animation: 'fadeUp 0.3s ease forwards'
                    }}>
                      {n}
                    </div>
                  ))}
                </div>
                {visited.size > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {[...visited].join(' → ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '8px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Unvisited' },
              { color: 'var(--current)', label: 'Processing' },
              { color: 'var(--visited)', label: 'Visited' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          <PlaybackControls playback={playback} />
        </div>

        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <InfoPanel algoKey={algoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}