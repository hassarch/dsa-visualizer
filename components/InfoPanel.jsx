'use client'
import { PSEUDOCODE, COMPLEXITY, PROBLEM_MAP } from '../data/problemMap'
import { Clock, Database, Trophy, ArrowRight, ExternalLink } from 'lucide-react'

function getActiveLine(algoKey, label) {
  if (!label) return -1
  const l = label.toLowerCase()
  
  switch(algoKey) {
    case 'bubble':
      if (l.includes('swapping')) return 3
      if (l.includes('comparing')) return 2
      return 0
      
    case 'selection':
      if (l.includes('swapping') || l.includes('swapped')) return 5
      if (l.includes('comparing')) return 2
      if (l.includes('finding min') || l.includes('min:')) return 3
      return 0
      
    case 'insertion':
      if (l.includes('shifting')) return 4
      if (l.includes('inserted')) return 6
      if (l.includes('inserting') || l.includes('key =')) return 1
      return 0
      
    case 'merge':
      if (l.includes('splitting')) return 1
      if (l.includes('merging') || l.includes('placed') || l.includes('copying')) return 4
      return 0
      
    case 'quick':
      if (l.includes('pivot =')) return 1
      if (l.includes('vs pivot') || l.includes('comparing')) return 4
      if (l.includes('swapping')) return 5
      if (l.includes('final position') || l.includes('placed')) return 6
      return 0
      
    case 'heap':
      if (l.includes('moving max')) return 3
      if (l.includes('heapifying')) return 4
      if (l.includes('heapify')) return 1
      return 0
      
    case 'binarySearch':
      if (l.includes('found at index') || l.includes('found')) return 3
      if (l.includes('mid =') || l.includes('mid')) return 2
      if (l.includes('not found') || l.includes('not')) return 6
      return 1
      
    case 'linearSearch':
      if (l.includes('found')) return 2
      if (l.includes('checking') || l.includes('comparing')) return 1
      return 0
      
    case 'fibonacci':
    case 'climbingStairs':
      if (l.includes('calculating') || l.includes('dp[')) return 2
      return 1
      
    case 'coinChange':
      if (l.includes('updating') || l.includes('try coin') || l.includes('dp[')) return 4
      return 2
      
    case 'knapsack':
      if (l.includes('row') || l.includes('col') || l.includes('dp[')) return 3
      return 1

    default:
      return -1
  }
}

export default function InfoPanel({ algoKey, currentFrame, playback }) {
  const pseudo = PSEUDOCODE[algoKey] || []
  const complexity = COMPLEXITY[algoKey] || {}
  const problems = PROBLEM_MAP[algoKey] || []
  
  const activeLineIndex = getActiveLine(algoKey, currentFrame?.label)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {/* Current Step Card */}
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
            {currentFrame?.label || 'Press Play to begin.'}
          </div>
        </div>
        
        {/* Step Forward Arrow in the bottom right corner */}
        {playback && (
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
        )}
      </div>

      {/* Pseudocode Card */}
      {pseudo.length > 0 && (
        <div style={{
          background: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#71717a',
            textTransform: 'uppercase',
            marginBottom: 16
          }}>
            Pseudocode
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px'
          }}>
            {pseudo.map((line, i) => {
              const isActive = i === activeLineIndex
              return (
                <div 
                  key={i} 
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    color: isActive ? '#ffffff' : '#71717a',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s',
                    whiteSpace: 'pre',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{line}</span>
                  {isActive && (
                    <span style={{ fontSize: '9px', opacity: 0.5, color: '#a1a1aa' }}>
                      // Current Operation
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Complexity Card */}
      {complexity.time && (
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
            Complexity
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Time Complexity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '13px' }}>
                <Clock size={16} style={{ strokeWidth: 2 }} />
                <span>Time Complexity:</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                {complexity.time}
              </span>
            </div>

            {/* Space Complexity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '13px' }}>
                <Database size={16} style={{ strokeWidth: 2 }} />
                <span>Space Complexity:</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                {complexity.space}
              </span>
            </div>

            {/* Best Case */}
            {complexity.best && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a1a1aa', fontSize: '13px' }}>
                  <Trophy size={16} style={{ strokeWidth: 2 }} />
                  <span>Best Case:</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                  {complexity.best}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LeetCode Problems Card */}
      {problems.length > 0 && (
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
            textTransform: 'uppercase'
          }}>
            LeetCode Problems
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {problems.map((p) => (
              <a 
                key={p.id} 
                href={p.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  textDecoration: 'none',
                  background: '#121212', 
                  border: '1px solid #1F1F1F',
                  transition: 'all 0.15s',
                  color: '#ffffff'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', marginBottom: 2 }}>
                    <span style={{ color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>#{p.id} </span>
                    <span style={{ fontWeight: 500 }}>{p.title}</span>
                  </div>
                  <span style={{
                    fontSize: '9px', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: '#1c1c1e', 
                    color: '#71717a'
                  }}>
                    {p.pattern}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: '9px', 
                    fontWeight: 600, 
                    padding: '2px 8px', 
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)', 
                    color: '#a1a1aa',
                    border: '1px solid #1F1F1F'
                  }}>
                    {p.difficulty}
                  </span>
                  <ExternalLink size={10} color="#71717a" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}