'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import {
  linkedListAppend, linkedListReverse, linkedListDeleteNode,
  detectCycle, findMiddle, mergeSortedLists,
  removeNthFromEnd, palindromeCheck, intersectionOfLists
} from '../../engines/linkedListEngines'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { ExternalLink, Clock, Database, Zap, BookOpen, Code2, Settings, X, Plus, Trash2, Link2 } from 'lucide-react'

const ALGOS = {
  linkedListReverse: {
    label: 'Reverse',
    fn: linkedListReverse,
    defaultInput: { values: [1, 3, 5, 7, 9] },
    description: 'Reverse a linked list in-place using prev/curr/next pointers',
    color: 'var(--primary)',
    problems: [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 92, title: 'Reverse Linked List II', difficulty: 'Medium', url: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
    ],
    pseudocode: ['prev = null, curr = head', 'while curr:', '  next = curr.next', '  curr.next = prev', '  prev = curr', '  curr = next', 'return prev'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  linkedListAppend: {
    label: 'Append',
    fn: linkedListAppend,
    defaultInput: { values: [1, 3, 5, 7, 9], newVal: 11 },
    description: 'Traverse to the tail and append a new node',
    color: 'var(--sorted)',
    problems: [
      { id: 707, title: 'Design Linked List', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-linked-list/' },
    ],
    pseudocode: ['curr = head', 'while curr.next:', '  curr = curr.next', 'curr.next = new Node(val)'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  linkedListDeleteNode: {
    label: 'Delete',
    fn: linkedListDeleteNode,
    defaultInput: { values: [1, 3, 5, 7, 9], target: 5 },
    description: 'Find and delete a node by value',
    color: 'var(--swap)',
    problems: [
      { id: 237, title: 'Delete Node in Linked List', difficulty: 'Medium', url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/' },
      { id: 203, title: 'Remove Linked List Elements', difficulty: 'Easy', url: 'https://leetcode.com/problems/remove-linked-list-elements/' },
    ],
    pseudocode: ['prev = null, curr = head', 'while curr:', '  if curr.val == target:', '    prev.next = curr.next', '  prev = curr', '  curr = curr.next'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  detectCycle: {
    label: 'Detect Cycle',
    fn: detectCycle,
    defaultInput: { values: [1, 2, 3, 4, 5, 6], cycleAt: 2 },
    description: "Floyd's tortoise and hare — slow moves 1 step, fast moves 2",
    color: 'var(--compare)',
    problems: [
      { id: 141, title: 'Linked List Cycle', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 142, title: 'Linked List Cycle II', difficulty: 'Medium', url: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
    ],
    pseudocode: ['slow = fast = head', 'while fast and fast.next:', '  slow = slow.next', '  fast = fast.next.next', '  if slow == fast: return True', 'return False'],
    complexity: { time: 'O(n)', space: 'O(1)', note: "Floyd's algorithm — no extra memory" },
  },
  findMiddle: {
    label: 'Find Middle',
    fn: findMiddle,
    defaultInput: { values: [1, 2, 3, 4, 5] },
    description: 'Fast & slow pointers — when fast reaches end, slow is at middle',
    color: 'var(--current)',
    problems: [
      { id: 876, title: 'Middle of the Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { id: 234, title: 'Palindrome Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/palindrome-linked-list/' },
    ],
    pseudocode: ['slow = fast = head', 'while fast.next and fast.next.next:', '  slow = slow.next', '  fast = fast.next.next', 'return slow  # middle'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  mergeSortedLists: {
    label: 'Merge Sorted',
    fn: mergeSortedLists,
    defaultInput: { values1: [1, 3, 5, 7], values2: [2, 4, 6, 8] },
    description: 'Merge two sorted lists by comparing heads and advancing the smaller pointer',
    color: 'var(--visited)',
    problems: [
      { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { id: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    ],
    pseudocode: ['p1=l1, p2=l2', 'while p1 and p2:', '  if p1.val <= p2.val:', '    take p1; p1=p1.next', '  else:', '    take p2; p2=p2.next', 'append remaining'],
    complexity: { time: 'O(n+m)', space: 'O(1)' },
  },
  removeNthFromEnd: {
    label: 'Remove Nth',
    fn: removeNthFromEnd,
    defaultInput: { values: [1, 2, 3, 4, 5], n: 2 },
    description: 'Move fast n steps ahead, then move both until fast reaches end',
    color: 'var(--pointer-a)',
    problems: [
      { id: 19, title: 'Remove Nth Node From End', difficulty: 'Medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
    ],
    pseudocode: ['fast = slow = head', 'move fast n steps', 'while fast.next:', '  slow=slow.next', '  fast=fast.next', 'slow.next = slow.next.next'],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'One pass using gap of n between pointers' },
  },
  palindromeCheck: {
    label: 'Palindrome',
    fn: palindromeCheck,
    defaultInput: { values: [1, 2, 3, 2, 1] },
    description: 'Compare values from both ends moving inward',
    color: 'var(--pointer-b)',
    problems: [
      { id: 234, title: 'Palindrome Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/palindrome-linked-list/' },
    ],
    pseudocode: ['left=0, right=n-1', 'while left < right:', '  if vals[left] != vals[right]:', '    return False', '  left++; right--', 'return True'],
    complexity: { time: 'O(n)', space: 'O(n)', note: 'O(1) space: reverse second half in-place' },
  },
  intersectionOfLists: {
    label: 'Intersection',
    fn: intersectionOfLists,
    defaultInput: { values1: [1, 2, 3, 6, 7], values2: [4, 5, 6, 7], intersectAt: 2 },
    description: 'Switch lists when reaching end — both pointers travel equal distance',
    color: 'var(--dp-fill)',
    problems: [
      { id: 160, title: 'Intersection of Two Linked Lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/' },
    ],
    pseudocode: ['pA=headA, pB=headB', 'while pA != pB:', '  pA = pA.next if pA else headB', '  pB = pB.next if pB else headA', 'return pA'],
    complexity: { time: 'O(n+m)', space: 'O(1)', note: 'Both pointers travel same total distance' },
  },
}

const difficultyColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const difficultyBg = { Easy: 'rgba(16,185,129,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }

const NODE_W = 60, NODE_H = 44, GAP = 48

// ─── Visual Node Builder Component ───────────────────────────────────────────

function InputPanel({ algoKey, input, onInputChange, onClose }) {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [nextId, setNextId] = useState(1)
  
  // Initialize from input
  useEffect(() => {
    if (input.values) {
      const initialNodes = input.values.map((val, idx) => ({
        id: idx + 1,
        value: val,
        x: 100 + idx * 100,
        y: 150,
        next: idx < input.values.length - 1 ? idx + 2 : null
      }))
      setNodes(initialNodes)
      setNextId(input.values.length + 1)
    } else {
      setNodes([])
      setNextId(1)
    }
  }, [algoKey])
  
  function addNode() {
    const newNode = {
      id: nextId,
      value: 0,
      x: 100 + nodes.length * 100,
      y: 150,
      next: null
    }
    setNodes([...nodes, newNode])
    setNextId(nextId + 1)
    setSelectedNode(newNode.id)
  }
  
  function deleteNode(id) {
    setNodes(nodes.filter(n => n.id !== id).map(n => ({
      ...n,
      next: n.next === id ? null : n.next
    })))
    if (selectedNode === id) setSelectedNode(null)
    if (connectingFrom === id) setConnectingFrom(null)
  }
  
  function updateNodeValue(id, value) {
    setNodes(nodes.map(n => n.id === id ? { ...n, value: parseInt(value) || 0 } : n))
  }
  
  function updateNodePosition(id, x, y) {
    setNodes(nodes.map(n => n.id === id ? { ...n, x, y } : n))
  }
  
  function connectNodes(fromId, toId) {
    if (fromId === toId) return
    setNodes(nodes.map(n => n.id === fromId ? { ...n, next: toId } : n))
    setConnectingFrom(null)
  }
  
  function disconnectNode(id) {
    setNodes(nodes.map(n => n.id === id ? { ...n, next: null } : n))
  }
  
  function handleApply() {
    // Find head (node with no incoming connections)
    const hasIncoming = new Set(nodes.map(n => n.next).filter(Boolean))
    const head = nodes.find(n => !hasIncoming.has(n.id))
    
    if (!head) {
      alert('Please create a linked list with a clear head node (no incoming connections)')
      return
    }
    
    // Traverse to build values array
    const values = []
    let current = head
    const visited = new Set()
    
    while (current && !visited.has(current.id)) {
      values.push(current.value)
      visited.add(current.id)
      current = nodes.find(n => n.id === current.next)
    }
    
    // Check for cycle
    let cycleAt = -1
    if (current && visited.has(current.id)) {
      const valuesArr = []
      let temp = head
      let idx = 0
      while (temp && idx < values.length) {
        if (temp.id === current.id) {
          cycleAt = valuesArr.length
          break
        }
        valuesArr.push(temp.value)
        temp = nodes.find(n => n.id === temp.next)
        idx++
      }
    }
    
    // Build appropriate input based on algorithm
    let newInput = { ...input, values }
    if (algoKey === 'detectCycle') {
      newInput.cycleAt = cycleAt
    }
    
    onInputChange(newInput)
    onClose()
  }
  
  function handleNodeMouseDown(e, node) {
    if (e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    const startNodeX = node.x
    const startNodeY = node.y
    
    function handleMouseMove(e) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      updateNodePosition(node.id, startNodeX + dx, startNodeY + dy)
    }
    
    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div style={{ height: 400, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={14} color="var(--current)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Visual Node Builder</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
            Click nodes to select • Drag to move • Connect with arrows
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>
      
      {/* Actions */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={addNode} style={{
          padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--bg-canvas)', color: 'var(--text-primary)',
          fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Plus size={14} />
          Add Node
        </button>
        
        {/* Quick templates */}
        <div style={{ marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Quick:</span>
          <button onClick={() => {
            const template = [1, 2, 3, 4, 5].map((val, idx) => ({
              id: idx + 1,
              value: val,
              x: 80 + idx * 100,
              y: 150,
              next: idx < 4 ? idx + 2 : null
            }))
            setNodes(template)
            setNextId(6)
          }} style={{
            padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
            background: 'var(--bg-canvas)', color: 'var(--text-secondary)',
            fontSize: 10, cursor: 'pointer'
          }}>
            Linear 1-5
          </button>
          <button onClick={() => {
            const template = [1, 2, 3, 2, 1].map((val, idx) => ({
              id: idx + 1,
              value: val,
              x: 80 + idx * 100,
              y: 150,
              next: idx < 4 ? idx + 2 : null
            }))
            setNodes(template)
            setNextId(6)
          }} style={{
            padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
            background: 'var(--bg-canvas)', color: 'var(--text-secondary)',
            fontSize: 10, cursor: 'pointer'
          }}>
            Palindrome
          </button>
          <button onClick={() => {
            const template = [1, 2, 3, 4, 5, 6].map((val, idx) => ({
              id: idx + 1,
              value: val,
              x: 80 + idx * 100,
              y: 150,
              next: idx < 5 ? idx + 2 : 3 // Cycle back to node 3
            }))
            setNodes(template)
            setNextId(7)
          }} style={{
            padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
            background: 'var(--bg-canvas)', color: 'var(--text-secondary)',
            fontSize: 10, cursor: 'pointer'
          }}>
            With Cycle
          </button>
        </div>
        
        {selectedNode && (
          <>
            <button onClick={() => deleteNode(selectedNode)} style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'rgba(239,68,68,0.1)', color: 'var(--swap)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Trash2 size={14} />
              Delete
            </button>
            
            <button onClick={() => setConnectingFrom(connectingFrom === selectedNode ? null : selectedNode)} style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: connectingFrom === selectedNode ? 'rgba(6,182,212,0.1)' : 'var(--bg-canvas)',
              color: connectingFrom === selectedNode ? 'var(--current)' : 'var(--text-primary)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Link2 size={14} />
              {connectingFrom === selectedNode ? 'Cancel' : 'Connect →'}
            </button>
            
            {nodes.find(n => n.id === selectedNode)?.next && (
              <button onClick={() => disconnectNode(selectedNode)} style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-canvas)', color: 'var(--text-secondary)',
                fontSize: 11, fontWeight: 500, cursor: 'pointer'
              }}>
                Disconnect
              </button>
            )}
          </>
        )}
        
        <div style={{ flex: 1 }} />
        
        <button onClick={handleApply} style={{
          padding: '6px 16px', borderRadius: 6, border: 'none',
          background: 'var(--current)', color: 'white',
          fontSize: 11, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Apply & Run Algorithm
        </button>
      </div>
      
      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: 'var(--bg-canvas)' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <defs>
            <marker id="builder-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          
          {/* Draw connections */}
          {nodes.map(node => {
            if (!node.next) return null
            const target = nodes.find(n => n.id === node.next)
            if (!target) return null
            return (
              <line
                key={`${node.id}-${node.next}`}
                x1={node.x + 30}
                y1={node.y + 22}
                x2={target.x}
                y2={target.y + 22}
                stroke="var(--primary)"
                strokeWidth={2}
                markerEnd="url(#builder-arrow)"
              />
            )
          })}
          
          {/* Draw temp connection line */}
          {connectingFrom && selectedNode === connectingFrom && (
            <line
              x1={nodes.find(n => n.id === connectingFrom).x + 30}
              y1={nodes.find(n => n.id === connectingFrom).y + 22}
              x2={nodes.find(n => n.id === connectingFrom).x + 80}
              y2={nodes.find(n => n.id === connectingFrom).y + 22}
              stroke="var(--current)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </svg>
        
        {/* Draw nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              cursor: connectingFrom && connectingFrom !== node.id ? 'crosshair' : 'move',
              zIndex: selectedNode === node.id ? 10 : 1
            }}
            onMouseDown={(e) => {
              if (connectingFrom && connectingFrom !== node.id) {
                connectNodes(connectingFrom, node.id)
                e.stopPropagation()
              } else {
                setSelectedNode(node.id)
                handleNodeMouseDown(e, node)
              }
            }}
          >
            <div style={{
              width: 60,
              height: 44,
              borderRadius: 8,
              background: selectedNode === node.id ? 'rgba(6,182,212,0.15)' : 'rgba(139,92,246,0.1)',
              border: `2px solid ${selectedNode === node.id ? 'var(--current)' : 'var(--primary)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: selectedNode === node.id ? '0 0 12px rgba(6,182,212,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}>
              <input
                type="number"
                value={node.value}
                onChange={(e) => {
                  updateNodeValue(node.id, e.target.value)
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(node.id)
                }}
                style={{
                  width: 40,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'center',
                  outline: 'none',
                  pointerEvents: 'auto'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              background: 'var(--bg-surface)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--border)'
            }}>
              #{node.id}
            </div>
          </div>
        ))}
        
        {nodes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13
          }}>
            <Database size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
            <div>Click "Add Node" to start building your linked list</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LinkedListPage() {
  const [algoKey, setAlgoKey] = useState('linkedListReverse')
  const [input, setInput] = useState(ALGOS.linkedListReverse.defaultInput)
  const [showInputPanel, setShowInputPanel] = useState(false)

  const algo = ALGOS[algoKey]
  
  const genFn = useCallback((inp) => ALGOS[algoKey].fn(inp), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame
  
  function handleAlgoChange(key) {
    setAlgoKey(key)
    setInput(ALGOS[key].defaultInput)
    playback.reset()
  }
  
  function handleInputChange(newInput) {
    setInput(newInput)
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
          
          {/* Toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {Object.entries(ALGOS).map(([key, { label, color }]) => (
                <button key={key} onClick={() => handleAlgoChange(key)} style={{
                  padding: '5px 12px', borderRadius: 7, border: '1px solid',
                  borderColor: algoKey === key ? color : 'var(--border)',
                  background: algoKey === key ? `${color}18` : 'transparent',
                  color: algoKey === key ? color : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: algoKey === key ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
                }}>{label}</button>
              ))}
            </div>
            <button onClick={() => setShowInputPanel(!showInputPanel)} style={{
              padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
              background: showInputPanel ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: showInputPanel ? 'var(--current)' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Database size={14} />
              <span>Build List Visually</span>
            </button>
          </div>
          
          {/* Description */}
          <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: algo.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{algo.description}</span>
          </div>
          
          {/* Input Panel */}
          {showInputPanel && <InputPanel algoKey={algoKey} input={input} onInputChange={handleInputChange} onClose={() => setShowInputPanel(false)} />}
          
          {/* Visualizer */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <LinkedListVisualizer algoKey={algoKey} frame={frame} input={input} algo={algo} />
          </div>
          
          <PlaybackControls playback={playback} />
        </div>
        
        {/* Info panel */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <InfoPanel algo={algo} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}

// ─── Visualizer dispatcher ────────────────────────────────────────────────────

function LinkedListVisualizer({ algoKey, frame, input, algo }) {
  if (algoKey === 'mergeSortedLists') return <MergeViz frame={frame} input={input} />
  if (algoKey === 'intersectionOfLists') return <IntersectionViz frame={frame} input={input} />
  if (algoKey === 'palindromeCheck') return <PalindromeViz frame={frame} input={input} />
  if (algoKey === 'detectCycle') return <CycleViz frame={frame} input={input} />
  return <StandardViz frame={frame} input={input} algo={algo} algoKey={algoKey} />
}

// ─── Standard visualizer (reverse, append, delete, findMiddle, removeNth) ────

function StandardViz({ frame, input, algo, algoKey }) {
  const defaultNodes = (input.values ?? []).map((v, i) => ({ id: i, val: v }))
  const nodes = frame?.nodes ?? defaultNodes
  const highlight = new Set(frame?.highlight ?? [])
  const pointers = frame?.pointers ?? {}
  const slowId = frame?.slowId
  const fastId = frame?.fastId
  const middleId = frame?.middleId
  const removeId = frame?.removeId
  const left = frame?.left ?? -1
  const right = frame?.right ?? -1
  const isPalindrome = frame?.isPalindrome
  
  function getNodeColor(node) {
    if (node.id === removeId) return 'var(--swap)'
    if (node.id === middleId) return 'var(--sorted)'
    if (node.id === fastId && node.id === slowId) return 'var(--compare)'
    if (node.id === fastId) return 'var(--pointer-b)'
    if (node.id === slowId) return 'var(--pointer-a)'
    if (highlight.has(node.id)) return 'var(--compare)'
    if (Object.values(pointers).includes(node.id)) return 'var(--current)'
    return 'var(--primary)'
  }
  
  const totalWidth = nodes.length * (NODE_W + GAP)
  const startX = Math.max(40, (800 - totalWidth) / 2)
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      
      {/* Palindrome result */}
      {isPalindrome !== null && isPalindrome !== undefined && (
        <div style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: isPalindrome ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isPalindrome ? 'var(--sorted)' : 'var(--swap)', border: `1px solid ${isPalindrome ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          {isPalindrome ? '✓ Is a palindrome!' : '✗ Not a palindrome'}
        </div>
      )}
      
      {/* Legend for fast/slow */}
      {(algoKey === 'findMiddle' || algoKey === 'removeNthFromEnd') && (
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { color: 'var(--pointer-a)', label: 'slow' },
            { color: 'var(--pointer-b)', label: 'fast' },
            { color: 'var(--sorted)', label: 'middle' },
            { color: 'var(--swap)', label: 'to remove' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
      
      <svg width="100%" viewBox={`0 0 ${Math.max(totalWidth + 140, 600)} 200`} style={{ maxHeight: 200, overflow: 'visible' }}>
        <defs>
          <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <filter id="ll-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        
        {/* Pointer labels above */}
        {Object.entries(pointers).map(([name, nodeId]) => {
          const idx = nodes.findIndex(n => n.id === nodeId)
          if (idx < 0 || nodeId === undefined) return null
          const x = startX + idx * (NODE_W + GAP) + NODE_W / 2
          const colors = { prev: 'var(--pointer-a)', curr: 'var(--current)', next: 'var(--pointer-b)' }
          const color = colors[name] || 'var(--visited)'
          return (
            <g key={name}>
              <line x1={x} y1={50} x2={x} y2={78} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={x} y={44} textAnchor="middle" fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight="600">{name}</text>
            </g>
          )
        })}
        
        {/* Fast/slow pointer labels */}
        {slowId && nodes.map((node, i) => {
          if (node.id !== slowId && node.id !== fastId) return null
          const x = startX + i * (NODE_W + GAP) + NODE_W / 2
          const isSlow = node.id === slowId
          const isFast = node.id === fastId
          const color = isSlow && isFast ? 'var(--compare)' : isFast ? 'var(--pointer-b)' : 'var(--pointer-a)'
          const label = isSlow && isFast ? 'slow=fast' : isFast ? 'fast' : 'slow'
          return (
            <g key={node.id + label}>
              <line x1={x} y1={50} x2={x} y2={78} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={x} y={44} textAnchor="middle" fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight="600">{label}</text>
            </g>
          )
        })}
        
        {/* Palindrome left/right */}
        {left >= 0 && nodes.map((node, i) => {
          const isLeft = i === left, isRight = i === right
          if (!isLeft && !isRight) return null
          const x = startX + i * (NODE_W + GAP) + NODE_W / 2
          const color = isLeft ? 'var(--pointer-a)' : 'var(--pointer-b)'
          return (
            <g key={`lr-${i}`}>
              <line x1={x} y1={50} x2={x} y2={78} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={x} y={44} textAnchor="middle" fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight="600">{isLeft ? 'L' : 'R'}</text>
            </g>
          )
        })}
        
        {/* Nodes */}
        {nodes.map((node, i) => {
          const x = startX + i * (NODE_W + GAP)
          const y = 88
          const color = getNodeColor(node)
          const isActive = highlight.has(node.id) || Object.values(pointers).includes(node.id) || node.id === slowId || node.id === fastId || node.id === middleId || node.id === removeId
          
          return (
            <g key={node.id}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8}
                fill={`${color}18`} stroke={color} strokeWidth={isActive ? 2.5 : 1.5}
                style={{ filter: isActive ? 'url(#ll-glow)' : 'none', transition: 'all 0.2s' }} />
              <line x1={x + NODE_W - 16} y1={y} x2={x + NODE_W - 16} y2={y + NODE_H} stroke={color} strokeWidth={1} opacity={0.4} />
              <text x={x + (NODE_W - 16) / 2} y={y + NODE_H / 2 + 6} textAnchor="middle" fill={color} fontSize={16} fontWeight="700" fontFamily="JetBrains Mono, monospace">{node.val}</text>
              <text x={x + NODE_W / 2} y={y + NODE_H + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono, monospace">[{i}]</text>
              {i < nodes.length - 1 && (
                <line x1={x + NODE_W + 3} y1={y + NODE_H / 2} x2={x + NODE_W + GAP - 3} y2={y + NODE_H / 2} stroke={color} strokeWidth={1.5} markerEnd="url(#ll-arrow)" />
              )}
              {i === nodes.length - 1 && (
                <g>
                  <line x1={x + NODE_W + 3} y1={y + NODE_H / 2} x2={x + NODE_W + 30} y2={y + NODE_H / 2} stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="3 3" />
                  <text x={x + NODE_W + 38} y={y + NODE_H / 2 + 4} fill="var(--text-muted)" fontSize={11} fontFamily="JetBrains Mono, monospace" fontStyle="italic">null</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Cycle detection visualizer ───────────────────────────────────────────────

function CycleViz({ frame, input }) {
  const defaultNodes = (input.values ?? []).map((v, i) => ({ id: i, val: v }))
  const nodes = frame?.nodes ?? defaultNodes
  const slowId = frame?.slowId
  const fastId = frame?.fastId
  const meetId = frame?.meetId
  const cycleAtId = frame?.cycleAtId
  
  const totalWidth = nodes.length * (NODE_W + GAP)
  const startX = Math.max(40, (800 - totalWidth) / 2)
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 24, gap: 24 }}>
      {meetId && (
        <div style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: 'var(--compare)', border: '1px solid rgba(245,158,11,0.3)' }}>
          ⚠ Cycle detected! Pointers met at node {nodes.find(n => n.id === meetId)?.val}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { color: 'var(--pointer-a)', label: 'slow (1 step)' },
          { color: 'var(--pointer-b)', label: 'fast (2 steps)' },
          { color: 'var(--compare)', label: 'meeting point' },
          { color: 'var(--swap)', label: 'cycle start' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
          </div>
        ))}
      </div>
      
      <svg width="100%" viewBox={`0 0 ${Math.max(totalWidth + 140, 600)} 240`} style={{ maxHeight: 240, overflow: 'visible' }}>
        <defs>
          <marker id="cycle-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="var(--swap)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="normal-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <filter id="cy-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        
        {/* Pointer labels */}
        {nodes.map((node, i) => {
          const isSlow = node.id === slowId
          const isFast = node.id === fastId
          if (!isSlow && !isFast) return null
          const x = startX + i * (NODE_W + GAP) + NODE_W / 2
          const color = isSlow && isFast ? 'var(--compare)' : isFast ? 'var(--pointer-b)' : 'var(--pointer-a)'
          const label = isSlow && isFast ? 'meet!' : isFast ? 'fast' : 'slow'
          return (
            <g key={node.id + label}>
              <line x1={x} y1={48} x2={x} y2={76} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={x} y={42} textAnchor="middle" fill={color} fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight="700">{label}</text>
            </g>
          )
        })}
        
        {/* Nodes */}
        {nodes.map((node, i) => {
          const x = startX + i * (NODE_W + GAP)
          const y = 88
          const isMeet = node.id === meetId
          const isCycleStart = node.id === cycleAtId
          const isSlow = node.id === slowId
          const isFast = node.id === fastId
          const color = isMeet ? 'var(--compare)' : isCycleStart ? 'var(--swap)' : isFast && isSlow ? 'var(--compare)' : isFast ? 'var(--pointer-b)' : isSlow ? 'var(--pointer-a)' : 'var(--primary)'
          
          return (
            <g key={node.id}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8}
                fill={`${color}18`} stroke={color} strokeWidth={(isMeet || isCycleStart) ? 2.5 : 1.5}
                style={{ filter: (isMeet || isCycleStart) ? 'url(#cy-glow)' : 'none', transition: 'all 0.2s' }} />
              <text x={x + NODE_W / 2} y={y + NODE_H / 2 + 6} textAnchor="middle" fill={color} fontSize={16} fontWeight="700" fontFamily="JetBrains Mono, monospace">{node.val}</text>
              <text x={x + NODE_W / 2} y={y + NODE_H + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono, monospace">[{i}]</text>
              
              {/* Normal arrow to next */}
              {i < nodes.length - 1 && (
                <line x1={x + NODE_W + 3} y1={y + NODE_H / 2} x2={x + NODE_W + GAP - 3} y2={y + NODE_H / 2} stroke="var(--primary)" strokeWidth={1.5} markerEnd="url(#normal-arrow)" />
              )}
              
              {/* Cycle arrow curves back */}
              {i === nodes.length - 1 && cycleAtId && (() => {
                const cycleIdx = nodes.findIndex(n => n.id === cycleAtId)
                const targetX = startX + cycleIdx * (NODE_W + GAP) + NODE_W / 2
                const fromX = x + NODE_W / 2
                const curveY = y + NODE_H + 40
                return (
                  <path d={`M ${fromX} ${y + NODE_H} Q ${fromX} ${curveY} ${(fromX + targetX) / 2} ${curveY} Q ${targetX} ${curveY} ${targetX} ${y + NODE_H}`}
                    fill="none" stroke="var(--swap)" strokeWidth={1.5} strokeDasharray="5 3" markerEnd="url(#cycle-arrow)" />
                )
              })()}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Merge sorted lists visualizer ───────────────────────────────────────────

function MergeViz({ frame, input }) {
  const list1 = frame?.list1 ?? input.values1.map((v, i) => ({ id: i, val: v }))
  const list2 = frame?.list2 ?? input.values2.map((v, i) => ({ id: i + 100, val: v }))
  const merged = frame?.merged ?? []
  const p1Id = frame?.p1Id
  const p2Id = frame?.p2Id
  
  function renderList(nodes, activeId, label, color) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {nodes.map((node) => {
            const isActive = node.id === activeId
            const c = isActive ? color : 'var(--primary)'
            return (
              <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, background: `${c}18`, border: `2px solid ${c}`, color: c, boxShadow: isActive ? `0 0 12px ${c}55` : 'none', transform: isActive ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.2s' }}>
                  {node.val}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 32, gap: 32 }}>
      {renderList(list1, p1Id, 'List 1', 'var(--pointer-a)')}
      {renderList(list2, p2Id, 'List 2', 'var(--pointer-b)')}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Merged Result</div>
        <div style={{ display: 'flex', gap: 6, minHeight: 56, alignItems: 'center' }}>
          {merged.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Building...</div>
            : merged.map((val, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, background: 'rgba(167,139,250,0.15)', border: '2px solid var(--visited)', color: 'var(--visited)', animation: 'fadeUp 0.3s ease forwards' }}>
                {val}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── Intersection visualizer ──────────────────────────────────────────────────

function IntersectionViz({ frame, input }) {
  const list1 = frame?.list1 ?? []
  const list2 = frame?.list2 ?? []
  const sharedIds = new Set(frame?.sharedIds ?? [])
  const pAId = frame?.pAId
  const pBId = frame?.pBId
  const intersectId = frame?.intersectId
  
  function renderRow(nodes, activeId, label, pointerColor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 48, textAlign: 'right', flexShrink: 0 }}>{label}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {nodes.map((node) => {
            const isActive = node.id === activeId
            const isShared = sharedIds.has(node.id)
            const isIntersect = node.id === intersectId
            const c = isIntersect ? 'var(--sorted)' : isActive ? pointerColor : isShared ? 'var(--compare)' : 'var(--primary)'
            return (
              <div key={node.id} style={{ width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, background: `${c}18`, border: `2px solid ${c}`, color: c, boxShadow: isActive || isIntersect ? `0 0 12px ${c}55` : 'none', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>
                {node.val}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', padding: 32, gap: 24 }}>
      {intersectId && (
        <div style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: 'var(--sorted)', border: '1px solid rgba(16,185,129,0.3)' }}>
          ✓ Intersection at node {list1.find(n => n.id === intersectId)?.val ?? list2.find(n => n.id === intersectId)?.val}
        </div>
      )}
      {renderRow(list1, pAId, 'List A', 'var(--pointer-a)')}
      {renderRow(list2, pBId, 'List B', 'var(--pointer-b)')}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { color: 'var(--pointer-a)', label: 'pA' },
          { color: 'var(--pointer-b)', label: 'pB' },
          { color: 'var(--compare)', label: 'shared nodes' },
          { color: 'var(--sorted)', label: 'intersection' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Palindrome visualizer ────────────────────────────────────────────────────

function PalindromeViz({ frame, input }) {
  return <StandardViz frame={frame} input={input} algo={ALGOS.palindromeCheck} algoKey="palindromeCheck" />
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function InfoPanel({ algo, currentFrame }) {
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
          {algo.pseudocode.map((line, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', gap: 12, borderBottom: i < algo.pseudocode.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Clock size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--compare)' }}>{algo.complexity.time}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Space</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--visited)' }}>{algo.complexity.space}</div>
          </div>
        </div>
        {algo.complexity.note && (
          <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', fontSize: 11, color: 'var(--current)' }}>
            💡 {algo.complexity.note}
          </div>
        )}
      </div>
      
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <BookOpen size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LeetCode Problems</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {algo.problems.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>#{p.id} </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</span>
                </div>
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
