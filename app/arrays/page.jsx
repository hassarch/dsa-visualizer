'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { runArrayCode, DEFAULT_TEMPLATES } from '../../engines/arrayEngine'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { Settings, ArrowRight, Code, List, Plus, X } from 'lucide-react'

export default function ArraysPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(DEFAULT_TEMPLATES.javascript)
  const [arrText, setArrText] = useState('10, 25, 45, 12, 6, 30')
  const [arr2Text, setArr2Text] = useState('3, 8, 15')
  const [useArr2, setUseArr2] = useState(false)
  
  // Tracing input state that triggers rebuilding usePlayback
  const [input, setInput] = useState({
    arr: [10, 25, 45, 12, 6, 30],
    arr2: null,
    code: DEFAULT_TEMPLATES.javascript,
    language: 'javascript',
    trigger: 0
  })

  // Generator wrapper that executes custom array code and yields logged frames
  const genFn = useCallback((inp) => {
    return (function* () {
      const frames = runArrayCode(inp.code, inp.arr, inp.language, inp.arr2)
      for (const f of frames) {
        yield f
      }
    })()
  }, [])

  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame
  const arr = frame?.array ?? input.arr
  const arr2 = frame?.array2 ?? input.arr2
  
  const comparing = new Set(frame?.comparing ?? [])
  const swapping = new Set(frame?.swapping ?? [])
  const activeArray = frame?.activeArray ?? 'arr'

  // Automatically trace and update visualizer on code or array text change
  useEffect(() => {
    const initialArr = arrText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    const arrayInput = initialArr.length > 0 ? initialArr : [1, 2, 3, 4, 5]
    
    let array2Input = null
    if (useArr2) {
      const parsed = arr2Text.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
      array2Input = parsed.length > 0 ? parsed : [1, 2, 3]
    }

    setInput({
      arr: arrayInput,
      arr2: array2Input,
      code: code,
      language: language,
      trigger: Date.now()
    })
  }, [code, arrText, arr2Text, language, useArr2])

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
            justifyContent: 'flex-start',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>arr:</span>
              <input 
                type="text" 
                value={arrText} 
                onChange={e => setArrText(e.target.value)}
                placeholder="10, 20, 30..." 
                style={{ 
                  padding: '6px 10px', 
                  width: 180, 
                  fontSize: '12px',
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
            </div>
            
            {/* Second array input */}
            {useArr2 ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>arr2:</span>
                <input 
                  type="text" 
                  value={arr2Text} 
                  onChange={e => setArr2Text(e.target.value)}
                  placeholder="3, 8, 15..." 
                  style={{ 
                    padding: '6px 10px', 
                    width: 160, 
                    fontSize: '12px',
                    background: '#121212',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <button
                  onClick={() => setUseArr2(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2
                  }}
                  title="Remove second array"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setUseArr2(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#71717a',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Add a second input array (for problems like Median of Two Sorted Arrays)"
              >
                <Plus size={12} />
                <span>arr2</span>
              </button>
            )}
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
              {/* Primary array */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                {arr2 && <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>arr (nums1)</span>}
                <div style={{ display: 'flex', gap: arr.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                {arr.map((val, i) => {
                  const isComparing = activeArray === 'arr' && comparing.has(i)
                  const isSwapping = activeArray === 'arr' && swapping.has(i)
                  const cellSize = arr.length > 15 ? 46 : 54

                  // Color configuration
                  let border = '#1F1F1F'
                  let background = 'transparent'
                  let textColor = '#ffffff'
                  let glow = 'none'

                  if (isComparing) {
                    border = '#FBBF24'
                    background = 'rgba(251, 191, 36, 0.08)'
                    textColor = '#FBBF24'
                    glow = '0 0 16px rgba(251, 191, 36, 0.3)'
                  } else if (isSwapping) {
                    border = '#38BDF8'
                    background = 'rgba(56, 189, 248, 0.08)'
                    textColor = '#38BDF8'
                    glow = '0 0 16px rgba(56, 189, 248, 0.3)'
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
              
              {/* Second array (if present) */}
              {arr2 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', marginTop: 20 }}>
                  <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>arr2 (nums2)</span>
                  <div style={{ display: 'flex', gap: arr2.length > 15 ? 4 : 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  {arr2.map((val, i) => {
                    const isComparing = activeArray === 'arr2' && comparing.has(i)
                    const isSwapping = activeArray === 'arr2' && swapping.has(i)
                    const cellSize = arr2.length > 15 ? 46 : 54

                    let border = '#1F1F1F'
                    let background = 'transparent'
                    let textColor = '#a78bfa'
                    let glow = 'none'

                    if (isComparing) {
                      border = '#FBBF24'
                      background = 'rgba(251, 191, 36, 0.08)'
                      textColor = '#FBBF24'
                      glow = '0 0 16px rgba(251, 191, 36, 0.3)'
                    } else if (isSwapping) {
                      border = '#38BDF8'
                      background = 'rgba(56, 189, 248, 0.08)'
                      textColor = '#38BDF8'
                      glow = '0 0 16px rgba(56, 189, 248, 0.3)'
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
                          fontSize: arr2.length > 15 ? '15px' : '17px', 
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
              )}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
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
              <select
                value={language}
                onChange={(e) => {
                  const lang = e.target.value
                  setLanguage(lang)
                  setCode(DEFAULT_TEMPLATES[lang])
                }}
                style={{
                  background: '#121212',
                  border: '1px solid #1F1F1F',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '11px',
                  padding: '4px 8px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
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
              placeholder={
                language === 'javascript'
                  ? "// Write your JavaScript array code here..."
                  : language === 'python'
                    ? "# Write your Python array code here..."
                    : "// Write your Java array code here..."
              }
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
