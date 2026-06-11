'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { fibonacci, coinChange, climbingStairs, knapsack } from '../../engines/dpEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  fibonacci: { label: 'Fibonacci', fn: fibonacci },
  coinChange: { label: 'Coin Change', fn: coinChange },
  climbingStairs: { label: 'Climbing Stairs', fn: climbingStairs },
  knapsack: { label: '0/1 Knapsack', fn: knapsack },
}

const DEFAULTS = {
  fibonacci: { n: 10 },
  coinChange: { coins: [1, 5, 11], amount: 15 },
  climbingStairs: { n: 8 },
  knapsack: { weights: [2, 3, 4, 5], values: [3, 4, 5, 6], capacity: 8 },
}

export default function DPPage() {
  const [algoKey, setAlgoKey] = useState('coinChange')
  const [input, setInput] = useState(DEFAULTS.coinChange)

  const genFn = useCallback((inp) => ALGOS[algoKey].fn(inp), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

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
                  onClick={() => { setAlgoKey(key); setInput(DEFAULTS[key]); playback.reset() }} 
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
              overflow: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '24px 0',
              width: '100%',
              marginBottom: 40
            }}>
              {algoKey === 'knapsack' && frame?.dp
                ? <KnapsackTable frame={frame} />
                : <OneDTable frame={frame} algoKey={algoKey} />
              }
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

function OneDTable({ frame }) {
  const dp = frame?.dp ?? []
  const current = frame?.current ?? -1
  const deps = new Set(frame?.deps ?? [])
  const highlight = new Set(frame?.highlight ?? [])

  function getCellColor(i) {
    if (i === current) return '#FBBF24' // Current computing (Amber)
    if (deps.has(i) || highlight.has(i)) return '#38BDF8' // Dependency (Cyan)
    if (dp[i] !== null && dp[i] !== undefined && dp[i] !== Infinity) return '#34D399' // Filled (Emerald)
    return '#333333' // Empty (Dark zinc)
  }

  const cellSize = dp.length > 20 ? 48 : 56
  const fontSize = dp.length > 20 ? '14px' : '16px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: '100%' }}>
      {/* Coins display */}
      {frame?.coins && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>Denominations:</span>
          {frame.coins.map(c => (
            <div key={c} style={{
              width: 44, height: 44, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.08)', border: '2px solid #38BDF8', color: '#38BDF8',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)'
            }}>{c}</div>
          ))}
        </div>
      )}

      {/* DP table */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* Index labels */}
        <div style={{ display: 'flex', gap: dp.length > 20 ? 4 : 8 }}>
          {dp.map((_, i) => (
            <div key={i} style={{
              width: cellSize, textAlign: 'center', fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color: deps.has(i) ? '#38BDF8' : i === current ? '#FBBF24' : '#52525b',
              fontWeight: i === current ? 700 : 500
            }}>{i}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'flex', gap: dp.length > 20 ? 4 : 8 }}>
          {dp.map((val, i) => {
            const color = getCellColor(i)
            const isCurrent = i === current
            return (
              <div key={i} style={{
                width: cellSize, height: cellSize, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                background: isCurrent ? 'rgba(251, 191, 36, 0.1)' : deps.has(i) ? 'rgba(56, 189, 248, 0.06)' : color === '#34D399' ? 'rgba(52, 211, 153, 0.04)' : 'transparent',
                border: `2px solid ${color}`,
                color: color === '#333333' ? '#333333' : color === '#34D399' ? '#34D399' : '#ffffff',
                transform: isCurrent ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
                boxShadow: isCurrent ? '0 8px 20px rgba(251, 191, 36, 0.3)' : deps.has(i) ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isCurrent ? 2 : 1, position: 'relative'
              }}>
                {val === null ? '' : val === Infinity ? '∞' : val}
              </div>
            )
          })}
        </div>

        {/* dp[i] labels */}
        <div style={{ display: 'flex', gap: dp.length > 20 ? 4 : 8 }}>
          {dp.map((_, i) => (
            <div key={i} style={{
              width: cellSize, textAlign: 'center', fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace', color: '#52525b', fontWeight: 500
            }}>dp[{i}]</div>
          ))}
        </div>
      </div>

      {/* Dependency arrows */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
        {deps.size > 0 && current >= 0 && (
          <div style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace', color: '#38BDF8',
            background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            dp[{current}] ← {[...deps].map(d => `dp[${d}]`).join(' + ')}
          </div>
        )}

        {/* Final answer highlight */}
        {frame && !deps.size && current >= 0 && dp[current] !== Infinity && dp[current] !== null && (
          <div style={{
            padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            background: 'rgba(16,185,129,0.08)', color: '#10B981',
            border: '1px solid rgba(16,185,129,0.3)'
          }}>
            ✓ dp[{current}] = {dp[current]}
          </div>
        )}
      </div>
    </div>
  )
}

function KnapsackTable({ frame }) {
  const dp = frame?.dp ?? []
  const currentRow = frame?.row ?? -1
  const currentCol = frame?.col ?? -1
  const capacity = dp[0]?.length - 1 ?? 0

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginBottom: 16, fontSize: '12px', color: '#71717a', textAlign: 'center', fontWeight: 500 }}>
        Rows (i) = Items, Columns (w) = Capacity
      </div>
      
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 12px', color: '#52525b', fontWeight: 600, textAlign: 'center' }}>i\w</th>
              {Array.from({ length: capacity + 1 }, (_, j) => (
                <th key={j} style={{ padding: '6px 12px', color: j === currentCol ? '#ffffff' : '#52525b', fontWeight: j === currentCol ? 700 : 500, textAlign: 'center', minWidth: 40 }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '6px 12px', color: i === currentRow ? '#ffffff' : '#52525b', fontWeight: i === currentRow ? 700 : 500, textAlign: 'center' }}>
                  {i === 0 ? '∅' : `${i}`}
                </td>
                {row.map((val, j) => {
                  const isCurrent = i === currentRow && j === currentCol
                  const isRowCol = i === currentRow || j === currentCol
                  return (
                    <td key={j} style={{ padding: 0, textAlign: 'center' }}>
                      <div style={{
                        width: 42, 
                        height: 42, 
                        borderRadius: '8px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px', 
                        fontWeight: isCurrent ? 700 : 500,
                        background: isCurrent ? 'rgba(251,191,36,0.1)' : isRowCol ? 'rgba(56,189,248,0.04)' : 'transparent',
                        border: `1.5px solid ${isCurrent ? '#FBBF24' : isRowCol ? 'rgba(56,189,248,0.3)' : '#1F1F1F'}`,
                        color: isCurrent ? '#FBBF24' : val > 0 ? '#34D399' : '#52525b',
                        transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isCurrent ? '0 0 16px rgba(251,191,36,0.3)' : 'none',
                        transition: 'all 0.25s',
                      }}>
                        {val}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}