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
  return Array.from({ length: n }, () => Math.floor(Math.random() * 80) + 15)
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

  // Find index pairs for drawing connection lines
  const activeIndices = [...frame?.comparing ?? [], ...frame?.swapping ?? []]
  
  // Keyboard controls
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

  if (!isClient) {
    return null
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
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button 
                  key={key} 
                  onClick={() => handleAlgoChange(key)} 
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>n={size}</span>
                <input 
                  type="range" 
                  min={5} 
                  max={40} 
                  value={size}
                  onChange={(e) => { 
                    setSize(+e.target.value)
                    setInputArr(randomArray(+e.target.value))
                    playback.reset()
                  }}
                  style={{ width: 80 }} 
                />
              </div>

              <button 
                onClick={handleShuffle} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #1F1F1F',
                  background: '#121212',
                  color: '#a1a1aa',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'color 0.15s'
                }}
              >
                <Shuffle size={13} />
                <span>Shuffle</span>
              </button>

              <div style={{ display: 'flex', gap: 4 }}>
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)}
                  placeholder="5,3,8,1,9..." 
                  style={{ 
                    padding: '6px 10px', 
                    width: 100, 
                    fontSize: '12px',
                    background: '#121212',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <button 
                  onClick={() => {
                    const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                    if (nums.length > 1) { 
                      setInputArr(nums)
                      playback.reset()
                    }
                  }} 
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #1F1F1F',
                    background: '#121212',
                    color: '#a1a1aa',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
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
            
            {/* Color Legend */}
            <div style={{ 
              display: 'flex', 
              gap: 20, 
              justifyContent: 'center', 
              marginBottom: 12,
              flexWrap: 'wrap'
            }}>
              {[
                { label: 'Comparing', color: '#FBBF24' },
                { label: 'Swapping', color: '#38BDF8' },
                { label: 'Pivot', color: '#A78BFA' },
                { label: 'Sorted', color: '#34D399' },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    background: color,
                    boxShadow: `0 0 6px ${color}66`
                  }} />
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#71717a', 
                    fontWeight: 600, 
                    letterSpacing: '0.05em', 
                    textTransform: 'uppercase' 
                  }}>{label}</span>
                </div>
              ))}
            </div>
            
            {/* Visualizer Canvas Area */}
            <div style={{
              flex: 1,
              width: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginBottom: 40
            }}>
              
              {/* SVG Overlay for curved connection lines */}
              {activeIndices.length === 2 && (
                <svg 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                >
                  {(() => {
                    const idx1 = Math.min(activeIndices[0], activeIndices[1])
                    const idx2 = Math.max(activeIndices[0], activeIndices[1])
                    const N = arr.length
                    
                    const x1 = ((idx1 + 0.5) / N) * 100
                    const x2 = ((idx2 + 0.5) / N) * 100
                    
                    // Height is proportional to 70% max
                    const y1 = 100 - (arr[idx1] / maxVal) * 70
                    const y2 = 100 - (arr[idx2] / maxVal) * 70
                    
                    // Curved line top height (slightly above the taller bar, capped at 10%)
                    const y_curve = Math.max(10, Math.min(y1, y2) - 8)
                    const r = Math.min(2.5, (x2 - x1) / 2) // corner radius

                    // Color arc by operation type
                    const arcColor = swapping.size > 0 ? '#38BDF8' : '#FBBF24'

                    return (
                      <path 
                        d={`M ${x1} ${y1} 
                            L ${x1} ${y_curve + r} 
                            Q ${x1} ${y_curve} ${x1 + r} ${y_curve} 
                            L ${x2 - r} ${y_curve} 
                            Q ${x2} ${y_curve} ${x2} ${y_curve + r} 
                            L ${x2} ${y2}`} 
                        stroke={arcColor} 
                        strokeWidth="1.5" 
                        vectorEffect="non-scaling-stroke"
                        fill="none"
                        opacity={0.7}
                      />
                    )
                  })()}
                </svg>
              )}

              {/* Grid lines (subtle dark lines) */}
              {[25, 50, 75].map(pct => (
                <div key={pct} style={{
                  position: 'absolute', left: 0, right: 0,
                  bottom: `${pct}%`,
                  height: 1, background: '#1F1F1F', opacity: 0.5, pointerEvents: 'none'
                }} />
              ))}

              {/* Bars chart */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                zIndex: 2
              }}>
                {arr.map((val, i) => {
                  const isComparing = comparing.has(i)
                  const isSwapping = swapping.has(i)
                  const isPivot = i === pivot
                  const isSorted = sorted.has(i)
                  const isActive = isComparing || isSwapping || isPivot
                  
                  // Dim inactive bars if there is an active operation going on
                  const hasActiveOperation = comparing.size > 0 || swapping.size > 0 || pivot !== undefined
                  const barOpacity = isActive ? 1 : isSorted ? 0.9 : hasActiveOperation ? 0.3 : 1

                  // State-based colors
                  let barColor = '#ffffff'
                  let barGlow = 'none'
                  let labelColor = '#71717a'

                  if (isSwapping) {
                    barColor = '#38BDF8'      // Cyan for swap
                    barGlow = '0 0 20px rgba(56, 189, 248, 0.5)'
                    labelColor = '#38BDF8'
                  } else if (isComparing) {
                    barColor = '#FBBF24'      // Amber for compare
                    barGlow = '0 0 20px rgba(251, 191, 36, 0.5)'
                    labelColor = '#FBBF24'
                  } else if (isPivot) {
                    barColor = '#A78BFA'      // Purple for pivot
                    barGlow = '0 0 20px rgba(167, 139, 250, 0.5)'
                    labelColor = '#A78BFA'
                  } else if (isSorted) {
                    barColor = '#34D399'      // Emerald for sorted
                    barGlow = 'none'
                    labelColor = '#34D399'
                  }

                  // Width configuration
                  const barWidthPercent = 100 / arr.length

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        width: `${barWidthPercent}%`,
                        height: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 4px',
                        transition: 'opacity 0.25s ease',
                        opacity: barOpacity
                      }}
                    >
                      {/* Bar Value (Only render if array size is small enough to fit labels) */}
                      {arr.length <= 22 && (
                        <div style={{
                          fontSize: '11px', 
                          fontFamily: 'JetBrains Mono, monospace',
                          color: labelColor, 
                          marginBottom: 8, 
                          fontWeight: 600,
                          transition: 'color 0.2s'
                        }}>
                          {val}
                        </div>
                      )}

                      {/* Colored Pill Bar */}
                      <div style={{
                        width: '100%',
                        maxWidth: 36,
                        minHeight: 12,
                        borderRadius: '9999px',
                        height: `${(val / maxVal) * 70}%`, 
                        background: barColor,
                        boxShadow: barGlow,
                        transition: 'height 0.15s, transform 0.2s, box-shadow 0.25s, background 0.25s',
                        transform: isActive ? 'scaleX(1.1)' : 'scale(1)',
                      }} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Playback Controls embedded inside Visualizer Card */}
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
          paddingRight: 4 // prevent scrollbar overlaps
        }}>
          <InfoPanel algoKey={algoKey} currentFrame={frame} playback={playback} />
        </div>

      </div>
    </div>
  )
}