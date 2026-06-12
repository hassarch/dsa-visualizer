'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import {
  twoPointers, slidingWindowFixed, slidingWindowVariable,
  prefixSum, kadane, trappingRainWater, dutchNationalFlag
} from '../../engines/arrayEngines'
import { ARRAY_PROBLEMS } from '../../data/arrayProblems'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { ExternalLink, Clock, Database, Zap, BookOpen, Code2 } from 'lucide-react'

const PATTERNS = {
  twoPointers: {
    label: 'Two Pointers',
    fn: twoPointers,
    defaultInput: { arr: [1, 3, 5, 7, 9, 11, 15], target: 16 },
    description: 'Two pointers converging from both ends of a sorted array',
    color: '#F97316',
  },
  slidingWindowFixed: {
    label: 'Sliding Window (Fixed)',
    fn: slidingWindowFixed,
    defaultInput: { arr: [2, 1, 5, 1, 3, 2, 4, 1], k: 3 },
    description: 'Fixed-size window slides across array tracking running sum',
    color: '#8B5CF6',
  },
  slidingWindowVariable: {
    label: 'Sliding Window (Variable)',
    fn: slidingWindowVariable,
    defaultInput: { arr: [1, 4, 2, 3, 1, 5, 2], target: 6 },
    description: 'Variable window expands right and shrinks from left',
    color: '#A78BFA',
  },
  prefixSum: {
    label: 'Prefix Sum',
    fn: prefixSum,
    defaultInput: { arr: [3, 1, 4, 1, 5, 9, 2, 6], queryL: 2, queryR: 5 },
    description: 'Precompute cumulative sums for O(1) range queries',
    color: '#06B6D4',
  },
  kadane: {
    label: "Kadane's Algorithm",
    fn: kadane,
    defaultInput: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    description: 'Maximum subarray sum using local and global tracking',
    color: '#10B981',
  },
  trappingRainWater: {
    label: 'Trapping Rain Water',
    fn: trappingRainWater,
    defaultInput: { arr: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
    description: 'Water trapped between heights using left/right max arrays',
    color: '#3B82F6',
  },
  dutchNationalFlag: {
    label: 'Dutch National Flag',
    fn: dutchNationalFlag,
    defaultInput: { arr: [2, 0, 1, 2, 1, 0, 0, 2, 1] },
    description: 'Three-way partition with low/mid/high pointers',
    color: '#EF4444',
  },
}

const difficultyColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const difficultyBg = { Easy: 'rgba(16,185,129,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }

export default function ArraysPage() {
  const [patternKey, setPatternKey] = useState('twoPointers')
  const [input, setInput] = useState(PATTERNS.twoPointers.defaultInput)
  const [inputText, setInputText] = useState('')

  const pattern = PATTERNS[patternKey]
  const info = ARRAY_PROBLEMS[patternKey]

  const genFn = useCallback((inp) => pattern.fn(inp), [patternKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

  function handlePatternChange(key) {
    setPatternKey(key)
    setInput(PATTERNS[key].defaultInput)
    setInputText('')
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
         
          {/* Pattern selector */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {Object.entries(PATTERNS).map(([key, { label, color }]) => (
              <button key={key} onClick={() => handlePatternChange(key)} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid',
                borderColor: patternKey === key ? color : 'var(--border)',
                background: patternKey === key ? `${color}18` : 'transparent',
                color: patternKey === key ? color : 'var(--text-secondary)',
                fontSize: 12, fontWeight: patternKey === key ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                {label}
              </button>
            ))}
             
            {/* Custom input */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="text" value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Custom array: 1,2,3..."
                style={{ padding: '5px 10px', width: 160, fontSize: 12, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button onClick={() => {
                const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                if (nums.length > 1) {
                  setInput({ ...input, arr: nums })
                  playback.reset()
                }
              }} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer'
              }}>Apply</button>
            </div>
          </div>

          {/* Pattern description */}
          <div style={{ padding: '10px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: pattern.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pattern.description}</span>
          </div>
          
          {/* Visualizer */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ArrayVisualizer frame={frame} patternKey={patternKey} input={input} color={pattern.color} />
          </div>
          
          <PlaybackControls playback={playback} />
        </div>
        
        {/* Info panel */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <ArrayInfoPanel info={info} currentFrame={frame} patternKey={patternKey} />
        </div>
      </div>
    </div>
  )
}

// ─── Visualizer dispatcher ───────────────────────────────────────────────────

function ArrayVisualizer({ frame, patternKey, input, color }) {
  const props = { frame, input, color }
  
  if (patternKey === 'twoPointers') return <TwoPointersViz {...props} />
  if (patternKey === 'slidingWindowFixed') return <SlidingWindowViz {...props} fixed />
  if (patternKey === 'slidingWindowVariable') return <SlidingWindowViz {...props} />
  if (patternKey === 'prefixSum') return <PrefixSumViz {...props} />
  if (patternKey === 'kadane') return <KadaneViz {...props} />
  if (patternKey === 'trappingRainWater') return <RainWaterViz {...props} />
  if (patternKey === 'dutchNationalFlag') return <DutchFlagViz {...props} />
  return null
}

// ─── Cell component ──────────────────────────────────────────────────────────

function Cell({ val, index, color, scale = 1, label, glow = false, dim = false, extra }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {label && (
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color, height: 18, display: 'flex', alignItems: 'center' }}>
          {label}
        </div>
      )}
      <div style={{
        width: 52, height: 52, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
        background: dim ? 'var(--bg-elevated)' : `${color}18`,
        border: `2px solid ${dim ? 'var(--border)' : color}`,
        color: dim ? 'var(--text-muted)' : color,
        transform: `scale(${scale})`,
        boxShadow: glow ? `0 0 16px ${color}55` : 'none',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}>
        {val}
        {extra && (
          <div style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderRadius: '50%', background: extra, border: '2px solid var(--bg-canvas)' }} />
        )}
      </div>
      {index !== undefined && (
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{index}</div>
      )}
    </div>
  )
}

// ─── Two Pointers ─────────────────────────────────────────────────────────────

function TwoPointersViz({ frame, input, color }) {
  const arr = frame?.array ?? input.arr
  const left = frame?.left ?? 0
  const right = frame?.right ?? arr.length - 1
  const found = frame?.found ?? []
  const sum = frame?.sum
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: 32, background: 'var(--bg-canvas)' }}>
      {sum !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Current Sum</div>
            <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: found.length ? 'var(--sorted)' : 'var(--compare)' }}>{sum}</div>
          </div>
          <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>vs</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Target</div>
            <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--current)' }}>{frame?.target ?? input.target}</div>
          </div>
        </div>
      )}
      
      {/* Pointer labels */}
      <div style={{ display: 'flex', gap: 6 }}>
        {arr.map((_, i) => (
          <div key={i} style={{ width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: i === left ? 'var(--pointer-a)' : 'transparent' }}>L</div>
            <div style={{ height: 20, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: i === right ? 'var(--pointer-b)' : 'transparent' }}>R</div>
          </div>
        ))}
      </div>
      
      {/* Array */}
      <div style={{ display: 'flex', gap: 6 }}>
        {arr.map((val, i) => {
          const isLeft = i === left
          const isRight = i === right
          const isFound = found.includes(i)
          const color = isFound ? 'var(--sorted)' : isLeft ? 'var(--pointer-a)' : isRight ? 'var(--pointer-b)' : 'var(--primary)'
          return (
            <Cell key={i} val={val} index={i} color={color}
              scale={isLeft || isRight || isFound ? 1.1 : 1}
              glow={isLeft || isRight || isFound}
              dim={!isLeft && !isRight && !isFound && frame !== null}
            />
          )
        })}
      </div>
      
      {found.length > 0 && (
        <div style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--sorted)', border: '1px solid rgba(16,185,129,0.3)' }}>
          ✓ Found pair: {arr[found[0]]} + {arr[found[1]]} = {frame?.target ?? input.target}
        </div>
      )}
    </div>
  )
}

