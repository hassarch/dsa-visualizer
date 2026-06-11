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
    if (frame?.found === i) return '#10B981' // Found (Green)
    if (frame?.found === -2) return '#EF4444' // Not Found (Red)
    if (algoKey === 'binarySearch') {
      if (frame?.mid === i) return '#ffffff' // Mid (White)
      if (i >= (frame?.left ?? 0) && i <= (frame?.right ?? arr.length - 1)) return '#a1a1aa' // In range (Grey)
      return '#333333' // Out of range (Dark grey)
    }
    if (frame?.current === i) return '#ffffff' // Current (White)
    return '#a1a1aa'
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

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input 
                type="text" 
                value={arrText} 
                onChange={e => setArrText(e.target.value)}
                placeholder="Array: 1,3,5,7..." 
                style={{ 
                  padding: '6px 10px', 
                  width: 130, 
                  fontSize: '12px',
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <input 
                type="text" 
                value={targetText} 
                onChange={e => setTargetText(e.target.value)}
                placeholder="Target" 
                style={{ 
                  padding: '6px 10px', 
                  width: 70, 
                  fontSize: '12px',
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <button 
                onClick={() => {
                  const a = arrText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                  const t = parseInt(targetText)
                  if (a.length && !isNaN(t)) { 
                    setInput({ arr: a, target: t })
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
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 40,
              width: '100%',
              marginBottom: 40
            }}>
              {/* Target badge */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#71717a', 
                  marginBottom: 10, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  fontWeight: 600 
                }}>Target</div>
                
                <div style={{
                  width: 80, 
                  height: 80, 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '2px solid #ffffff',
                  fontSize: '32px', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  fontWeight: 700, 
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(255, 255, 255, 0.15)'
                }}>
                  {target}
                </div>
              </div>

              {/* Pointer labels for binary search */}
              {algoKey === 'binarySearch' && frame && (
                <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  {arr.map((_, i) => {
                    const isLeft = frame.left === i
                    const isMid = frame.mid === i
                    const isRight = frame.right === i
                    return (
                      <div key={i} style={{ width: arr.length > 15 ? 48 : 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <div style={{ height: 16, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#F97316', fontWeight: 700 }}>
                          {isLeft ? 'L' : ''}
                        </div>
                        <div style={{ height: 16, fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', fontWeight: 700 }}>
                          {isMid ? 'M' : ''}
                        </div>
                        <div style={{ height: 16, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#8B5CF6', fontWeight: 700 }}>
                          {isRight ? 'R' : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Cell grid */}
              <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                {arr.map((val, i) => {
                  const color = getColor(i)
                  const isActive = frame?.mid === i || frame?.current === i
                  const isFound = frame?.found === i
                  const cellSize = arr.length > 15 ? 48 : 56
                  
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: cellSize, 
                        height: cellSize, 
                        borderRadius: '12px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: arr.length > 15 ? '16px' : '18px', 
                        fontFamily: 'JetBrains Mono, monospace', 
                        fontWeight: 700,
                        background: isActive ? 'rgba(255, 255, 255, 0.08)' : `${color}10`,
                        border: `2px solid ${color}`,
                        color: color === '#333333' ? '#52525b' : color,
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isFound ? `0 0 20px ${color}55` : isActive ? `0 0 16px rgba(255, 255, 255, 0.2)` : 'none',
                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}>
                        {val}
                      </div>
                      <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#52525b', fontWeight: 500 }}>{i}</span>
                    </div>
                  )
                })}
              </div>

              {/* Result banners */}
              <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
                {frame?.found >= 0 && (
                  <div style={{ 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    background: 'rgba(16,185,129,0.08)', 
                    color: '#10B981', 
                    border: '1px solid rgba(16,185,129,0.3)' 
                  }}>
                    ✓ Found {target} at index {frame.found}
                  </div>
                )}
                {frame?.found === -2 && (
                  <div style={{ 
                    padding: '8px 20px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    background: 'rgba(239,68,68,0.08)', 
                    color: '#EF4444', 
                    border: '1px solid rgba(239,68,68,0.3)' 
                  }}>
                    ✗ {target} not found in array
                  </div>
                )}
              </div>
            </div>

            {/* Controls embedded */}
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