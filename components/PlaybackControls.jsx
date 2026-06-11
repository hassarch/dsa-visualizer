'use client'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from 'lucide-react'

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 3, 4]

export default function PlaybackControls({ playback }) {
  const { isPlaying, isDone, play, pause, stepBack, stepForward, reset, speed, setSpeed, currentIndex, totalFrames } = playback
  const progress = totalFrames > 0 ? ((currentIndex + 1) / totalFrames) * 100 : 0

  return (
    <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }} className="px-4 py-3">
      <div className="relative h-1 rounded-full mb-3" style={{ background: 'var(--border)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%`, background: 'var(--primary)' }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', minWidth: 80 }}>
          {currentIndex < 0 ? 'Ready' : `Frame ${currentIndex + 1} / ${totalFrames}`}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--border)', color: 'var(--text-secondary)' }} title="Reset (R)">
            <RotateCcw size={15} />
          </button>
          <button onClick={stepBack} disabled={currentIndex <= 0}
            className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30"
            style={{ background: 'var(--border)', color: 'var(--text-secondary)' }} title="Step Back (←)">
            <SkipBack size={15} />
          </button>
          <button
            onClick={isPlaying ? pause : play}
            disabled={isDone && !isPlaying}
            className="px-5 py-2 rounded-lg font-medium transition-all text-white"
            style={{ background: isDone ? 'var(--sorted)' : 'var(--primary)' }}
            title="Play/Pause (Space)"
          >
            {isDone ? '✓ Done' : isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={stepForward} disabled={isDone}
            className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30"
            style={{ background: 'var(--border)', color: 'var(--text-secondary)' }} title="Step Forward (→)">
            <SkipForward size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Gauge size={13} style={{ color: 'var(--text-muted)' }} />
          <div className="flex gap-1">
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className="px-2 py-1 rounded text-xs font-mono transition-all"
                style={{ background: speed === s ? 'var(--primary)' : 'var(--border)', color: speed === s ? 'white' : 'var(--text-secondary)' }}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}