'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import {
  stackPush, stackPop, stackPeek, stackSearch,
  queueEnqueue, queueDequeue, queuePeek, queueSearch,
  balancedParentheses, reversePolishNotation, stackUsingQueues, queueUsingStacks, minStack
} from '../../engines/stackQueueEngines'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { Clock, BookOpen, Code2, Zap, Plus, Minus, Eye, Search as SearchIcon } from 'lucide-react'

const STACK_OPS = {
  stackPush: {
    label: 'Push',
    fn: stackPush,
    defaultInput: { stack: [10, 20, 30, 40], value: 50 },
    description: 'Add element to top of stack (LIFO)',
    color: '#8B5CF6',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['stack.push(value)', 'top++', 'return value'],
  },
  stackPop: {
    label: 'Pop',
    fn: stackPop,
    defaultInput: { stack: [10, 20, 30, 40, 50] },
    description: 'Remove and return top element',
    color: '#EF4444',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['if empty: error', 'value = stack[top]', 'top--', 'return value'],
  },
  stackPeek: {
    label: 'Peek',
    fn: stackPeek,
    defaultInput: { stack: [10, 20, 30, 40, 50] },
    description: 'View top element without removing',
    color: '#06B6D4',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['if empty: error', 'return stack[top]'],
  },
  stackSearch: {
    label: 'Search',
    fn: stackSearch,
    defaultInput: { stack: [10, 20, 30, 40, 50], target: 30 },
    description: 'Find element in stack',
    color: '#F59E0B',
    complexity: { time: 'O(n)', space: 'O(1)' },
    pseudocode: ['for i from top to bottom:', '  if stack[i] == target:', '    return i', 'return -1'],
  },
}

const QUEUE_OPS = {
  queueEnqueue: {
    label: 'Enqueue',
    fn: queueEnqueue,
    defaultInput: { queue: [10, 20, 30, 40], value: 50 },
    description: 'Add element to rear of queue (FIFO)',
    color: '#8B5CF6',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['queue[rear] = value', 'rear++', 'return value'],
  },
  queueDequeue: {
    label: 'Dequeue',
    fn: queueDequeue,
    defaultInput: { queue: [10, 20, 30, 40, 50] },
    description: 'Remove and return front element',
    color: '#EF4444',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['if empty: error', 'value = queue[front]', 'front++', 'return value'],
  },
  queuePeek: {
    label: 'Peek',
    fn: queuePeek,
    defaultInput: { queue: [10, 20, 30, 40, 50] },
    description: 'View front element without removing',
    color: '#06B6D4',
    complexity: { time: 'O(1)', space: 'O(1)' },
    pseudocode: ['if empty: error', 'return queue[front]'],
  },
  queueSearch: {
    label: 'Search',
    fn: queueSearch,
    defaultInput: { queue: [10, 20, 30, 40, 50], target: 30 },
    description: 'Find element in queue',
    color: '#F59E0B',
    complexity: { time: 'O(n)', space: 'O(1)' },
    pseudocode: ['for i from front to rear:', '  if queue[i] == target:', '    return i', 'return -1'],
  },
}

