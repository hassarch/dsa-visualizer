import { useState, useRef, useCallback, useEffect } from 'react'

const SPEED_DELAYS = {
  0.25: 1600,
  0.5: 800,
  1: 400,
  1.5: 267,
  2: 200,
  3: 133,
  4: 100,
}

export function usePlayback(generatorFn, input) {
  const [frames, setFrames] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isDone, setIsDone] = useState(false)

  const rafRef = useRef(null)
  const lastTickRef = useRef(0)
  const framesRef = useRef([])

  const buildFrames = useCallback(() => {
    if (!generatorFn || input == null) return
    const gen = generatorFn(input)
    const allFrames = []
    for (const frame of gen) allFrames.push(frame)
    framesRef.current = allFrames
    setFrames(allFrames)
    setCurrentIndex(-1)
    setIsPlaying(false)
    setIsDone(false)
  }, [generatorFn, input])

  useEffect(() => { buildFrames() }, [buildFrames])

  const currentFrame = frames[currentIndex] ?? null
  const totalFrames = frames.length

  const stepForward = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(i + 1, framesRef.current.length - 1)
      if (next === framesRef.current.length - 1) setIsDone(true)
      return next
    })
  }, [])

  const stepBack = useCallback(() => {
    setIsDone(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setCurrentIndex(-1)
    setIsPlaying(false)
    setIsDone(false)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const delay = SPEED_DELAYS[speed] ?? 400

    const tick = (ts) => {
      if (ts - lastTickRef.current >= delay) {
        lastTickRef.current = ts
        setCurrentIndex((i) => {
          const next = i + 1
          if (next >= framesRef.current.length - 1) {
            setIsPlaying(false)
            setIsDone(true)
            return framesRef.current.length - 1
          }
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, speed])

  return {
    frames,
    currentFrame,
    currentIndex,
    totalFrames,
    isPlaying,
    isDone,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    rebuild: buildFrames,
  }
}