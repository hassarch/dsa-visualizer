'use client'
import { PSEUDOCODE, COMPLEXITY, PROBLEM_MAP } from '../data/problemMap'
import { ExternalLink, Clock, Database, Zap, BookOpen, Code2 } from 'lucide-react'

const difficultyColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const difficultyBg = { Easy: 'rgba(16,185,129,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }

export default function InfoPanel({ algoKey, currentFrame }) {
  const pseudo = PSEUDOCODE[algoKey] || []
  const complexity = COMPLEXITY[algoKey] || {}
  const problems = PROBLEM_MAP[algoKey] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--bg-surface)' }}>

      {/* Current step */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Zap size={12} color="var(--current)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Current Step
          </span>
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 8, minHeight: 52,
          background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)',
          borderLeft: '3px solid var(--current)',
          fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-primary)', lineHeight: 1.5
        }}>
          {currentFrame?.label || <span style={{ color: 'var(--text-muted)' }}>Press Play to begin →</span>}
        </div>
      </div>

      {/* Pseudocode */}
      {pseudo.length > 0 && (
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Code2 size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pseudocode
            </span>
          </div>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-canvas)' }}>
            {pseudo.map((line, i) => (
              <div key={i} style={{
                padding: '4px 12px', display: 'flex', gap: 12,
                borderBottom: i < pseudo.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 16, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complexity */}
      {complexity.time && (
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Clock size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Complexity
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[
              { icon: Clock, label: 'Time', value: complexity.time, color: 'var(--compare)' },
              { icon: Database, label: 'Space', value: complexity.space, color: 'var(--visited)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
          {complexity.best && (
            <div style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-canvas)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Best: <span style={{ color: 'var(--sorted)' }}>{complexity.best}</span>
            </div>
          )}
          {complexity.note && (
            <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', fontSize: 11, color: 'var(--current)' }}>
              💡 {complexity.note}
            </div>
          )}
        </div>
      )}

      {/* LeetCode problems */}
      {problems.length > 0 && (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <BookOpen size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              LeetCode Problems
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {problems.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                background: 'var(--bg-canvas)', border: '1px solid var(--border)',
                transition: 'border-color 0.15s'
              }}>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>#{p.id} </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</span>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: 'var(--bg-elevated)', color: 'var(--text-muted)'
                  }}>
                    {p.pattern}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: difficultyBg[p.difficulty], color: difficultyColor[p.difficulty]
                  }}>
                    {p.difficulty}
                  </span>
                  <ExternalLink size={11} color="var(--text-muted)" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}