const APPLICATIONS = {
  balancedParentheses: {
    label: 'Balanced Parens',
    fn: balancedParentheses,
    defaultInput: { expression: '({[]})' },
    description: 'Check if parentheses are balanced using stack',
    color: '#10B981',
    complexity: { time: 'O(n)', space: 'O(n)' },
    pseudocode: ['for each char:', '  if opening: push', '  if closing:', '    if match: pop', '    else: invalid', 'return stack.empty()'],
  },
  reversePolishNotation: {
    label: 'RPN Calculator',
    fn: reversePolishNotation,
    defaultInput: { expression: '3 4 + 2 * 7 /' },
    description: 'Evaluate Reverse Polish Notation expression',
    color: '#F59E0B',
    complexity: { time: 'O(n)', space: 'O(n)' },
    pseudocode: ['for each token:', '  if number: push', '  if operator:', '    pop b, pop a', '    push (a op b)', 'return stack.top()'],
  },
  stackUsingQueues: {
    label: 'Stack Using Queues',
    fn: stackUsingQueues,
    defaultInput: { operations: [
      { type: 'push', value: 10 },
      { type: 'push', value: 20 },
      { type: 'push', value: 30 },
      { type: 'pop' },
      { type: 'push', value: 40 },
      { type: 'pop' }
    ]},
    description: 'Implement Stack using 2 Queues',
    color: '#8B5CF6',
    complexity: { time: 'O(n) push, O(1) pop', space: 'O(n)' },
    pseudocode: ['push(x):', '  enqueue x to q1', '  move all old to q2', '  swap q1, q2', 'pop(): dequeue q1'],
  },
  queueUsingStacks: {
    label: 'Queue Using Stacks',
    fn: queueUsingStacks,
    defaultInput: { operations: [
      { type: 'enqueue', value: 10 },
      { type: 'enqueue', value: 20 },
      { type: 'enqueue', value: 30 },
      { type: 'dequeue' },
      { type: 'enqueue', value: 40 },
      { type: 'dequeue' }
    ]},
    description: 'Implement Queue using 2 Stacks',
    color: '#EC4899',
    complexity: { time: 'O(1) enqueue, O(n) dequeue worst', space: 'O(n)' },
    pseudocode: ['enqueue(x): push to s1', 'dequeue():', '  if s2 empty:', '    move all s1 to s2', '  pop from s2'],
  },
  minStack: {
    label: 'Min Stack',
    fn: minStack,
    defaultInput: { operations: [
      { type: 'push', value: 5 },
      { type: 'push', value: 2 },
      { type: 'push', value: 7 },
      { type: 'getMin' },
      { type: 'pop' },
      { type: 'getMin' },
      { type: 'pop' },
      { type: 'getMin' }
    ]},
    description: 'Stack with O(1) minimum element retrieval',
    color: '#06B6D4',
    complexity: { time: 'O(1) all ops', space: 'O(n)' },
    pseudocode: ['push(x):', '  stack.push(x)', '  if x <= min: minStack.push(x)', 'pop():', '  if stack.pop() == min:', '    minStack.pop()', 'getMin(): return minStack.top()'],
  },
}

