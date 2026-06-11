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

  const isKnapsack = algoKey === 'knapsack'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key}
                  onClick={() => { setAlgoKey(key); setInput(DEFAULTS[key]); playback.reset() }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: algoKey === key ? 'var(--primary)' : 'var(--border)', color: algoKey === key ? 'white' : 'var(--text-secondary)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* DP table */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6"
            style={{ background: 'var(--bg-canvas)' }}>
            {isKnapsack && frame?.dp
              ? <KnapsackTable frame={frame} />
              : <OneDTable frame={frame} algoKey={algoKey} />
            }
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

function OneDTable({ frame, algoKey }) {
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

  return (
    <div className="flex flex-col items-center gap-6">
      {frame?.coins && (
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Coins:</span>
          {frame.coins.map(c => (
            <div key={c} className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono"
              style={{ background: 'rgba(167,139,250,0.2)', border: '2px solid var(--visited)', color: 'var(--visited)' }}>
              {c}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        {dp.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="text-xs font-mono" style={{ color: deps.has(i) ? 'var(--visited)' : 'var(--text-muted)' }}>{i}</div>
            <div className="flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 rounded-lg"
              style={{
                width: 52, height: 52,
                background: `${getCellColor(i)}33`,
                border: `2px solid ${getCellColor(i)}`,
                color: getCellColor(i),
                boxShadow: i === current ? `0 0 12px ${getCellColor(i)}55` : 'none',
                transform: i === current ? 'scale(1.12)' : 'scale(1)',
              }}>
              {val === null ? '' : val === Infinity ? '∞' : val}
            </div>
          </div>
        ))}
      </div>
      {deps.size > 0 && current >= 0 && (
        <div className="text-xs font-mono" style={{ color: 'var(--visited)' }}>
          ← depends on {[...deps].map(d => `dp[${d}]`).join(' and ')}
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
    <div className="overflow-auto">
      <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace' }}>
        <thead>
          <tr>
            <th className="p-2 text-center" style={{ color: 'var(--text-muted)', minWidth: 60 }}>item\W</th>
            {Array.from({ length: capacity + 1 }, (_, j) => (
              <th key={j} className="p-1 text-center" style={{ color: 'var(--text-muted)', minWidth: 36 }}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.map((row, i) => (
            <tr key={i}>
              <td className="p-2 text-center font-bold" style={{ color: 'var(--text-muted)' }}>
                {i === 0 ? '∅' : `i=${i}`}
              </td>
              {row.map((val, j) => {
                const isCurrent = i === currentRow && j === currentCol
                const isCurrentRow = i === currentRow
                return (
                  <td key={j} style={{
                    padding: 4,
                    background: isCurrent ? 'var(--compare)' : isCurrentRow && j <= currentCol ? 'rgba(186,230,253,0.1)' : 'transparent',
                    border: `1px solid ${isCurrent ? 'var(--compare)' : 'var(--border)'}`,
                    color: isCurrent ? '#000' : val > 0 ? 'var(--dp-fill)' : 'var(--text-muted)',
                    textAlign: 'center',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    transform: isCurrent ? 'scale(1.1)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {val}
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