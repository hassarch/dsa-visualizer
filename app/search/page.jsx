'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { binarySearch, linearSearch } from '../../engines/searchEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  binarySearch: { label: 'Binary Search', fn: binarySearch },
  linearSearch: { label: 'Linear Search', fn: linearSearch },
}

const DEFAULTS = {
  binarySearch: { arr: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 23 },
  linearSearch: { arr: [64, 34, 25, 12, 22, 11, 90, 45, 67, 33], target: 22 },
}

export default function SearchPage() {
  const [algoKey, setAlgoKey] = useState('binarySearch')
  const [input, setInput] = useState(DEFAULTS.binarySearch)
  const [arrText, setArrText] = useState('')
  const [targetText, setTargetText] = useState('')

  const genFn = useCallback((inp) => ALGOS[algoKey].fn(inp), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

  const arr = frame?.array ?? input.arr
  const target = frame?.target ?? input.target

  function getColor(i) {
    if (frame?.found === i) return 'var(--sorted)'
    if (frame?.found === -2) return 'var(--swap)'
    if (algoKey === 'binarySearch') {
      if (frame?.mid === i) return 'var(--compare)'
      if (i >= (frame?.left ?? 0) && i <= (frame?.right ?? arr.length - 1)) return 'var(--primary)'
      return 'var(--text-muted)'
    }
    if (frame?.current === i) return 'var(--compare)'
    return 'var(--primary)'
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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" value={arrText} onChange={e => setArrText(e.target.value)}
                placeholder="Array: 1,3,5,7..." style={{ padding: '5px 10px', width: 150, fontSize: 12 }} />
              <input type="text" value={targetText} onChange={e => setTargetText(e.target.value)}
                placeholder="Target" style={{ padding: '5px 10px', width: 80, fontSize: 12 }} />
              <button onClick={() => {
                const a = arrText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                const t = parseInt(targetText)
                if (a.length && !isNaN(t)) { setInput({ arr: a, target: t }); playback.reset() }
              }} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                Apply
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 64, padding: 64, background: 'var(--bg-canvas)' }}>

            {/* Target badge */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Target</div>
              <div style={{
                width: 96, height: 96, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(6,182,212,0.12)', border: '3px solid var(--current)',
                fontSize: 40, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--current)',
                boxShadow: '0 0 32px rgba(6,182,212,0.3)'
              }}>
                {target}
              </div>
            </div>

            {/* Pointer labels - binary search */}
            {algoKey === 'binarySearch' && frame && (
              <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1200px' }}>
                {arr.map((_, i) => (
                  <div key={i} style={{ width: arr.length > 15 ? 56 : 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ height: 20, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--pointer-a)', fontWeight: 700 }}>
                      {frame.left === i ? 'L' : ''}
                    </div>
                    <div style={{ height: 20, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--current)', fontWeight: 700 }}>
                      {frame.mid === i ? 'M' : ''}
                    </div>
                    <div style={{ height: 20, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--pointer-b)', fontWeight: 700 }}>
                      {frame.right === i ? 'R' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Array elements */}
            <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1200px' }}>
              {arr.map((val, i) => {
                const color = getColor(i)
                const isActive = frame?.mid === i || frame?.current === i
                const isFound = frame?.found === i
                const cellSize = arr.length > 15 ? 56 : 72
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: cellSize, height: cellSize, borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: arr.length > 15 ? 18 : 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                      background: `${color}18`,
                      border: `3px solid ${color}`,
                      color,
                      transform: isActive ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: isFound ? `0 0 28px ${color}66` : isActive ? `0 0 20px ${color}55` : 'none',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}>
                      {val}
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 500 }}>{i}</span>
                  </div>
                )
              })}
            </div>

            {/* Result */}
            {frame?.found >= 0 && (
              <div style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: 'var(--sorted)', border: '2px solid rgba(16,185,129,0.4)' }}>
                ✓ Found {target} at index {frame.found}
              </div>
            )}
            {frame?.found === -2 && (
              <div style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: 'var(--swap)', border: '2px solid rgba(239,68,68,0.4)' }}>
                ✗ {target} not found in array
              </div>
            )}
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