// ─── Sliding Window ───────────────────────────────────────────────────────────

function SlidingWindowViz({ frame, input, color, fixed }) {
  const arr = frame?.array ?? input.arr
  const wStart = frame?.windowStart ?? 0
  // For fixed window, default to k-1. For variable window, start at -1 but it will be set by frame
  const wEnd = frame?.windowEnd ?? (fixed && input.k !== undefined ? input.k - 1 : (frame ? -1 : -1))
  const windowSum = frame?.windowSum ?? (fixed && input.k !== undefined ? input.arr.slice(0, input.k).reduce((a, b) => a + b, 0) : 0)
  const maxSum = frame?.maxSum
  const bestLeft = frame?.bestLeft
  const bestRight = frame?.bestRight
  const currentSum = frame?.currentSum ?? 0
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: 32, background: 'var(--bg-canvas)' }}>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: 24 }}>
        {fixed && windowSum !== undefined && (
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Window Sum</div>
            <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--pointer-b)' }}>{windowSum}</div>
          </div>
        )}
        {!fixed && frame && (
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Current Sum</div>
            <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--pointer-b)' }}>{currentSum}</div>
          </div>
        )}
        {!fixed && (
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Target</div>
            <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--sorted)' }}>{input.target}</div>
          </div>
        )}
        {fixed && maxSum !== undefined && (
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Max Sum</div>
            <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--sorted)' }}>{maxSum}</div>
          </div>
        )}
      </div>
      
      {/* Window bracket */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {wEnd >= wStart && wEnd >= 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, paddingLeft: `${wStart * 58}px`, transition: 'padding 0.3s' }}>
            <div style={{ width: `${(wEnd - wStart + 1) * 58 - 6}px`, height: 3, borderRadius: 2, background: 'var(--pointer-b)', transition: 'width 0.3s, padding 0.3s' }} />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 6 }}>
          {arr.map((val, i) => {
            const inWindow = wEnd >= 0 && i >= wStart && i <= wEnd
            const isBest = bestLeft !== undefined && i >= bestLeft && i <= bestRight
            const isLeaving = frame?.leaving === i
            const isEntering = frame?.entering === i
            const c = isLeaving ? 'var(--swap)' : isEntering ? 'var(--sorted)' : inWindow ? 'var(--pointer-b)' : isBest ? 'var(--compare)' : 'var(--primary)'
            return (
              <Cell key={i} val={val} index={i} color={c}
                scale={inWindow ? 1.05 : 1}
                glow={inWindow}
                dim={frame !== null && !inWindow && !isBest}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Prefix Sum ───────────────────────────────────────────────────────────────

function PrefixSumViz({ frame, input, color }) {
  const arr = frame?.array ?? input.arr
  const prefix = frame?.prefix ?? []
  const building = frame?.building ?? -1
  const queryL = frame?.queryL ?? input.queryL
  const queryR = frame?.queryR ?? input.queryR
  const result = frame?.result
  const phase = frame?.phase ?? 'build'
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: 32, background: 'var(--bg-canvas)' }}>
      
      {/* Original array */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Original Array</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {arr.map((val, i) => {
            const inQuery = i >= queryL && i <= queryR
            const c = phase === 'query' || phase === 'done' ? (inQuery ? 'var(--compare)' : 'var(--primary)') : (i === building ? 'var(--current)' : 'var(--primary)')
            return <Cell key={i} val={val} index={i} color={c} glow={inQuery && (phase === 'query' || phase === 'done')} />
          })}
        </div>
      </div>
      
      {/* Arrow */}
      <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>↓ prefix sums</div>
      
      {/* Prefix array */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Prefix Sum Array</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {prefix.map((val, i) => {
            const isQueryBound = (phase === 'query' || phase === 'done') && (i === queryL || i === queryR + 1)
            const c = isQueryBound ? 'var(--sorted)' : i === building + 1 ? 'var(--current)' : val !== 0 ? 'var(--dp-fill)' : 'var(--border)'
            return <Cell key={i} val={val} index={`p[${i}]`} color={c} glow={isQueryBound} scale={isQueryBound ? 1.1 : 1} />
          })}
        </div>
      </div>
      
      {/* Result */}
      {result !== undefined && (
        <div style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(16,185,129,0.1)', color: 'var(--sorted)', border: '1px solid rgba(16,185,129,0.3)' }}>
          sum({queryL}..{queryR}) = prefix[{queryR+1}] - prefix[{queryL}] = {result}
        </div>
      )}
    </div>
  )
}

// ─── Kadane's ─────────────────────────────────────────────────────────────────

function KadaneViz({ frame, input, color }) {
  const arr = frame?.array ?? input.arr
  const currentStart = frame?.currentStart ?? 0
  const currentEnd = frame?.currentEnd ?? 0
  const maxStart = frame?.maxStart ?? 0
  const maxEnd = frame?.maxEnd ?? 0
  const currentSum = frame?.currentSum
  const maxSum = frame?.maxSum
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: 32, background: 'var(--bg-canvas)' }}>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Current Sum</div>
          <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--current)' }}>{currentSum ?? '—'}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Max Sum</div>
          <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--sorted)' }}>{maxSum ?? '—'}</div>
        </div>
      </div>
      
      {/* Array */}
      <div style={{ display: 'flex', gap: 6 }}>
        {arr.map((val, i) => {
          const inCurrent = i >= currentStart && i <= currentEnd
          const inMax = i >= maxStart && i <= maxEnd
          const c = inCurrent ? 'var(--current)' : inMax ? 'var(--sorted)' : val < 0 ? 'var(--swap)' : 'var(--primary)'
          return (
            <Cell key={i} val={val} index={i} color={c}
              scale={inCurrent ? 1.1 : 1}
              glow={inCurrent || inMax}
            />
          )
        })}
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { color: 'var(--current)', label: 'Current subarray' },
          { color: 'var(--sorted)', label: 'Max subarray' },
          { color: 'var(--swap)', label: 'Negative' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Trapping Rain Water ──────────────────────────────────────────────────────

function RainWaterViz({ frame, input, color }) {
  const arr = frame?.array ?? input.arr
  const water = frame?.water ?? new Array(arr.length).fill(0)
  const leftMax = frame?.leftMax ?? new Array(arr.length).fill(0)
  const rightMax = frame?.rightMax ?? new Array(arr.length).fill(0)
  const current = frame?.current ?? -1
  const total = frame?.total ?? 0
  const phase = frame?.phase ?? 'init'
  const maxH = Math.max(...arr, 1)
  const BAR_W = 44
  const BAR_MAX_H = 180
  
  // Ensure arrays are valid
  if (!arr || arr.length === 0) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>
  }
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, background: 'var(--bg-canvas)' }}>
      
      {total > 0 && (
        <div style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }}>
          Total water: {total} units
        </div>
      )}
      
      {/* Bar visualization */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: BAR_MAX_H + 40 }}>
        {arr.map((height, i) => {
          const waterH = water[i] ?? 0
          const barH = height === 0 ? 0 : (height / maxH) * BAR_MAX_H
          const waterVizH = waterH === 0 ? 0 : (waterH / maxH) * BAR_MAX_H
          const isCurrent = i === current
          const lmH = leftMax[i] ? (leftMax[i] / maxH) * BAR_MAX_H : 0
          const rmH = rightMax[i] ? (rightMax[i] / maxH) * BAR_MAX_H : 0
          
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: BAR_W }}>
              <div style={{ position: 'relative', width: BAR_W, height: BAR_MAX_H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* Water layer */}
                {waterVizH > 0 && (
                  <div style={{
                    position: 'absolute', bottom: barH, left: 0, right: 0,
                    height: waterVizH, borderRadius: '2px 2px 0 0',
                    background: 'rgba(59,130,246,0.35)',
                    border: '1px solid rgba(59,130,246,0.5)',
                    transition: 'height 0.3s'
                  }} />
                )}
                {/* Height bar */}
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: barH, minHeight: 4,
                  background: isCurrent
                    ? `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`
                    : phase === 'leftMax' && i <= current
                      ? `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`
                      : phase === 'rightMax' && i >= current
                        ? `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`
                        : phase === 'fill' && i === current
                          ? `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`
                        : `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`,
                  boxShadow: isCurrent ? `0 0 12px rgba(255,255,255,0.5)` : 'none',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.2)'
                }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginTop: 4 }}>{height}</div>
            </div>
          )
        })}
      </div>
      
      {/* Phase legend */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { color: 'var(--pointer-a)', label: 'Left max' },
          { color: 'var(--pointer-b)', label: 'Right max' },
          { color: 'rgba(59,130,246,0.5)', label: 'Water' },
          { color: 'var(--compare)', label: 'Current' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dutch National Flag ──────────────────────────────────────────────────────

function DutchFlagViz({ frame, input, color }) {
  const arr = frame?.array ?? input.arr
  const low = frame?.low ?? 0
  const mid = frame?.mid ?? 0
  const high = frame?.high ?? arr.length - 1
  const swapping = new Set(frame?.swapping ?? [])
  
  function getCellColor(val, i) {
    if (swapping.has(i)) return 'var(--compare)'
    if (val === 0) return 'var(--pointer-a)'
    if (val === 1) return 'var(--sorted)'
    return 'var(--swap)'
  }
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: 32, background: 'var(--bg-canvas)' }}>
      
      {/* Pointer labels */}
      <div style={{ display: 'flex', gap: 6 }}>
        {arr.map((_, i) => (
          <div key={i} style={{ width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ height: 16, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: i === low ? 'var(--pointer-a)' : 'transparent' }}>low</div>
            <div style={{ height: 16, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: i === mid ? 'var(--current)' : 'transparent' }}>mid</div>
            <div style={{ height: 16, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: i === high ? 'var(--pointer-b)' : 'transparent' }}>high</div>
          </div>
        ))}
      </div>
      
      {/* Array */}
      <div style={{ display: 'flex', gap: 6 }}>
        {arr.map((val, i) => (
          <Cell key={i} val={val} index={i}
            color={getCellColor(val, i)}
            scale={swapping.has(i) ? 1.12 : 1}
            glow={swapping.has(i) || i === mid}
          />
        ))}
      </div>
      
      {/* Partition zones */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { color: 'var(--pointer-a)', label: '0s (red zone)' },
          { color: 'var(--sorted)', label: '1s (white zone)' },
          { color: 'var(--swap)', label: '2s (blue zone)' },
          { color: 'var(--compare)', label: 'Swapping' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function ArrayInfoPanel({ info, currentFrame, patternKey }) {
  if (!info) return null
  const { problems, pseudocode, complexity } = info
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--bg-surface)' }}>
      
      {/* Current step */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Zap size={12} color="var(--current)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Step</span>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, minHeight: 52, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderLeft: '3px solid var(--current)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {currentFrame?.label || <span style={{ color: 'var(--text-muted)' }}>Press Play to begin →</span>}
        </div>
      </div>
      
      {/* Pseudocode */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Code2 size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pseudocode</span>
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-canvas)' }}>
          {pseudocode.map((line, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', gap: 12, borderBottom: i < pseudocode.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Complexity */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Clock size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--compare)' }}>{complexity.time}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Space</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--visited)' }}>{complexity.space}</div>
          </div>
        </div>
        {complexity.note && (
          <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', fontSize: 11, color: 'var(--current)' }}>
            💡 {complexity.note}
          </div>
        )}
      </div>
      
      {/* LeetCode problems */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <BookOpen size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LeetCode Problems</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {problems.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: 'var(--bg-canvas)', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}>
              <div>
                <div style={{ fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>#{p.id} </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</span>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{p.pattern}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: difficultyBg[p.difficulty], color: difficultyColor[p.difficulty] }}>{p.difficulty}</span>
                <ExternalLink size={11} color="var(--text-muted)" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
