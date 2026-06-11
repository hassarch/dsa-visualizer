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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key} onClick={() => { setAlgoKey(key); setInput(DEFAULTS[key]); playback.reset() }} style={{
                  padding: '5px 12px', borderRadius: 7, border: '1px solid',
                  borderColor: algoKey === key ? 'var(--primary)' : 'var(--border)',
                  background: algoKey === key ? 'var(--primary-glow)' : 'transparent',
                  color: algoKey === key ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: algoKey === key ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* DP Canvas */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, background: 'var(--bg-canvas)' }}>
            {algoKey === 'knapsack' && frame?.dp
              ? <KnapsackTable frame={frame} />
              : <OneDTable frame={frame} algoKey={algoKey} />
            }
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

function OneDTable({ frame }) {
  const dp = frame?.dp ?? []
  const current = frame?.current ?? -1
  const deps = new Set(frame?.deps ?? [])
  const highlight = new Set(frame?.highlight ?? [])

  function getCellColor(i) {
    if (i === current) return 'var(--compare)'
    if (deps.has(i) || highlight.has(i)) return 'var(--visited)'
    if (dp[i] !== null && dp[i] !== undefined && dp[i] !== Infinity) return 'var(--dp-fill)'
    return 'var(--border)'
  }

  const cellSize = dp.length > 20 ? 64 : 76
  const fontSize = dp.length > 20 ? 18 : 22

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, maxWidth: '1600px' }}>
      {/* Coins display */}
      {frame?.coins && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Denominations:</span>
          {frame.coins.map(c => (
            <div key={c} style={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              background: 'rgba(167,139,250,0.15)', border: '3px solid var(--visited)', color: 'var(--visited)',
              boxShadow: '0 0 16px rgba(167,139,250,0.3)'
            }}>{c}</div>
          ))}
        </div>
      )}

      {/* DP table */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Index labels */}
        <div style={{ display: 'flex', gap: dp.length > 20 ? 4 : 8 }}>
          {dp.map((_, i) => (
            <div key={i} style={{
              width: cellSize, textAlign: 'center', fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              color: deps.has(i) ? 'var(--visited)' : i === current ? 'var(--compare)' : 'var(--text-muted)',
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
                width: cellSize, height: cellSize, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                background: `${color}25`,
                border: `3px solid ${color}`,
                color,
                transform: isCurrent ? 'scale(1.2) translateY(-6px)' : 'scale(1)',
                boxShadow: isCurrent ? `0 12px 32px ${color}55` : deps.has(i) ? `0 0 16px ${color}40` : 'none',
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
              width: cellSize, textAlign: 'center', fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 500
            }}>dp[{i}]</div>
          ))}
        </div>
      </div>

      {/* Dependency arrows */}
      {deps.size > 0 && current >= 0 && (
        <div style={{
          padding: '12px 20px', borderRadius: 10, fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace', color: 'var(--visited)',
          background: 'rgba(167,139,250,0.1)', border: '2px solid rgba(167,139,250,0.3)'
        }}>
          dp[{current}] ← {[...deps].map(d => `dp[${d}]`).join(' + ')}
        </div>
      )}

      {/* Final answer highlight */}
      {frame && !deps.size && current >= 0 && dp[current] !== Infinity && dp[current] !== null && (
        <div style={{
          padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600,
          background: 'rgba(16,185,129,0.12)', color: 'var(--sorted)',
          border: '2px solid rgba(16,185,129,0.4)'
        }}>
          ✓ dp[{current}] = {dp[current]}
        </div>
      )}
    </div>
  )
}

function KnapsackTable({ frame }) {
  const dp = frame?.dp ?? []
  const currentRow = frame?.row ?? -1
  const currentCol = frame?.col ?? -1
  const capacity = dp[0]?.length - 1 ?? 0

  return (
    <div style={{ overflow: 'auto', maxWidth: '1400px' }}>
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500 }}>
        rows = items, columns = capacity
      </div>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>i\W</th>
            {Array.from({ length: capacity + 1 }, (_, j) => (
              <th key={j} style={{ padding: '6px 12px', color: j === currentCol ? 'var(--compare)' : 'var(--text-muted)', fontWeight: j === currentCol ? 700 : 500, textAlign: 'center', minWidth: 48 }}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '6px 12px', color: i === currentRow ? 'var(--compare)' : 'var(--text-muted)', fontWeight: i === currentRow ? 700 : 500, textAlign: 'center' }}>
                {i === 0 ? '∅' : `${i}`}
              </td>
              {row.map((val, j) => {
                const isCurrent = i === currentRow && j === currentCol
                const isRowCol = i === currentRow || j === currentCol
                return (
                  <td key={j} style={{
                    padding: 0, textAlign: 'center',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: isCurrent ? 700 : 500,
                      background: isCurrent ? 'var(--compare)' : isRowCol ? 'rgba(186,230,253,0.12)' : 'var(--bg-elevated)',
                      border: `2px solid ${isCurrent ? 'var(--compare)' : isRowCol ? 'rgba(186,230,253,0.3)' : 'var(--border)'}`,
                      color: isCurrent ? '#000' : val > 0 ? 'var(--dp-fill)' : 'var(--text-muted)',
                      transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
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
  )
}