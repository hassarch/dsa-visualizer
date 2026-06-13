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
  B: { x: 200, y: 220 },
  C: { x: 600, y: 220 },
  D: { x: 100, y: 380 },
  E: { x: 300, y: 380 },
  F: { x: 500, y: 380 },
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
  const frontier = new Set([...queue, ...stack])

  // Debug logging
  useEffect(() => {
    console.log('=== Frame Update ===')
    console.log('Frame:', frame)
    console.log('Visited:', [...visited])
    console.log('Current:', current)
    console.log('Queue:', queue)
    console.log('Stack:', stack)
    console.log('Frontier:', [...frontier])
  }, [frame, visited, current, queue, stack, frontier])

  function getNodeColor(node) {
    if (node === current) return '#FBBF24' // Current (Amber)
    if (frontier.has(node) && !visited.has(node)) return '#38BDF8' // In queue/stack (Cyan)
    if (visited.has(node)) return '#34D399' // Visited (Emerald)
    return '#71717a' // Default (lighter grey for better visibility)
  }

  function getEdgeColor(u, v) {
    if ((u === current && visited.has(v)) || (v === current && visited.has(u))) return '#FBBF24'
    if (visited.has(u) && visited.has(v)) return '#34D399'
    return '#1F1F1F'
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000000' }}>
      <Sidebar />
      
      {/* Dashboard container */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: 24,
        padding: '24px',
        overflow: 'hidden'
      }}>
        
        {/* Main visualizer column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          gap: 16
        }}>
          
          {/* Toolbar */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #1F1F1F',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button 
                  key={key} 
                  onClick={() => { setAlgoKey(key); playback.reset() }} 
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: algoKey === key ? '#2e2e30' : '#1f1f1f',
                    background: algoKey === key ? '#1c1c1e' : 'transparent',
                    color: algoKey === key ? '#ffffff' : '#a1a1aa',
                    fontSize: '12px',
                    fontWeight: algoKey === key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                Start node: <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>A</span>
              </div>
            </div>
          </div>

          {/* Visualizer Card */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 24px 24px 24px',
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            {/* Split Graph & Stack/Queue Sidepanel */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', marginBottom: 40 }}>
              
              {/* Graph SVG canvas */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 480" style={{ display: 'block', maxWidth: '1400px', maxHeight: '600px' }}>
                  <defs>
                    <filter id="node-glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* Edges */}
                  {DEFAULT_GRAPH.edges.map(([u, v]) => {
                    const pu = NODE_POSITIONS[u], pv = NODE_POSITIONS[v]
                    const edgeColor = getEdgeColor(u, v)
                    const isActive = edgeColor !== '#1F1F1F'
                    return (
                      <line key={`${u}-${v}`}
                        x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y}
                        stroke={edgeColor}
                        strokeWidth={isActive ? 3 : 2}
                        opacity={isActive ? 1 : 0.3}
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
                    const isFrontier = frontier.has(node) && !isVisited

                    return (
                      <g key={node} style={{ opacity: 1 }}>
                        {/* Glow ring for active */}
                        {isActive && (
                          <circle cx={pos.x} cy={pos.y} r={48}
                            fill="none" stroke={color} strokeWidth={1.5} opacity={0.3}
                            filter="url(#node-glow)" />
                        )}

                        {/* Node circle */}
                        <circle cx={pos.x} cy={pos.y} r={isActive ? 38 : 32}
                          fill={isActive ? 'rgba(251,191,36,0.2)' : isFrontier ? 'rgba(56,189,248,0.15)' : isVisited ? 'rgba(52,211,153,0.2)' : 'rgba(113,113,122,0.1)'}
                          stroke={color}
                          strokeWidth={isActive ? 3.5 : isVisited || isFrontier ? 2.5 : 2}
                          opacity={1}
                          style={{ transition: 'all 0.3s', filter: isActive ? 'url(#node-glow)' : 'none' }}
                        />

                        {/* Node label */}
                        <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                          fill={color} 
                          fontSize={isActive ? '22px' : '18px'} 
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                          opacity={1}
                          style={{ transition: 'all 0.3s', pointerEvents: 'none' }}>
                          {node}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Stack/Queue and Visited Sidepanel */}
              <div style={{ 
                width: 180, 
                borderLeft: '1px solid #1F1F1F', 
                padding: '0 0 0 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 24, 
                overflowY: 'auto' 
              }}>
                {/* Data Structure Card */}
                <div>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    letterSpacing: '0.08em', 
                    color: '#71717a', 
                    textTransform: 'uppercase', 
                    marginBottom: 12 
                  }}>
                    {algoKey === 'bfs' ? 'Queue (FIFO)' : 'Stack (LIFO)'}
                  </div>
                  {dataStructure.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#52525b', fontStyle: 'italic' }}>Empty</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dataStructure.map((n, i) => (
                        <div key={i} style={{
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          textAlign: 'center',
                          fontSize: '13px', 
                          fontFamily: 'JetBrains Mono, monospace', 
                          fontWeight: 700,
                          background: i === 0 ? 'rgba(255, 255, 255, 0.05)' : '#121212',
                          border: `1px solid ${i === 0 ? '#ffffff' : '#1F1F1F'}`,
                          color: i === 0 ? '#ffffff' : '#a1a1aa',
                          transition: 'all 0.2s'
                        }}>
                          {n}
                          {i === 0 && <span style={{ fontSize: '9px', marginLeft: 6, opacity: 0.5, color: '#71717a' }}>next</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visited Card */}
                <div>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    letterSpacing: '0.08em', 
                    color: '#71717a', 
                    textTransform: 'uppercase', 
                    marginBottom: 12 
                  }}>
                    Visited ({visited.size})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...visited].map((n) => (
                      <div key={n} style={{
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px', 
                        fontFamily: 'JetBrains Mono, monospace', 
                        fontWeight: 700,
                        background: 'rgba(52, 211, 153, 0.08)', 
                        border: '1.5px solid #34D399', 
                        color: '#34D399',
                        animation: 'fadeUp 0.3s ease forwards'
                      }}>
                        {n}
                      </div>
                    ))}
                  </div>
                  {visited.size > 0 && (
                    <div style={{ 
                      marginTop: 12, 
                      fontSize: '11px', 
                      color: '#52525b', 
                      fontFamily: 'JetBrains Mono, monospace',
                      lineHeight: 1.4 
                    }}>
                      {[...visited].join(' → ')}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Playback Controls */}
            <PlaybackControls playback={playback} />
          </div>

        </div>

        {/* Right Info Widgets Column */}
        <div style={{
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0,
          paddingRight: 4
        }}>
          <InfoPanel algoKey={algoKey} currentFrame={frame} playback={playback} />
        </div>

      </div>
    </div>
  )
}