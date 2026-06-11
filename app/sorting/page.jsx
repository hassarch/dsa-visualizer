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
  const [inputArr, setInputArr] = useState(() => randomArray())
  const [inputText, setInputText] = useState('')
  const [size, setSize] = useState(20)

  const genFn = useCallback((arr) => ALGOS[algoKey].fn(arr), [algoKey])
  const playback = usePlayback(genFn, inputArr)
  const frame = playback.currentFrame

  const arr = frame?.array ?? inputArr
  const comparing = new Set(frame?.comparing ?? [])
  const swapping = new Set(frame?.swapping ?? [])
  const sorted = new Set(frame?.sorted ?? [])
  const pivot = frame?.pivot
  const maxVal = Math.max(...arr, 1)

  function getBarColor(i) {
    if (sorted.has(i)) return 'var(--sorted)'
    if (swapping.has(i)) return 'var(--swap)'
    if (comparing.has(i)) return 'var(--compare)'
    if (i === pivot) return 'var(--pointer-b)'
    return 'var(--primary)'
  }

  function handleShuffle() {
    setInputArr(randomArray(size))
    setInputText('')
    playback.reset()
  }

  function handleCustomInput() {
    const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length > 1) { setInputArr(nums); playback.reset() }
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
        {/* Main canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button key={key} onClick={() => handleAlgoChange(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: algoKey === key ? 'var(--primary)' : 'var(--border)', color: algoKey === key ? 'white' : 'var(--text-secondary)' }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>n={size}</span>
              <input type="range" min={5} max={50} value={size}
                onChange={(e) => { setSize(+e.target.value); setInputArr(randomArray(+e.target.value)) }}
                className="w-24" />
              <button onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                <Shuffle size={13} /> Shuffle
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="5,3,8,1,9,2..."
                className="px-2 py-1.5 rounded-lg text-xs font-mono w-36"
                style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
              <button onClick={handleCustomInput}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                Apply
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex-1 relative flex items-end justify-center gap-0.5 px-6 pb-8 pt-6"
            style={{ background: 'var(--bg-canvas)' }}>
            {arr.map((val, i) => (
              <div key={i} className="flex flex-col items-center" style={{ flex: 1, maxWidth: 48, minWidth: 4 }}>
                {arr.length <= 30 && (
                  <span className="text-xs font-mono mb-1 transition-all duration-200"
                    style={{ color: getBarColor(i), fontSize: arr.length > 20 ? 9 : 11 }}>
                    {val}
                  </span>
                )}
                <div className="w-full rounded-t transition-all duration-150"
                  style={{
                    height: `${(val / maxVal) * 85}%`,
                    background: getBarColor(i),
                    minHeight: 4,
                    boxShadow: comparing.has(i) || swapping.has(i) ? `0 0 8px ${getBarColor(i)}66` : 'none',
                  }} />
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-6 py-2 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            {[
              { color: 'var(--primary)', label: 'Unsorted' },
              { color: 'var(--compare)', label: 'Comparing' },
              { color: 'var(--swap)', label: 'Swapping' },
              { color: 'var(--sorted)', label: 'Sorted' },
              { color: 'var(--pointer-b)', label: 'Pivot' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>

          <PlaybackControls playback={playback} />
        </div>

        {/* Info panel */}
        <div className="border-l flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: 320, borderColor: 'var(--border)' }}>
          <InfoPanel algoKey={algoKey} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}