export default function StackQueuePage() {
  const [mode, setMode] = useState('stack') // 'stack' or 'queue' or 'applications'
  const [opKey, setOpKey] = useState('stackPush')
  const [input, setInput] = useState(STACK_OPS.stackPush.defaultInput)
  
  const ops = mode === 'stack' ? STACK_OPS : mode === 'queue' ? QUEUE_OPS : APPLICATIONS
  const currentOp = ops[opKey]
  
  const genFn = useCallback((inp) => currentOp.fn(inp), [opKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame
  
  function handleOpChange(key) {
    setOpKey(key)
    const newOp = ops[key]
    setInput(newOp.defaultInput)
    playback.reset()
  }
  
  function handleModeChange(newMode) {
    setMode(newMode)
    const newOps = newMode === 'stack' ? STACK_OPS : newMode === 'queue' ? QUEUE_OPS : APPLICATIONS
    const firstKey = Object.keys(newOps)[0]
    setOpKey(firstKey)
    setInput(newOps[firstKey].defaultInput)
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
          
          {/* Mode selector */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 8 }}>
            {['stack', 'queue', 'applications'].map(m => (
              <button key={m} onClick={() => handleModeChange(m)} style={{
                padding: '6px 16px', borderRadius: 7, border: '1px solid',
                borderColor: mode === m ? '#8B5CF6' : 'var(--border)',
                background: mode === m ? 'rgba(139,92,246,0.1)' : 'var(--bg-canvas)',
                color: mode === m ? '#8B5CF6' : 'var(--text-primary)',
                fontSize: 12, fontWeight: mode === m ? 600 : 500, cursor: 'pointer', textTransform: 'capitalize'
              }}>{m}</button>
            ))}
          </div>
          
          {/* Operations toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(ops).map(([key, { label, color }]) => (
              <button key={key} onClick={() => handleOpChange(key)} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid',
                borderColor: opKey === key ? color : 'var(--border)',
                background: opKey === key ? `${color}18` : 'var(--bg-canvas)',
                color: opKey === key ? color : 'var(--text-primary)',
                fontSize: 12, fontWeight: opKey === key ? 600 : 500, cursor: 'pointer'
              }}>{label}</button>
            ))}
          </div>
          
          {/* Description */}
          <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentOp.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{currentOp.description}</span>
          </div>
          
          {/* Visualizer */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {mode === 'stack' && <StackVisualizer frame={frame} input={input} setInput={setInput} opKey={opKey} />}
            {mode === 'queue' && <QueueVisualizer frame={frame} input={input} setInput={setInput} opKey={opKey} />}
            {mode === 'applications' && <ApplicationVisualizer frame={frame} input={input} setInput={setInput} opKey={opKey} playback={playback} />}
          </div>
          
          <PlaybackControls playback={playback} />
        </div>
        
        {/* Info panel */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <InfoPanel op={currentOp} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}

// ─── Stack Visualizer ─────────────────────────────────────────────────────────

function StackVisualizer({ frame, input, setInput, opKey }) {
  const stack = frame?.stack ?? input.stack ?? []
  const highlight = frame?.highlight
  const operation = frame?.operation
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      
      {/* Input controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {(opKey === 'stackPush' || opKey === 'stackSearch') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {opKey === 'stackPush' ? 'Value to Push:' : 'Target:'}
            </label>
            <input
              type="number"
              value={opKey === 'stackPush' ? input.value : input.target}
              onChange={(e) => setInput({ ...input, [opKey === 'stackPush' ? 'value' : 'target']: parseInt(e.target.value) || 0 })}
              style={{
                width: 80,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Stack visualization */}
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, minHeight: 300, justifyContent: 'flex-start', alignItems: 'center' }}>
        {stack.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Stack is empty</div>
        ) : (
          stack.map((value, idx) => {
            const isHighlight = highlight === idx
            const color = isHighlight ? (operation === 'push' ? '#8B5CF6' : operation === 'pop' ? '#EF4444' : '#06B6D4') : '#6366F1'
            const isTop = idx === stack.length - 1
            
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isTop && <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>TOP →</span>}
                <div style={{
                  width: 120,
                  height: 50,
                  borderRadius: 8,
                  background: `${color}18`,
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: color,
                  boxShadow: isHighlight ? `0 0 16px ${color}66` : 'none',
                  transform: isHighlight ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  {value}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 30 }}>[{idx}]</span>
              </div>
            )
          })
        )}
      </div>
      
      {/* Base */}
      <div style={{ width: 140, height: 8, background: 'var(--border)', borderRadius: 4 }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>BOTTOM</span>
    </div>
  )
}

// ─── Queue Visualizer ─────────────────────────────────────────────────────────

