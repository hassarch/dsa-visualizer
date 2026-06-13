'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { bstInsert, bstSearch, inorderTraversal, preorderTraversal, postorderTraversal, levelOrderTraversal, treeHeight } from '../../engines/binaryTreeEngines'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { ExternalLink, Clock, Zap, BookOpen, Code2 } from 'lucide-react'

const ALGOS = {
  bstInsert: {
    label: 'BST Insert',
    fn: bstInsert,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7], insertVal: 5 },
    description: 'Insert a value into BST by comparing at each node',
    color: 'var(--sorted)',
    problems: [
      { id: 701, title: 'Insert into a Binary Search Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/' },
      { id: 700, title: 'Search in a Binary Search Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/' },
    ],
    pseudocode: ['if val < node.val: go left', 'if val > node.val: go right', 'if node is null: insert here'],
    complexity: { time: 'O(h)', space: 'O(h)', note: 'h = height. O(log n) balanced, O(n) worst case' },
  },
  bstSearch: {
    label: 'BST Search',
    fn: bstSearch,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7], searchVal: 6 },
    description: 'Search BST — eliminate half the tree at each step',
    color: 'var(--current)',
    problems: [
      { id: 700, title: 'Search in a Binary Search Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
    ],
    pseudocode: ['if val == node.val: found!', 'if val < node.val: search left', 'if val > node.val: search right', 'if null: not found'],
    complexity: { time: 'O(h)', space: 'O(1)', note: 'O(log n) on balanced BST' },
  },
  inorderTraversal: {
    label: 'Inorder (LNR)',
    fn: inorderTraversal,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7] },
    description: 'Left → Node → Right. Gives sorted order for BST',
    color: 'var(--primary)',
    problems: [
      { id: 94, title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
      { id: 230, title: 'Kth Smallest in BST', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
    ],
    pseudocode: ['inorder(left)', 'visit node', 'inorder(right)'],
    complexity: { time: 'O(n)', space: 'O(h)', note: 'Visits every node exactly once' },
  },
  preorderTraversal: {
    label: 'Preorder (NLR)',
    fn: preorderTraversal,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7] },
    description: 'Node → Left → Right. Used to copy/serialize trees',
    color: 'var(--pointer-a)',
    problems: [
      { id: 144, title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
      { id: 105, title: 'Construct Tree from Preorder+Inorder', difficulty: 'Medium', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
    ],
    pseudocode: ['visit node', 'preorder(left)', 'preorder(right)'],
    complexity: { time: 'O(n)', space: 'O(h)', note: 'Root always appears first in output' },
  },
  postorderTraversal: {
    label: 'Postorder (LRN)',
    fn: postorderTraversal,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7] },
    description: 'Left → Right → Node. Used to delete trees, evaluate expressions',
    color: 'var(--pointer-b)',
    problems: [
      { id: 145, title: 'Binary Tree Postorder Traversal', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
      { id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
    ],
    pseudocode: ['postorder(left)', 'postorder(right)', 'visit node'],
    complexity: { time: 'O(n)', space: 'O(h)', note: 'Root always appears last in output' },
  },
  levelOrderTraversal: {
    label: 'Level Order (BFS)',
    fn: levelOrderTraversal,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7] },
    description: 'Process nodes level by level using a queue',
    color: 'var(--visited)',
    problems: [
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 103, title: 'Zigzag Level Order Traversal', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
      { id: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
    ],
    pseudocode: ['queue = [root]', 'while queue:', '  node = queue.shift()', '  visit node', '  push left, right to queue'],
    complexity: { time: 'O(n)', space: 'O(w)', note: 'w = max width of tree' },
  },
  treeHeight: {
    label: 'Tree Height',
    fn: treeHeight,
    defaultInput: { values: [8, 3, 10, 1, 6, 14, 4, 7] },
    description: 'Compute height recursively: 1 + max(left height, right height)',
    color: 'var(--compare)',
    problems: [
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 110, title: 'Balanced Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/balanced-binary-tree/' },
    ],
    pseudocode: ['height(null) = 0', 'height(node) =', '  1 + max(height(left),', '           height(right))'],
    complexity: { time: 'O(n)', space: 'O(h)', note: 'Must visit every node' },
  },
}

const difficultyColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const difficultyBg = { Easy: 'rgba(16,185,129,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }

export default function BinaryTreePage() {
  const [algoKey, setAlgoKey] = useState('inorderTraversal')
  const [input, setInput] = useState(ALGOS.inorderTraversal.defaultInput)

  const algo = ALGOS[algoKey]
  const genFn = useCallback((inp) => ALGOS[algoKey].fn(inp), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

  function handleAlgoChange(key) {
    setAlgoKey(key)
    setInput(ALGOS[key].defaultInput)
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
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
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

          {/* Input Controls */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Tree values:</span>
              <input
                type="text"
                value={Array.isArray(input.values) ? input.values.join(', ') : ''}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                  setInput({ ...input, values })
                  playback.reset()
                }}
                style={{
                  padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)',
                  background: 'var(--bg-canvas)', color: 'var(--text-primary)',
                  fontSize: 12, fontFamily: 'JetBrains Mono, monospace', width: 200
                }}
                placeholder="8, 3, 10, 1, 6, 14, 4, 7"
              />
            </div>
            
            {(algoKey === 'bstInsert' || algoKey === 'bstSearch') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {algoKey === 'bstInsert' ? 'Insert:' : 'Search:'}
                </span>
                <input
                  type="number"
                  value={algoKey === 'bstInsert' ? (input.insertVal || '') : (input.searchVal || '')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (algoKey === 'bstInsert') {
                      setInput({ ...input, insertVal: isNaN(val) ? '' : val })
                    } else {
                      setInput({ ...input, searchVal: isNaN(val) ? '' : val })
                    }
                    playback.reset()
                  }}
                  style={{
                    padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)',
                    background: 'var(--bg-canvas)', color: 'var(--text-primary)',
                    fontSize: 12, fontFamily: 'JetBrains Mono, monospace', width: 60
                  }}
                  placeholder={algoKey === 'bstInsert' ? '5' : '6'}
                />
              </div>
            )}
            
            <button
              onClick={() => {
                setInput(ALGOS[algoKey].defaultInput)
                playback.reset()
              }}
              style={{
                padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontSize: 11, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              Reset
            </button>
          </div>

          {/* Description */}
          <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: algo.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{algo.description}</span>
          </div>

          {/* Tree canvas */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: 'var(--bg-canvas)' }}>
            <TreeCanvas frame={frame} algoKey={algoKey} algo={algo} />
          </div>

          {/* Visited order */}
          {frame?.visited?.length > 0 && (
            <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                {algoKey === 'levelOrderTraversal' ? 'Level order:' : 'Visited:'}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {frame.visited.map((v, i) => (
                  <div key={i} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, background: `${algo.color}22`, color: algo.color, border: `1px solid ${algo.color}44` }}>
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level order display */}
          {frame?.levels?.length > 0 && (
            <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {frame.levels.map((level, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>L{i}:</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {level.map((v, j) => (
                      <div key={j} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(167,139,250,0.15)', color: 'var(--visited)', border: '1px solid rgba(167,139,250,0.3)' }}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <PlaybackControls playback={playback} />
        </div>

        {/* Info panel */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <TreeInfoPanel algo={algo} currentFrame={frame} algoKey={algoKey} />
        </div>
      </div>
    </div>
  )
}

// ─── Tree Canvas ──────────────────────────────────────────────────────────────

function TreeCanvas({ frame, algoKey, algo }) {
  const nodes = frame?.nodes ?? []
  const positions = frame?.positions ?? {}
  const highlight = new Set(frame?.highlight ?? [])
  const path = new Set(frame?.path ?? [])
  const foundId = frame?.foundId
  const newId = frame?.newId
  const heights = frame?.heights ?? {}
  const currentId = frame?.currentId // For inorder traversal green highlight

  function getNodeColor(node) {
    if (node.id === currentId) return '#10B981' // Green for current visited node (inorder)
    if (node.id === foundId) return 'var(--sorted)'
    if (foundId === -1) return 'var(--swap)'
    if (node.id === newId) return 'var(--sorted)'
    if (node.id === highlight.values().next().value && highlight.size === 1) return algo.color
    if (highlight.has(node.id)) return algo.color
    if (path.has(node.id)) return `${algo.color}88`
    return 'var(--primary)'
  }

  if (nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Press Play to begin
      </div>
    )
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 720 400" style={{ display: 'block' }}>
      <defs>
        <filter id="tree-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tree-new-glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {nodes.map(node => {
        const pos = positions[node.id]
        if (!pos) return null
        
        const isInPath = path.has(node.id)
        const isActiveNode = highlight.has(node.id)

        return (
          <g key={`edges-${node.id}`}>
            {node.leftId && positions[node.leftId] && (
              <line
                x1={pos.x} y1={pos.y}
                x2={positions[node.leftId].x} y2={positions[node.leftId].y}
                stroke={
                  isInPath && path.has(node.leftId) ? algo.color :
                  isActiveNode && highlight.has(node.leftId) ? `${algo.color}88` :
                  'var(--border)'
                }
                strokeWidth={
                  isInPath && path.has(node.leftId) ? 3 :
                  isActiveNode && highlight.has(node.leftId) ? 2.5 :
                  1.5
                }
                style={{ transition: 'all 0.3s ease' }}
                strokeDasharray={isActiveNode && highlight.has(node.leftId) ? '5,5' : 'none'}
              />
            )}
            {node.rightId && positions[node.rightId] && (
              <line
                x1={pos.x} y1={pos.y}
                x2={positions[node.rightId].x} y2={positions[node.rightId].y}
                stroke={
                  isInPath && path.has(node.rightId) ? algo.color :
                  isActiveNode && highlight.has(node.rightId) ? `${algo.color}88` :
                  'var(--border)'
                }
                strokeWidth={
                  isInPath && path.has(node.rightId) ? 3 :
                  isActiveNode && highlight.has(node.rightId) ? 2.5 :
                  1.5
                }
                style={{ transition: 'all 0.3s ease' }}
                strokeDasharray={isActiveNode && highlight.has(node.rightId) ? '5,5' : 'none'}
              />
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const pos = positions[node.id]
        if (!pos) return null
        const color = getNodeColor(node)
        const isActive = highlight.has(node.id)
        const isNew = node.id === newId
        const isInPath = path.has(node.id)
        const isCurrent = node.id === currentId // Green visited node
        const h = heights[node.id]

        return (
          <g key={node.id} opacity={1} style={{ visibility: 'visible' }}>
            {/* Glow for active/new/current nodes */}
            {(isActive || isNew || isCurrent) && (
              <circle cx={pos.x} cy={pos.y} r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} filter="url(#tree-glow)" />
            )}

            {/* Extra glow for newly inserted node */}
            {isNew && (
              <circle cx={pos.x} cy={pos.y} r={32} fill="none" stroke={color} strokeWidth={1} opacity={0.2} filter="url(#tree-new-glow)" />
            )}

            {/* Extra glow for current visited node */}
            {isCurrent && (
              <circle cx={pos.x} cy={pos.y} r={32} fill="none" stroke={color} strokeWidth={1} opacity={0.25} filter="url(#tree-glow)" />
            )}

            {/* Node circle */}
            <circle
              cx={pos.x} cy={pos.y} r={isActive || isNew || isCurrent ? 22 : isInPath ? 21 : 20}
              fill={isCurrent ? 'rgba(16,185,129,0.2)' : `${color}22`} 
              stroke={color}
              strokeWidth={isNew ? 3.5 : isCurrent ? 3.5 : isActive ? 3 : isInPath ? 2.5 : 2}
              opacity={1}
              style={{ transition: 'all 0.3s ease' }}
              strokeDasharray={isActive && !isNew && !isCurrent ? '3,3' : 'none'}
            />

            {/* Value */}
            <text x={pos.x} y={pos.y + 5} textAnchor="middle"
              fill={color} fontSize={14} fontWeight={isActive || isNew || isCurrent ? 800 : 700} fontFamily="JetBrains Mono, monospace"
              opacity={1}
              style={{ transition: 'all 0.3s ease' }}>
              {node.val}
            </text>

            {/* Current visited indicator */}
            {isCurrent && (
              <text x={pos.x} y={pos.y - 30} textAnchor="middle"
                fill={color} fontSize={10} fontWeight="600" fontFamily="JetBrains Mono, monospace">
                ✓ VISIT
              </text>
            )}

            {/* New node indicator */}
            {isNew && !isCurrent && (
              <text x={pos.x} y={pos.y - 30} textAnchor="middle"
                fill={color} fontSize={10} fontWeight="600" fontFamily="JetBrains Mono, monospace">
                NEW
              </text>
            )}

            {/* Height label */}
            {h !== undefined && (
              <text x={pos.x + 26} y={pos.y - 16} textAnchor="middle"
                fill="var(--compare)" fontSize={10} fontFamily="JetBrains Mono, monospace">
                h={h}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function TreeInfoPanel({ algo, currentFrame, algoKey }) {
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
