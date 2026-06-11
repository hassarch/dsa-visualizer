'use client'
import { Play, Pause, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function PlaybackControls({ playback }) {
  const { isPlaying, isDone, play, pause, stepBack, stepForward, speed, setSpeed, currentIndex, totalFrames, goToFrame } = playback

  const speedOptions = [0.5, 1, 2]

  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #1F1F1F',
      borderRadius: '12px',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      width: '100%'
    }}>
      {/* Buttons container */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Play */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button 
            onClick={isPlaying ? pause : play} 
            disabled={isDone && !isPlaying}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: 'none',
              background: '#ffffff',
              color: '#000000',
              cursor: isDone && !isPlaying ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            {isPlaying ? <Pause size={18} fill="#000000" /> : <Play size={18} fill="#000000" />}
          </button>
          <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 500 }}>Play</span>
        </div>

        {/* Pause */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button 
            onClick={pause} 
            disabled={!isPlaying}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: 'none',
              background: '#1c1c1e',
              color: isPlaying ? '#ffffff' : '#52525b',
              cursor: isPlaying ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <Pause size={18} />
          </button>
          <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 500 }}>Pause</span>
        </div>

        {/* Step Back */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button 
            onClick={stepBack} 
            disabled={currentIndex <= 0}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: 'none',
              background: '#1c1c1e',
              color: currentIndex <= 0 ? '#52525b' : '#ffffff',
              cursor: currentIndex <= 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <ChevronsLeft size={18} />
          </button>
          <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 500 }}>Step Back</span>
        </div>

        {/* Step Forward */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button 
            onClick={stepForward} 
            disabled={isDone}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: 'none',
              background: '#1c1c1e',
              color: isDone ? '#52525b' : '#ffffff',
              cursor: isDone ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <ChevronsRight size={18} />
          </button>
          <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 500 }}>Step Forward</span>
        </div>
      </div>

      {/* Progress timeline slider */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 12px' }}>
        <input
          type="range"
          min={-1}
          max={totalFrames - 1}
          value={currentIndex}
          onChange={(e) => goToFrame(+e.target.value)}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      {/* Speed controls */}
      <div style={{
        background: '#121212',
        border: '1px solid #1F1F1F',
        borderRadius: '8px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {speedOptions.map(option => {
          const isActive = speed === option
          return (
            <button
              key={option}
              onClick={() => setSpeed(option)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? '#1c1c1e' : 'transparent',
                color: isActive ? '#ffffff' : '#71717a',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {option}x
            </button>
          )
        })}
      </div>
    </div>
  )
}