function QueueVisualizer({ frame, input, setInput, opKey }) {
  const queue = frame?.queue ?? input.queue ?? []
  const highlight = frame?.highlight
  const operation = frame?.operation
  const frontIdx = frame?.frontIdx ?? 0
  const rearIdx = frame?.rearIdx ?? queue.length - 1
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      
      {/* Input controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {(opKey === 'queueEnqueue' || opKey === 'queueSearch') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {opKey === 'queueEnqueue' ? 'Value to Enqueue:' : 'Target:'}
            </label>
            <input
              type="number"
              value={opKey === 'queueEnqueue' ? input.value : input.target}
              onChange={(e) => setInput({ ...input, [opKey === 'queueEnqueue' ? 'value' : 'target']: parseInt(e.target.value) || 0 })}
              style={{
                width: 80,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          </div>
        )}
      </div>
      
      {/* Labels */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: -12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>FRONT</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>REAR</span>
      </div>
      
      {/* Queue visualization */}
      <div style={{ display: 'flex', gap: 2, minWidth: 500 }}>
        {queue.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Queue is empty</div>
        ) : (
          queue.map((value, idx) => {
            const isHighlight = highlight === idx
            const color = isHighlight ? (operation === 'enqueue' ? '#8B5CF6' : operation === 'dequeue' ? '#EF4444' : '#06B6D4') : '#10B981'
            const isFront = idx === frontIdx
            const isRear = idx === rearIdx
            
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {isFront && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>↓</span>}
                <div style={{
                  width: 80,
                  height: 50,
                  borderRadius: 8,
                  background: `${color}18`,
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: color,
                  boxShadow: isHighlight ? `0 0 16px ${color}66` : 'none',
                  transform: isHighlight ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  {value}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>[{idx}]</span>
                {isRear && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>↑</span>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Application Visualizer ───────────────────────────────────────────────────

function ApplicationVisualizer({ frame, input, setInput, opKey, playback }) {
  if (opKey === 'balancedParentheses') {
    return <BalancedParensVisualizer frame={frame} input={input} setInput={setInput} />
  }
  if (opKey === 'reversePolishNotation') {
    return <RPNVisualizer frame={frame} input={input} setInput={setInput} />
  }
  if (opKey === 'stackUsingQueues') {
    return <StackUsingQueuesVisualizer frame={frame} input={input} setInput={setInput} playback={playback} />
  }
  if (opKey === 'queueUsingStacks') {
    return <QueueUsingStacksVisualizer frame={frame} input={input} setInput={setInput} playback={playback} />
  }
  if (opKey === 'minStack') {
    return <MinStackVisualizer frame={frame} input={input} setInput={setInput} playback={playback} />
  }
  return null
}

// ─── Balanced Parentheses Visualizer ──────────────────────────────────────────

function BalancedParensVisualizer({ frame, input, setInput }) {
  const stack = frame?.stack ?? []
  const chars = frame?.chars ?? []
  const currentIdx = frame?.currentIdx ?? -1
  const operation = frame?.operation
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Expression:</label>
        <input
          type="text"
          value={input.expression}
          onChange={(e) => setInput({ ...input, expression: e.target.value })}
          style={{
            width: 200,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-canvas)',
            color: 'var(--text-primary)',
            fontSize: 16,
            fontFamily: 'JetBrains Mono, monospace',
            textAlign: 'center'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: 4 }}>
        {chars.map((char, idx) => {
          const isCurrent = idx === currentIdx
          const color = isCurrent ? (operation === 'error' ? '#EF4444' : operation === 'match' ? '#10B981' : '#06B6D4') : 'var(--text-muted)'
          
          return (
            <div key={idx} style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: isCurrent ? `${color}18` : 'transparent',
              border: `1px solid ${isCurrent ? color : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontFamily: 'JetBrains Mono, monospace',
              color: isCurrent ? color : 'var(--text-primary)',
              fontWeight: isCurrent ? 700 : 400
            }}>
              {char}
            </div>
          )
        })}
      </div>
      
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>Stack</div>
        <div style={{ display: 'flex', gap: 2, minHeight: 50 }}>
          {stack.length === 0 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11 }}>Empty</div>
          ) : (
            stack.map((char, idx) => (
              <div key={idx} style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid #8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#8B5CF6',
                fontWeight: 600
              }}>
                {char}
              </div>
            ))
          )}
        </div>
      </div>
      
      {operation === 'success' && (
        <div style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 14, fontWeight: 600 }}>
          ✓ Balanced!
        </div>
      )}
      {operation === 'error' && (
        <div style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 14, fontWeight: 600 }}>
          ✗ Not Balanced
        </div>
      )}
    </div>
  )
}

// ─── RPN Visualizer ───────────────────────────────────────────────────────────

function RPNVisualizer({ frame, input, setInput }) {
  const stack = frame?.stack ?? []
  const tokens = frame?.tokens ?? []
  const currentIdx = frame?.currentIdx ?? -1
  const operation = frame?.operation
  const result = frame?.result
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Expression:</label>
        <input
          type="text"
          value={input.expression}
          onChange={(e) => setInput({ ...input, expression: e.target.value })}
          placeholder="e.g. 3 4 + 2 * 7 /"
          style={{
            width: 280,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-canvas)',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            textAlign: 'center'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 600, justifyContent: 'center' }}>
        {tokens.map((token, idx) => {
          const isCurrent = idx === currentIdx
          const isOperator = ['+', '-', '*', '/'].includes(token)
          const color = isCurrent ? (isOperator ? '#F59E0B' : '#06B6D4') : 'var(--text-muted)'
          
          return (
            <div key={idx} style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              background: isCurrent ? `${color}18` : 'transparent',
              border: `2px solid ${isCurrent ? color : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontFamily: 'JetBrains Mono, monospace',
              color: isCurrent ? color : 'var(--text-primary)',
              fontWeight: isCurrent ? 700 : 500
            }}>
              {token}
            </div>
          )
        })}
      </div>
      
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>Stack (Top →)</div>
        <div style={{ display: 'flex', gap: 2, minHeight: 60 }}>
          {stack.length === 0 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 11 }}>Empty</div>
          ) : (
            stack.map((val, idx) => (
              <div key={idx} style={{
                minWidth: 50,
                height: 50,
                padding: '0 8px',
                borderRadius: 6,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#F59E0B',
                fontWeight: 600
              }}>
                {val}
              </div>
            ))
          )}
        </div>
      </div>
      
      {result !== null && operation === 'success' && (
        <div style={{ padding: '14px 24px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
          Result = {result}
        </div>
      )}
      {operation === 'error' && (
        <div style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 14, fontWeight: 600 }}>
          ✗ Invalid Expression
        </div>
      )}
    </div>
  )
}

// ─── Stack Using Queues Visualizer ────────────────────────────────────────────

function StackUsingQueuesVisualizer({ frame, input, setInput, playback }) {
  const q1 = frame?.q1 ?? []
  const q2 = frame?.q2 ?? []
  const operation = frame?.operation
  const value = frame?.value
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 32 }}>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, textAlign: 'center' }}>
        Stack implementation using 2 queues. Push operations maintain LIFO order by transferring elements.
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Queue 1 */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Queue 1 (Main)</div>
          <div style={{ display: 'flex', gap: 2, minWidth: 400, minHeight: 60, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {q1.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Empty</div>
            ) : (
              q1.map((val, idx) => (
                <div key={idx} style={{
                  width: 60,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid #8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#8B5CF6',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Queue 2 */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Queue 2 (Auxiliary)</div>
          <div style={{ display: 'flex', gap: 2, minWidth: 400, minHeight: 60, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {q2.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Empty</div>
            ) : (
              q2.map((val, idx) => (
                <div key={idx} style={{
                  width: 60,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(236,72,153,0.1)',
                  border: '1px solid #EC4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#EC4899',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {value !== null && (
        <div style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontSize: 13, fontWeight: 600 }}>
          {operation === 'push' && `Pushing: ${value}`}
          {operation === 'pop' && `Popped: ${value}`}
          {operation === 'transfer' && `Transferring: ${value}`}
        </div>
      )}
    </div>
  )
}

// ─── Queue Using Stacks Visualizer ────────────────────────────────────────────

function QueueUsingStacksVisualizer({ frame, input, setInput, playback }) {
  const s1 = frame?.s1 ?? []
  const s2 = frame?.s2 ?? []
  const operation = frame?.operation
  const value = frame?.value
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 32 }}>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, textAlign: 'center' }}>
        Queue implementation using 2 stacks. Enqueue to s1, dequeue from s2 (transfer when empty).
      </div>
      
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Stack 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Stack 1 (In)</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, minHeight: 250, minWidth: 100, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', justifyContent: 'flex-start' }}>
            {s1.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 12 }}>Empty</div>
            ) : (
              s1.map((val, idx) => (
                <div key={idx} style={{
                  width: 70,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(236,72,153,0.1)',
                  border: '1px solid #EC4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#EC4899',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TOP ↑</div>
        </div>
        
        {/* Stack 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Stack 2 (Out)</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, minHeight: 250, minWidth: 100, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', justifyContent: 'flex-start' }}>
            {s2.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 12 }}>Empty</div>
            ) : (
              s2.map((val, idx) => (
                <div key={idx} style={{
                  width: 70,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(6,182,212,0.1)',
                  border: '1px solid #06B6D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#06B6D4',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TOP ↑</div>
        </div>
      </div>
      
      {value !== null && (
        <div style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(236,72,153,0.1)', color: '#EC4899', fontSize: 13, fontWeight: 600 }}>
          {operation === 'enqueue' && `Enqueueing: ${value}`}
          {operation === 'dequeue' && `Dequeued: ${value}`}
          {operation === 'transfer' && `Transferring: ${value}`}
        </div>
      )}
    </div>
  )
}

// ─── Min Stack Visualizer ─────────────────────────────────────────────────────

function MinStackVisualizer({ frame, input, setInput, playback }) {
  const stack = frame?.stack ?? []
  const minStack = frame?.minStack ?? []
  const operation = frame?.operation
  const value = frame?.value
  const currentMin = frame?.currentMin
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 32 }}>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, textAlign: 'center' }}>
        Stack with O(1) minimum retrieval. MinStack tracks minimum at each level.
      </div>
      
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Main Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Main Stack</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, minHeight: 280, minWidth: 100, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', justifyContent: 'flex-start' }}>
            {stack.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 12 }}>Empty</div>
            ) : (
              stack.map((val, idx) => (
                <div key={idx} style={{
                  width: 70,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(6,182,212,0.1)',
                  border: '1px solid #06B6D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#06B6D4',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TOP ↑</div>
        </div>
        
        {/* Min Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Min Stack</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, minHeight: 280, minWidth: 100, padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', justifyContent: 'flex-start' }}>
            {minStack.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 12 }}>Empty</div>
            ) : (
              minStack.map((val, idx) => (
                <div key={idx} style={{
                  width: 70,
                  height: 44,
                  borderRadius: 6,
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#10B981',
                  fontWeight: 600
                }}>
                  {val}
                </div>
              ))
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TOP ↑</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {currentMin !== null && (
          <div style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            Current Min: {currentMin}
          </div>
        )}
        {value !== null && (
          <div style={{ padding: '10px 18px', borderRadius: 8, background: 'rgba(6,182,212,0.1)', color: '#06B6D4', fontSize: 13, fontWeight: 600 }}>
            {operation === 'push' && `Pushed: ${value}`}
            {operation === 'pop' && `Popped: ${value}`}
            {operation === 'push-min' && `New min: ${value}`}
            {operation === 'pop-min' && `Removed min: ${value}`}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function InfoPanel({ op, currentFrame }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--bg-surface)' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Zap size={12} color="var(--current)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Step</span>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, minHeight: 52, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderLeft: '3px solid var(--current)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {currentFrame?.label || <span style={{ color: 'var(--text-muted)' }}>Press Play to begin →</span>}
        </div>
      </div>
      
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Code2 size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pseudocode</span>
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-canvas)' }}>
          {op.pseudocode.map((line, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', gap: 12, borderBottom: i < op.pseudocode.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Clock size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--compare)' }}>{op.complexity.time}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Space</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--visited)' }}>{op.complexity.space}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
