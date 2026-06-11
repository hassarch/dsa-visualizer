'use client'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 3, 4]

export default function PlaybackControls({ playback }) {
  const { isPlaying, isDone, play, pause, stepBack, stepForward, reset, speed, setSpeed, currentIndex, totalFrames } = playback
  const progress = totalFrames > 0 ? ((currentIndex + 1) / totalFrames) * 100 : 0

  return (
    <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '12px 20px' }}>
      {/* Progress bar */}
      <div style={{ position: 'relative', height: 3, borderRadius: 2, background: 'var(--border)', marginBottom: 12, cursor: 'pointer' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 2,
          background: isDone ? 'var(--sorted)' : 'var(--primary)',
          width: `${progress}%`, transition: 'width 0.1s'
        }} />
        {progress > 0 && (
          <div style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            left: `${progress}%`, width: 10, height: 10, borderRadius: '50%',
            background: isDone ? 'var(--sorted)' : 'var(--primary)',
            border: '2px solid var(--bg-surface)', transition: 'left 0.1s'
          }} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Frame counter */}
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', minWidth: 90 }}>
          {currentIndex < 0 ? 'Ready to play' : isDone ? '✓ Complete' : `${currentIndex + 1} / ${totalFrames}`}
        </span>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={reset} title="Reset (R)" style={{
            width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s'
          }}>
            <RotateCcw size={14} />
          </button>
          <button onClick={stepBack} disabled={currentIndex <= 0} title="Step Back (←)" style={{
            width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer', opacity: currentIndex <= 0 ? 0.3 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
          }}>
            <SkipBack size={14} />
          </button>

          {/* Play/Pause - main button */}
          <button onClick={isPlaying ? pause : play} disabled={isDone && !isPlaying} title="Play/Pause (Space)" style={{
            width: 44, height: 44, borderRadius: 10, border: 'none',
            background: isDone ? 'var(--sorted)' : 'var(--primary)',
            color: 'white', cursor: isDone && !isPlaying ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDone ? '0 0 12px rgba(16,185,129,0.3)' : '0 0 12px rgba(59,130,246,0.3)',
            transition: 'all 0.15s', transform: 'scale(1)', fontSize: 13, fontWeight: 600
          }}>
            {isDone ? '✓' : isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>

          <button onClick={stepForward} disabled={isDone} title="Step Forward (→)" style={{
            width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            cursor: isDone ? 'not-allowed' : 'pointer', opacity: isDone ? 0.3 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
          }}>
            <SkipForward size={14} />
          </button>
        </div>

        {/* Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>SPEED</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{
                padding: '3px 7px', borderRadius: 5, border: '1px solid',
                borderColor: speed === s ? 'var(--primary)' : 'var(--border)',
                background: speed === s ? 'var(--primary-glow)' : 'transparent',
                color: speed === s ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
                transition: 'all 0.15s', fontWeight: speed === s ? 600 : 400
              }}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}