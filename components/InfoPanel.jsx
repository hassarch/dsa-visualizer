'use client'
import { PSEUDOCODE, COMPLEXITY, PROBLEM_MAP } from '../data/problemMap'
import { ExternalLink, Clock, Database, Zap } from 'lucide-react'

const difficultyColor = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#EF4444',
}

export default function InfoPanel({ algoKey, currentFrame }) {
  const pseudo = PSEUDOCODE[algoKey] || []
  const complexity = COMPLEXITY[algoKey] || {}
  const problems = PROBLEM_MAP[algoKey] || []

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>

      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Current Step
        </div>
        <div className="text-sm font-mono p-3 rounded-lg min-h-[48px]"
          style={{ background: 'var(--bg-canvas)', color: 'var(--current)', borderLeft: '3px solid var(--current)' }}>
          {currentFrame?.label || 'Press Play to begin'}
        </div>
      </div>

      {pseudo.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Pseudocode
          </div>
          <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
            {pseudo.map((line, i) => (
              <div key={i} className="px-3 py-1 text-xs font-mono"
                style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: 12 }}>{i + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {complexity.time && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Complexity
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-canvas)' }}>
              <div className="flex items-center gap-1 mb-1">
                <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Time</span>
              </div>
              <div className="text-sm font-mono font-bold" style={{ color: 'var(--compare)' }}>{complexity.time}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-canvas)' }}>
              <div className="flex items-center gap-1 mb-1">
                <Database size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Space</span>
              </div>
              <div className="text-sm font-mono font-bold" style={{ color: 'var(--visited)' }}>{complexity.space}</div>
            </div>
          </div>
          {complexity.note && (
            <div className="mt-2 text-xs px-2 py-1.5 rounded"
              style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--current)' }}>
              <Zap size={10} className="inline mr-1" />{complexity.note}
            </div>
          )}
        </div>
      )}

      {problems.length > 0 && (
        <div className="p-4">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Related LeetCode Problems
          </div>
          <div className="flex flex-col gap-2">
            {problems.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg group transition-all hover:opacity-80"
                style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                <div>
                  <div className="text-xs font-mono">
                    <span style={{ color: 'var(--text-muted)' }}>#{p.id} </span>
                    <span style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                  </div>
                  <div className="mt-0.5">
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                      {p.pattern}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: difficultyColor[p.difficulty] }}>{p.difficulty}</span>
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}