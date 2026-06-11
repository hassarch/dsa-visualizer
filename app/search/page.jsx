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
    } else {
      if (frame?.current === i) return 'var(--compare)'
      return 'var(--primary)'
    }
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
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex gap-1">
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key}
                  onClick={() => { setAlgoKey(key); setInput(DEFAULTS[key]); playback.reset() }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: algoKey === key ? 'var(--primary)' : 'var(--border)', color: algoKey === key ? 'white' : 'var(--text-secondary)' }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <input type="text" value={arrText} onChange={e => setArrText(e.target.value)}
                placeholder="Array: 1,3,5,7,9..."
                className="px-2 py-1.5 rounded-lg text-xs font-mono w-40"
                style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
              <input type="text" value={targetText} onChange={e => setTargetText(e.target.value)}
                placeholder="Target: 7"
                className="px-2 py-1.5 rounded-lg text-xs font-mono w-24"
                style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
              <button onClick={() => {
                const a = arrText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                const t = parseInt(targetText)
                if (a.length && !isNaN(t)) { setInput({ arr: a, target: t }); playback.reset() }
              }} className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                Apply
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8"
            style={{ background: 'var(--bg-canvas)' }}>
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Target</div>
              <div className="text-3xl font-mono font-bold" style={{ color: 'var(--current)' }}>{target}</div>
            </div>

            {algoKey === 'binarySearch' && frame && (
              <div className="flex gap-1.5">
                {arr.map((_, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ width: 46 }}>
                    <div className="text-xs font-mono h-5 flex items-center" style={{ color: 'var(--pointer-a)' }}>
                      {frame.left === i ? 'L' : ''}
                    </div>
                    <div className="text-xs font-mono h-5 flex items-center" style={{ color: 'var(--current)' }}>
                      {frame.mid === i ? 'M' : ''}
                    </div>
                    <div className="text-xs font-mono h-5 flex items-center" style={{ color: 'var(--pointer-b)' }}>
                      {frame.right === i ? 'R' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-1.5 flex-wrap justify-center">
              {arr.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono font-bold transition-all duration-200"
                    style={{
                      background: `${getColor(i)}22`,
                      border: `2px solid ${getColor(i)}`,
                      color: getColor(i),
                      boxShadow: (frame?.mid === i || frame?.current === i || frame?.found === i) ? `0 0 12px ${getColor(i)}55` : 'none',
                      transform: (frame?.mid === i || frame?.current === i) ? 'scale(1.1)' : 'scale(1)',
                    }}>
                    {val}
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{i}</span>
                </div>
              ))}
            </div>

            {frame?.found >= 0 && (
              <div className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--sorted)', border: '1px solid var(--sorted)' }}>
                ✓ Found at index {frame.found}
              </div>
            )}
            {frame?.found === -2 && (
              <div className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--swap)', border: '1px solid var(--swap)' }}>
                ✗ Not found
              </div>
            )}
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