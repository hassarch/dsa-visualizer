'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { linkedListAppend, linkedListReverse, linkedListDeleteNode } from '../../engines/linkedListEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  linkedListReverse: { label: 'Reverse', fn: linkedListReverse, infoKey: 'linkedListReverse' },
  linkedListAppend: { label: 'Append', fn: linkedListAppend, infoKey: 'linkedListDelete' },
  linkedListDeleteNode: { label: 'Delete', fn: linkedListDeleteNode, infoKey: 'linkedListDelete' },
}

const DEFAULT_VALUES = [1, 3, 5, 7, 9]

export default function LinkedListPage() {
  const [algoKey, setAlgoKey] = useState('linkedListReverse')
  const [opArg, setOpArg] = useState(4)

  const getInput = useCallback(() => {
    if (algoKey === 'linkedListReverse') return { values: DEFAULT_VALUES }
    if (algoKey === 'linkedListAppend') return { values: DEFAULT_VALUES, newVal: opArg }
    return { values: DEFAULT_VALUES, target: opArg }
  }, [algoKey, opArg])

  const genFn = useCallback((input) => ALGOS[algoKey].fn(input), [algoKey])
  const playback = usePlayback(genFn, getInput())
  const frame = playback.currentFrame

  const nodes = frame?.nodes ?? DEFAULT_VALUES.map((v, i) => ({ id: i, val: v }))
  const highlight = new Set(frame?.highlight ?? [])
  const pointers = frame?.pointers ?? {}

  function getNodeColor(id) {
    if (highlight.has(id)) return 'var(--compare)'
    if (Object.values(pointers).includes(id)) return 'var(--current)'
    return 'var(--primary)'
  }

  const NODE_W = 64, NODE_H = 44, GAP = 50
  const totalWidth = nodes.length * (NODE_W + GAP)
  const startX = Math.max(40, (700 - totalWidth) / 2)

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
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
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
            {algoKey !== 'linkedListReverse' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {algoKey === 'linkedListAppend' ? 'Value to append:' : 'Value to delete:'}
                </span>
                <input type="number" value={opArg} onChange={e => setOpArg(+e.target.value)}
                  className="px-2 py-1 rounded text-xs font-mono w-20"
                  style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            )}
          </div>

          {/* SVG canvas */}
          <div className="flex-1 flex items-center justify-center"
            style={{ background: 'var(--bg-canvas)', overflow: 'hidden' }}>
            <svg width="100%" viewBox={`0 0 ${Math.max(totalWidth + 120, 600)} 200`} style={{ maxHeight: '100%' }}>
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
                </marker>
              </defs>

              {Object.entries(pointers).map(([name, nodeId]) => {
                const idx = nodes.findIndex(n => n.id === nodeId)
                if (idx < 0) return null
                const x = startX + idx * (NODE_W + GAP) + NODE_W / 2
                const colors = { prev: 'var(--pointer-a)', curr: 'var(--current)', next: 'var(--pointer-b)' }
                const color = colors[name] || 'var(--visited)'
                return (
                  <g key={name}>
                    <line x1={x} y1={60} x2={x} y2={80} stroke={color} strokeWidth="1.5" />
                    <text x={x} y={55} textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace">{name}</text>
                  </g>
                )
              })}

              {nodes.map((node, i) => {
                const x = startX + i * (NODE_W + GAP)
                const y = 90
                const color = getNodeColor(node.id)
                const isHighlighted = highlight.has(node.id)
                return (
                  <g key={node.id}>
                    <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8}
                      stroke={color} strokeWidth={isHighlighted ? 2 : 1.5}
                      fill={`${color}22`}
                      style={{ filter: isHighlighted ? `drop-shadow(0 0 6px ${color}66)` : 'none', transition: 'all 0.2s' }} />
                    <text x={x + NODE_W / 2} y={y + NODE_H / 2 + 5} textAnchor="middle"
                      fill={color} fontSize="16" fontWeight="bold" fontFamily="monospace">
                      {node.val}
                    </text>
                    <text x={x + NODE_W / 2} y={y + NODE_H + 18} textAnchor="middle"
                      fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
                      [{i}]
                    </text>
                    {i < nodes.length - 1 && (
                      <line x1={x + NODE_W + 4} y1={y + NODE_H / 2}
                        x2={x + NODE_W + GAP - 4} y2={y + NODE_H / 2}
                        stroke={color} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                    )}
                    {i === nodes.length - 1 && (
                      <text x={x + NODE_W + 12} y={y + NODE_H / 2 + 4}
                        fill="var(--text-muted)" fontSize="12" fontFamily="monospace">null</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-6 py-2 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Default' },
              { color: 'var(--compare)', label: 'Highlighted' },
              { color: 'var(--current)', label: 'Pointer target' },
              { color: 'var(--pointer-a)', label: 'prev' },
              { color: 'var(--pointer-b)', label: 'next' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          <PlaybackControls playback={playback} />
        </div>

        <div className="border-l flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: 320, borderColor: 'var(--border)' }}>
          <InfoPanel algoKey={ALGOS[algoKey].infoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}