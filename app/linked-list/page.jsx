'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { linkedListAppend, linkedListReverse, linkedListDeleteNode } from '../../engines/linkedListEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  linkedListReverse: { label: 'Reverse', fn: linkedListReverse, infoKey: 'linkedListReverse' },
  linkedListAppend: { label: 'Append', fn: linkedListAppend, infoKey: 'linkedListDelete' },
  linkedListDeleteNode: { label: 'Delete Node', fn: linkedListDeleteNode, infoKey: 'linkedListDelete' },
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
    if (highlight.has(id)) return 'var(--compare)'
    if (Object.values(pointers).includes(id)) return 'var(--current)'
    return 'var(--primary)'
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
            {algoKey !== 'linkedListReverse' && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {algoKey === 'linkedListAppend' ? 'Value to append:' : 'Value to delete:'}
                </span>
                <input type="number" value={opArg} onChange={e => setOpArg(+e.target.value)}
                  style={{ padding: '5px 10px', width: 80, fontSize: 12 }} />
              </div>
            )}
          </div>

          {/* SVG Canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', overflow: 'hidden', padding: 48 }}>

            {/* Pointer legend */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
              {Object.entries({ prev: 'var(--pointer-a)', curr: 'var(--current)', next: 'var(--pointer-b)' }).map(([name, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 500 }}>{name}</span>
                </div>
              ))}
            </div>

            <svg width="100%" viewBox={`0 0 ${Math.max(totalWidth + 160, 900)} 280`} style={{ maxHeight: 400, maxWidth: '1600px', overflow: 'visible' }}>
              <defs>
                <marker id="arr-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M1 1L9 5L1 9" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
                <marker id="arr-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M1 1L9 5L1 9" fill="none" stroke="var(--compare)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                const colors = { prev: 'var(--pointer-a)', curr: 'var(--current)', next: 'var(--pointer-b)' }
                const color = colors[name] || 'var(--visited)'
                return (
                  <g key={name}>
                    <line x1={x} y1={68} x2={x} y2={108} stroke={color} strokeWidth={2.5} strokeDasharray="5 4" />
                    <circle cx={x} cy={62} r={4} fill={color} />
                    <text x={x} y={52} textAnchor="middle" fill={color} fontSize={14} fontFamily="JetBrains Mono, monospace" fontWeight="700">{name}</text>
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
                        fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} filter="url(#glow)" />
                    )}

                    {/* Node body */}
                    <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={12}
                      fill={`${color}20`} stroke={color} strokeWidth={isHighlighted ? 3 : 2} />

                    {/* Value partition line */}
                    <line x1={x + NODE_W - 24} y1={y} x2={x + NODE_W - 24} y2={y + NODE_H}
                      stroke={color} strokeWidth={1.5} opacity={0.5} />

                    {/* Value */}
                    <text x={x + (NODE_W - 24) / 2} y={y + NODE_H / 2 + 8}
                      textAnchor="middle" fill={color}
                      fontSize={24} fontWeight="700" fontFamily="JetBrains Mono, monospace">
                      {node.val}
                    </text>

                    {/* Next pointer indicator */}
                    <text x={x + NODE_W - 12} y={y + NODE_H / 2 + 6}
                      textAnchor="middle" fill={color} fontSize={12} opacity={0.7} fontFamily="monospace">
                      →
                    </text>

                    {/* Index label */}
                    <text x={x + NODE_W / 2} y={y + NODE_H + 24}
                      textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight="500">
                      [{i}]
                    </text>

                    {/* Arrow to next node */}
                    {i < nodes.length - 1 && (
                      <line
                        x1={x + NODE_W + 4} y1={y + NODE_H / 2}
                        x2={x + NODE_W + GAP - 4} y2={y + NODE_H / 2}
                        stroke={isHighlighted ? 'var(--compare)' : color}
                        strokeWidth={2.5}
                        markerEnd={`url(#${isHighlighted ? 'arr-active' : 'arr-default'})`}
                      />
                    )}

                    {/* Null terminator */}
                    {i === nodes.length - 1 && (
                      <g>
                        <line x1={x + NODE_W + 5} y1={y + NODE_H / 2} x2={x + NODE_W + 40} y2={y + NODE_H / 2}
                          stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="4 4" />
                        <text x={x + NODE_W + 50} y={y + NODE_H / 2 + 6}
                          fill="var(--text-muted)" fontSize={14} fontFamily="JetBrains Mono, monospace" fontStyle="italic" fontWeight="500">null</text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '8px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Default node' },
              { color: 'var(--compare)', label: 'Active node' },
              { color: 'var(--current)', label: 'Pointer target' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          <PlaybackControls playback={playback} />
        </div>

        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <InfoPanel algoKey={ALGOS[algoKey].infoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}