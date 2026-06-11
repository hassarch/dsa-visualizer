'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { runArrayCode, CODE_TEMPLATES } from '../../engines/arrayEngine'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { Settings, ArrowRight, Code, List } from 'lucide-react'

export default function ArraysPage() {
  const [templateKey, setTemplateKey] = useState('reverse')
  const [code, setCode] = useState(CODE_TEMPLATES.reverse)
  const [arrText, setArrText] = useState('10, 25, 45, 12, 6, 30')
  
  // Tracing input state that triggers rebuilding usePlayback
  const [input, setInput] = useState({
    arr: [10, 25, 45, 12, 6, 30],
    code: CODE_TEMPLATES.reverse,
    trigger: 0
  })

  // Generator wrapper that executes custom array code and yields logged frames
  const genFn = useCallback((inp) => {
    return (function* () {
      const frames = runArrayCode(inp.code, inp.arr)
      for (const f of frames) {
        yield f
      }
    })()
  }, [])

  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame
  const arr = frame?.array ?? input.arr
  
  const comparing = new Set(frame?.comparing ?? [])
  const swapping = new Set(frame?.swapping ?? [])

  // Automatically trace and update visualizer on code or array text change
  useEffect(() => {
    const initialArr = arrText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    const arrayInput = initialArr.length > 0 ? initialArr : [1, 2, 3, 4, 5]

    setInput({
      arr: arrayInput,
      code: code,
      trigger: Date.now()
    })
  }, [code, arrText])

  // Handle template selection
  function handleTemplateChange(key) {
    setTemplateKey(key)
    setCode(CODE_TEMPLATES[key])
  }

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
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

        {/* Middle main visualizer column */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>Select Algorithm Template:</span>
              <select 
                value={templateKey} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #1F1F1F',
                  background: '#121212',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="reverse">Reverse Array</option>
                <option value="findMax">Find Maximum Value</option>
                <option value="rotate">Rotate Left by 1</option>
                <option value="bubbleSort">Bubble Sort</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#71717a' }}>Array:</span>
              <input 
                type="text" 
                value={arrText} 
                onChange={e => setArrText(e.target.value)}
                placeholder="10, 20, 30..." 
                style={{ 
                  padding: '6px 10px', 
                  width: 200, 
                  fontSize: '12px',
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
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
            {/* Visualizer Canvas (Array cells) */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              marginBottom: 40
            }}>
              {/* Array items horizontally centered */}
              <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                {arr.map((val, i) => {
                  const isComparing = comparing.has(i)
                  const isSwapping = swapping.has(i)
                  const cellSize = arr.length > 15 ? 46 : 54

                  // Color configuration
                  let border = '#1F1F1F'
                  let background = 'transparent'
                  let textColor = '#ffffff'
                  let glow = 'none'

                  if (isComparing) {
                    border = '#ffffff'
                    background = 'rgba(255, 255, 255, 0.08)'
                    glow = '0 0 16px rgba(255, 255, 255, 0.2)'
                  } else if (isSwapping) {
                    border = '#38BDF8'
                    background = 'rgba(56, 189, 248, 0.08)'
                    textColor = '#38BDF8'
                    glow = '0 0 16px rgba(56, 189, 248, 0.2)'
                  }

                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: cellSize, 
                        height: cellSize, 
                        borderRadius: '10px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: arr.length > 15 ? '15px' : '17px', 
                        fontFamily: 'JetBrains Mono, monospace', 
                        fontWeight: 700,
                        background,
                        border: `2px solid ${border}`,
                        color: textColor,
                        transform: isComparing || isSwapping ? 'scale(1.12)' : 'scale(1)',
                        boxShadow: glow,
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}>
                        {val}
                      </div>
                      <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#52525b', fontWeight: 500 }}>{i}</span>
                    </div>
                  )
                })}
              </div>
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
          gap: 16
        }}>
          {/* CURRENT STEP */}
          <div style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#71717a',
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                Current Step
              </div>
              <div style={{
                fontSize: '14px',
                color: '#ffffff',
                lineHeight: 1.5,
                fontWeight: 400
              }}>
                {frame?.label || 'Ready to run.'}
              </div>
            </div>
            
            {/* Step Forward button */}
            <button 
              onClick={playback.stepForward}
              disabled={playback.isDone}
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                background: 'transparent',
                border: 'none',
                color: playback.isDone ? '#333333' : '#ffffff',
                cursor: playback.isDone ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              title="Step Forward"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* SOURCE CODE Input editor widget */}
          <div style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#71717a',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Code size={13} />
              <span>Source Code</span>
            </div>
            
            <textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                height: '220px',
                background: '#050505',
                border: '1px solid #1F1F1F',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                padding: '12px',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5
              }}
              placeholder="// Write your JavaScript array code here..."
            />
          </div>

          {/* RUN STATS */}
          <div style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#71717a',
              textTransform: 'uppercase'
            }}>
              Run Stats
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '13px' }}>
                  <List size={16} />
                  <span>Total steps:</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                  {playback.totalFrames}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '13px' }}>
                  <Settings size={16} />
                  <span>Current index:</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                  {playback.currentIndex + 1}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
