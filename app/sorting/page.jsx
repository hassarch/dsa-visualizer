'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort } from '../../engines/sortingEngines'
import PlaybackControls from '../../components/PlaybackControls'
import InfoPanel from '../../components/InfoPanel'
import Sidebar from '../../components/Sidebar'
import { Shuffle } from 'lucide-react'

const ALGOS = {
  bubble: { label: 'Bubble Sort', fn: bubbleSort },
  selection: { label: 'Selection Sort', fn: selectionSort },
  insertion: { label: 'Insertion Sort', fn: insertionSort },
  merge: { label: 'Merge Sort', fn: mergeSort },
  quick: { label: 'Quick Sort', fn: quickSort },
  heap: { label: 'Heap Sort', fn: heapSort },
}

function randomArray(n = 20) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10)
}

export default function SortingPage() {
  const [algoKey, setAlgoKey] = useState('bubble')
  const [inputArr, setInputArr] = useState([])
  const [inputText, setInputText] = useState('')
  const [size, setSize] = useState(20)
  const [isClient, setIsClient] = useState(false)
  
  // Generate random array only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setInputArr(randomArray(20))
  }, [])

  const genFn = useCallback((arr) => ALGOS[algoKey].fn(arr), [algoKey])
  const playback = usePlayback(genFn, inputArr.length > 0 ? inputArr : [10])
  const frame = playback.currentFrame

  const arr = frame?.array ?? (inputArr.length > 0 ? inputArr : [10])
  const comparing = new Set(frame?.comparing ?? [])
  const swapping = new Set(frame?.swapping ?? [])
  const sorted = new Set(frame?.sorted ?? [])
  const pivot = frame?.pivot
  const maxVal = Math.max(...arr, 1)
  
  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null
  }

  function getBarColor(i) {
    if (sorted.has(i)) return 'var(--sorted)'
    if (swapping.has(i)) return 'var(--swap)'
    if (comparing.has(i)) return 'var(--compare)'
    if (i === pivot) return 'var(--pointer-b)'
    return 'var(--primary)'
  }

  function getBarGlow(i) {
    if (swapping.has(i)) return `0 0 16px rgba(239,68,68,0.5)`
    if (comparing.has(i)) return `0 0 16px rgba(245,158,11,0.5)`
    if (i === pivot) return `0 0 16px rgba(139,92,246,0.5)`
    if (sorted.has(i)) return `0 0 8px rgba(16,185,129,0.3)`
    return 'none'
  }

  function handleShuffle() {
    setInputArr(randomArray(size))
    setInputText('')
    playback.reset()
  }

  function handleAlgoChange(key) {
    setAlgoKey(key)
    playback.reset()
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
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key} onClick={() => handleAlgoChange(key)} style={{
                  padding: '5px 12px', borderRadius: 7, border: '1px solid',
                  borderColor: algoKey === key ? 'var(--primary)' : 'var(--border)',
                  background: algoKey === key ? 'var(--primary-glow)' : 'transparent',
                  color: algoKey === key ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: algoKey === key ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>n={size}</span>
              <input type="range" min={5} max={50} value={size}
                onChange={(e) => { setSize(+e.target.value); setInputArr(randomArray(+e.target.value)) }}
                style={{ width: 80 }} />
              <button onClick={handleShuffle} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer'
              }}>
                <Shuffle size={13} /> Shuffle
              </button>
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="5,3,8,1,9..." style={{ padding: '5px 10px', width: 130, fontSize: 12 }} />
              <button onClick={() => {
                const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                if (nums.length > 1) { setInputArr(nums); playback.reset() }
              }} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer'
              }}>Apply</button>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '48px', background: 'var(--bg-canvas)', position: 'relative'
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              gap: arr.length > 30 ? 2 : arr.length > 20 ? 4 : 6, 
              height: '80%', maxWidth: '1400px', width: '100%'
            }}>
              {/* Grid lines */}
              {[25, 50, 75, 100].map(pct => (
                <div key={pct} style={{
                  position: 'absolute', left: 0, right: 0,
                  bottom: `${pct * 0.8}%`,
                  height: 1, background: 'var(--border)', opacity: 0.3, pointerEvents: 'none'
                }} />
              ))}

              {arr.map((val, i) => {
                const color = getBarColor(i)
                const isActive = comparing.has(i) || swapping.has(i) || i === pivot
                const barWidth = Math.max(6, Math.min(64, 1200 / arr.length))
                return (
                  <div key={i} style={{ 
                    flex: 1, 
                    maxWidth: barWidth, 
                    minWidth: 6, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    position: 'relative',
                    height: '100%'
                  }}>
                    {arr.length <= 25 && (
                      <div style={{
                        fontSize: arr.length > 18 ? 11 : 14, 
                        fontFamily: 'JetBrains Mono, monospace',
                        color, 
                        marginBottom: 8, 
                        fontWeight: 700, 
                        transition: 'color 0.2s'
                      }}>
                        {val}
                      </div>
                    )}
                    <div style={{
                      width: '100%', 
                      borderRadius: '6px 6px 2px 2px',
                      height: `${(val / maxVal) * 85}%`, 
                      minHeight: 8,
                      background: `linear-gradient(180deg, ${color} 0%, ${color}BB 100%)`,
                      boxShadow: getBarGlow(i),
                      transition: 'height 0.15s, background 0.2s, box-shadow 0.2s',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '8px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Unsorted' },
              { color: 'var(--compare)', label: 'Comparing' },
              { color: 'var(--swap)', label: 'Swapping' },
              { color: 'var(--sorted)', label: 'Sorted' },
              { color: 'var(--pointer-b)', label: 'Pivot' },
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
          <InfoPanel algoKey={algoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}