'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { linkedListAppend, linkedListReverse, linkedListDeleteNode } from '../../engines/linkedListEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  linkedListReverse: { label: 'Reverse', fn: linkedListReverse, infoKey: 'linkedListReverse' },
  linkedListAppend: { label: 'Append', fn: linkedListAppend, infoKey: 'linkedListReverse' }, // map to same infoKey or delete
  linkedListDeleteNode: { label: 'Delete Node', fn: linkedListDeleteNode, infoKey: 'linkedListReverse' },
}

const DEFAULT_VALUES = [1, 3, 5, 7, 9]

export default function LinkedListPage() {
  const [algoKey, setAlgoKey] = useState('linkedListReverse')
  const [opArg, setOpArg] = useState(4)

  const input = useMemo(() => {
    if (algoKey === 'linkedListReverse') return { values: DEFAULT_VALUES }
    if (algoKey === 'linkedListAppend') return { values: DEFAULT_VALUES, newVal: opArg }
    return { values: DEFAULT_VALUES, target: opArg }
  }, [algoKey, opArg])

  const genFn = useCallback((input) => ALGOS[algoKey].fn(input), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

  const nodes = frame?.nodes ?? DEFAULT_VALUES.map((v, i) => ({ id: i, val: v }))
  const highlight = new Set(frame?.highlight ?? [])
  const pointers = frame?.pointers ?? {}

  function getNodeColor(id) {
    if (highlight.has(id)) return '#ffffff' // Highlighted/comparing (White)
    if (Object.values(pointers).includes(id)) return '#38BDF8' // Pointer target (Cyan)
    return '#a1a1aa' // Default (Grey)
  }

  const NODE_W = 96
  const NODE_H = 64
  const GAP = 72
  const totalWidth = nodes.length * (NODE_W + GAP)
  const startX = Math.max(80, (1200 - totalWidth) / 2)

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

            {algoKey !== 'linkedListReverse' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '12px', color: '#71717a' }}>
                  {algoKey === 'linkedListAppend' ? 'Value to append:' : 'Value to delete:'}
                </span>
                <input 
                  type="number" 
                  value={opArg} 
                  onChange={e => setOpArg(+e.target.value)}
                  style={{ 
                    padding: '6px 10px', 
                    width: 70, 
                    fontSize: '12px',
                    background: '#121212',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
              </div>
            )}
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
            
            {/* Visualizer Canvas Area */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              marginBottom: 40
            }}>
              
              {/* Pointer Legend */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                {Object.entries({ prev: '#F97316', curr: '#38BDF8', next: '#8B5CF6' }).map(([name, color]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ 
                      fontSize: '11px', 
                      fontFamily: 'JetBrains Mono, monospace', 
                      color: '#71717a', 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>{name}</span>
                  </div>
                ))}
              </div>

              {/* Nodes SVG */}
              <svg width="100%" viewBox={`0 0 ${Math.max(totalWidth + 160, 900)} 280`} style={{ maxHeight: 320, maxWidth: '1600px', overflow: 'visible' }}>
                <defs>
                  <marker id="arr-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M1 1L9 5L1 9" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                  <marker id="arr-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M1 1L9 5L1 9" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Pointer arrows from above */}
                {Object.entries(pointers).map(([name, nodeId]) => {
                  const idx = nodes.findIndex(n => n.id === nodeId)
                  if (idx < 0 || nodeId === undefined) return null
                  const x = startX + idx * (NODE_W + GAP) + NODE_W / 2
                  const colors = { prev: '#F97316', curr: '#38BDF8', next: '#8B5CF6' }
                  const color = colors[name] || '#ffffff'
                  return (
                    <g key={name}>
                      <line x1={x} y1={68} x2={x} y2={108} stroke={color} strokeWidth={2} strokeDasharray="4 3" />
                      <circle cx={x} cy={62} r={3} fill={color} />
                      <text x={x} y={50} textAnchor="middle" fill={color} fontSize="12px" fontFamily="JetBrains Mono, monospace" fontWeight="700">{name}</text>
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map((node, i) => {
                  const x = startX + i * (NODE_W + GAP)
                  const y = 120
                  const color = getNodeColor(node.id)
                  const isHighlighted = highlight.has(node.id)
                  const isPointed = Object.values(pointers).includes(node.id)

                  return (
                    <g key={node.id} style={{ transition: 'all 0.3s' }}>
                      {/* Node shadow/glow */}
                      {(isHighlighted || isPointed) && (
                        <rect x={x - 3} y={y - 3} width={NODE_W + 6} height={NODE_H + 6} rx={14}
                          fill="none" stroke={color} strokeWidth={1} opacity={0.3} filter="url(#glow)" />
                      )}

                      {/* Node body */}
                      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={12}
                        fill={isHighlighted || isPointed ? 'rgba(255,255,255,0.04)' : 'transparent'} 
                        stroke={color} 
                        strokeWidth={isHighlighted ? 3 : 2} 
                      />

                      {/* Value partition line */}
                      <line x1={x + NODE_W - 24} y1={y} x2={x + NODE_W - 24} y2={y + NODE_H}
                        stroke={color} strokeWidth={1.5} opacity={0.3} />

                      {/* Value */}
                      <text x={x + (NODE_W - 24) / 2} y={y + NODE_H / 2 + 8}
                        textAnchor="middle" fill={color === '#a1a1aa' ? '#ffffff' : color}
                        fontSize="22px" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                        {node.val}
                      </text>

                      {/* Next pointer indicator */}
                      <text x={x + NODE_W - 12} y={y + NODE_H / 2 + 5}
                        textAnchor="middle" fill={color} fontSize="12px" opacity={0.7} fontFamily="monospace">
                        →
                      </text>

                      {/* Index label */}
                      <text x={x + NODE_W / 2} y={y + NODE_H + 24}
                        textAnchor="middle" fill="#52525b" fontSize="11px" fontFamily="JetBrains Mono, monospace" fontWeight="500">
                        [{i}]
                      </text>

                      {/* Arrow to next node */}
                      {i < nodes.length - 1 && (
                        <line
                          x1={x + NODE_W + 4} y1={y + NODE_H / 2}
                          x2={x + NODE_W + GAP - 4} y2={y + NODE_H / 2}
                          stroke={isHighlighted ? '#ffffff' : color}
                          strokeWidth={2}
                          markerEnd={`url(#${isHighlighted ? 'arr-active' : 'arr-default'})`}
                        />
                      )}

                      {/* Null terminator */}
                      {i === nodes.length - 1 && (
                        <g>
                          <line x1={x + NODE_W + 5} y1={y + NODE_H / 2} x2={x + NODE_W + 40} y2={y + NODE_H / 2}
                            stroke="#52525b" strokeWidth={1.5} strokeDasharray="3 3" />
                          <text x={x + NODE_W + 48} y={y + NODE_H / 2 + 5}
                            fill="#52525b" fontSize="13px" fontFamily="JetBrains Mono, monospace" fontStyle="italic" fontWeight="500">null</text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
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
          <InfoPanel algoKey="linkedListReverse" currentFrame={frame} playback={playback} />
        </div>

      </div>
    </div>
  )
}