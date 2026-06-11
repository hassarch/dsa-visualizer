'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { bfsTraversal, dfsTraversal } from '../../engines/graphEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  bfs: { label: 'BFS', fn: bfsTraversal },
  dfs: { label: 'DFS', fn: dfsTraversal },
}

const DEFAULT_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','F'], ['D','F']],
  start: 'A',
}

const NODE_POSITIONS = {
  A: { x: 300, y: 60 },
  B: { x: 160, y: 170 },
  C: { x: 440, y: 170 },
  D: { x: 80, y: 290 },
  E: { x: 240, y: 290 },
  F: { x: 360, y: 290 },
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

  function getEdgeColor(u, v) {
    if (visited.has(u) && visited.has(v)) return 'var(--visited)'
    return 'var(--border)'
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
          <div className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex gap-1">
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key} onClick={() => { setAlgoKey(key); playback.reset() }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: algoKey === key ? 'var(--primary)' : 'var(--border)', color: algoKey === key ? 'white' : 'var(--text-secondary)' }}>
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>Start node: A</span>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Graph SVG */}
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 380">
                {DEFAULT_GRAPH.edges.map(([u, v], i) => {
                  const pu = NODE_POSITIONS[u], pv = NODE_POSITIONS[v]
                  return (
                    <line key={i} x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y}
                      stroke={getEdgeColor(u, v)}
                      strokeWidth={visited.has(u) && visited.has(v) ? 2 : 1.5}
                      style={{ transition: 'stroke 0.3s' }} />
                  )
                })}
                {DEFAULT_GRAPH.nodes.map(node => {
                  const pos = NODE_POSITIONS[node]
                  const color = getNodeColor(node)
                  const isActive = node === current
                  return (
                    <g key={node}>
                      <circle cx={pos.x} cy={pos.y} r={isActive ? 28 : 24}
                        fill={`${color}22`} stroke={color} strokeWidth={isActive ? 2.5 : 1.5}
                        style={{ transition: 'all 0.3s', filter: isActive ? `drop-shadow(0 0 10px ${color}88)` : 'none' }} />
                      <text x={pos.x} y={pos.y + 6} textAnchor="middle"
                        fill={color} fontSize={isActive ? 18 : 16} fontWeight="bold" fontFamily="monospace"
                        style={{ transition: 'all 0.3s' }}>
                        {node}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Queue / Stack panel */}
            <div className="p-4 border-l flex flex-col gap-4"
              style={{ width: 160, borderColor: 'var(--border)' }}>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-muted)' }}>
                  {algoKey === 'bfs' ? 'Queue' : 'Stack'}
                </div>
                <div className="flex flex-col gap-1">
                  {dataStructure.length === 0
                    ? <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Empty</div>
                    : dataStructure.map((n, i) => (
                      <div key={i} className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-center"
                        style={{
                          background: i === 0 ? 'rgba(6,182,212,0.2)' : 'var(--bg-surface)',
                          border: `1px solid ${i === 0 ? 'var(--current)' : 'var(--border)'}`,
                          color: i === 0 ? 'var(--current)' : 'var(--text-secondary)',
                        }}>
                        {n}
                      </div>
                    ))
                  }
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-muted)' }}>Visited</div>
                <div className="flex flex-wrap gap-1">
                  {[...visited].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                      style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid var(--visited)', color: 'var(--visited)' }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-6 py-2 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Unvisited' },
              { color: 'var(--current)', label: 'Processing' },
              { color: 'var(--visited)', label: 'Visited' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          <PlaybackControls playback={playback} />
        </div>

        <div className="border-l flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: 320, borderColor: 'var(--border)' }}>
          <InfoPanel algoKey={algoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}