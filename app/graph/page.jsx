'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { bfsTraversal, dfsTraversal, dijkstraShortestPath, topologicalSort, cycleDetection, connectedComponents } from '../../engines/graphEngines'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'

const ALGOS = {
  bfs: { 
    label: 'BFS — Breadth First', 
    fn: bfsTraversal,
    pseudocode: [
      'queue = [start]',
      'visited = {start}',
      'while queue not empty:',
      '  node = queue.dequeue()',
      '  for each neighbor:',
      '    if not visited:',
      '      mark visited',
      '      queue.enqueue(neighbor)',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Explores graph level by level using a queue',
  },
  dfs: { 
    label: 'DFS — Depth First', 
    fn: dfsTraversal,
    pseudocode: [
      'function dfs(node):',
      '  mark node as visited',
      '  for each neighbor:',
      '    if not visited:',
      '      dfs(neighbor)',
      '  backtrack',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Explores as far as possible along each branch',
  },
  dijkstra: { 
    label: 'Dijkstra — Shortest Path', 
    fn: dijkstraShortestPath,
    pseudocode: [
      'dist[start] = 0',
      'dist[all others] = ∞',
      'pq = [(start, 0)]',
      'while pq not empty:',
      '  node = pq.extractMin()',
      '  for each neighbor:',
      '    if dist[node] + weight < dist[neighbor]:',
      '      dist[neighbor] = dist[node] + weight',
      '      pq.add(neighbor)',
    ],
    complexity: { time: 'O((V+E) log V)', space: 'O(V)' },
    description: 'Finds shortest path using priority queue',
  },
  topological: { 
    label: 'Topological Sort', 
    fn: topologicalSort,
    pseudocode: [
      'compute in-degree for all nodes',
      'queue = [nodes with in-degree 0]',
      'while queue not empty:',
      '  node = queue.dequeue()',
      '  add node to result',
      '  for each neighbor:',
      '    reduce in-degree by 1',
      '    if in-degree = 0:',
      '      queue.enqueue(neighbor)',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Orders nodes respecting dependencies (DAG only)',
  },
  cycle: { 
    label: 'Cycle Detection', 
    fn: cycleDetection,
    pseudocode: [
      'for each node:',
      '  if not visited:',
      '    dfs(node):',
      '      add to recStack',
      '      for each neighbor:',
      '        if neighbor in recStack:',
      '          return CYCLE_FOUND',
      '        dfs(neighbor)',
      '      remove from recStack',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Detects cycles using DFS recursion stack',
  },
  components: { 
    label: 'Connected Components', 
    fn: connectedComponents,
    pseudocode: [
      'components = []',
      'for each node:',
      '  if not visited:',
      '    component = []',
      '    bfs(node):',
      '      add to component',
      '      explore neighbors',
      '    components.add(component)',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    description: 'Finds all disconnected subgraphs',
  },
}

const DEFAULT_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','F'], ['D','F']],
  start: 'A',
  end: 'F',
}

const NODE_POSITIONS = {
  A: { x: 400, y: 80 },
  B: { x: 200, y: 220 },
  C: { x: 600, y: 220 },
  D: { x: 100, y: 380 },
  E: { x: 300, y: 380 },
  F: { x: 500, y: 380 },
}

export default function GraphPage() {
  const [algoKey, setAlgoKey] = useState('bfs')
  const [graphInput, setGraphInput] = useState(DEFAULT_GRAPH)
  const [startNode, setStartNode] = useState('A')
  const [endNode, setEndNode] = useState('F')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editMode, setEditMode] = useState('view') // 'view', 'addNode', 'addEdge'
  const [selectedNodeForEdge, setSelectedNodeForEdge] = useState(null)
  const [customNodes, setCustomNodes] = useState(DEFAULT_GRAPH.nodes)
  const [customEdges, setCustomEdges] = useState(DEFAULT_GRAPH.edges)
  const [customPositions, setCustomPositions] = useState(NODE_POSITIONS)

  const genFn = useCallback((g) => ALGOS[algoKey].fn(g), [algoKey])
  
  // Memoize the input to prevent infinite loop
  const currentInput = useMemo(() => ({
    nodes: customNodes,
    edges: customEdges,
    start: startNode,
    ...(algoKey === 'dijkstra' ? { end: endNode } : {}),
  }), [customNodes, customEdges, startNode, endNode, algoKey])
  
  const playback = usePlayback(genFn, currentInput)
  const frame = playback.currentFrame
  const algo = ALGOS[algoKey]

  // Update graphInput when custom graph changes
  useEffect(() => {
    setGraphInput({ nodes: customNodes, edges: customEdges })
  }, [customNodes, customEdges])

  // Handle adding a new node
  const handleAddNode = (x, y) => {
    if (editMode !== 'addNode') return
    
    // Generate next letter (A, B, C, ...)
    const lastNode = customNodes[customNodes.length - 1] || '@'
    const nextNode = String.fromCharCode(lastNode.charCodeAt(0) + 1)
    
    setCustomNodes([...customNodes, nextNode])
    setCustomPositions({ ...customPositions, [nextNode]: { x, y } })
    setEditMode('view')
    playback.reset()
  }

  // Handle node selection for creating edges
  const handleNodeClick = (node) => {
    if (editMode === 'addEdge') {
      if (!selectedNodeForEdge) {
        setSelectedNodeForEdge(node)
      } else {
        // Create edge between selectedNodeForEdge and node
        if (selectedNodeForEdge !== node) {
          const edgeExists = customEdges.some(
            ([a, b]) => (a === selectedNodeForEdge && b === node) || (a === node && b === selectedNodeForEdge)
          )
          if (!edgeExists) {
            setCustomEdges([...customEdges, [selectedNodeForEdge, node]])
            playback.reset()
          }
        }
        setSelectedNodeForEdge(null)
        setEditMode('view')
      }
    }
  }

  // Delete node
  const handleDeleteNode = (node) => {
    setCustomNodes(customNodes.filter(n => n !== node))
    setCustomEdges(customEdges.filter(([a, b]) => a !== node && b !== node))
    const newPositions = { ...customPositions }
    delete newPositions[node]
    setCustomPositions(newPositions)
    
    // Reset start/end if they were deleted
    if (startNode === node) setStartNode(customNodes[0])
    if (endNode === node) setEndNode(customNodes[0])
    playback.reset()
  }

  // Delete edge
  const handleDeleteEdge = (edge) => {
    setCustomEdges(customEdges.filter(e => !(e[0] === edge[0] && e[1] === edge[1])))
    playback.reset()
  }

  // Reset to default graph
  const handleResetGraph = () => {
    setCustomNodes(DEFAULT_GRAPH.nodes)
    setCustomEdges(DEFAULT_GRAPH.edges)
    setCustomPositions(NODE_POSITIONS)
    setStartNode('A')
    setEndNode('F')
    setEditMode('view')
    setSelectedNodeForEdge(null)
    playback.reset()
  }

  const visited = new Set(frame?.visited ?? [])
  const queue = frame?.queue ?? []
  const stack = frame?.stack ?? []
  const current = frame?.current
  const frontier = new Set([...queue, ...stack])
  const path = frame?.path ?? [] // For Dijkstra shortest path
  const pathSet = new Set(path)
  const cycleNodes = new Set(frame?.cycleNodes ?? [])
  const recStack = new Set(frame?.recStack ?? [])
  const currentComponent = frame?.currentComponent ?? []
  const distances = frame?.distances ?? {}

  // Debug logging
  useEffect(() => {
    console.log('=== Frame Update ===')
    console.log('Frame:', frame)
    console.log('Visited:', [...visited])
    console.log('Current:', current)
    console.log('Queue:', queue)
    console.log('Stack:', stack)
    console.log('Frontier:', [...frontier])
    console.log('Path:', path)
    console.log('Cycle:', [...cycleNodes])
  }, [frame, visited, current, queue, stack, frontier, path, cycleNodes])

  function getNodeColor(node) {
    if (cycleNodes.has(node)) return '#EF4444' // Red for cycle nodes
    if (node === current) return '#FBBF24' // Current (Amber)
    if (pathSet.has(node)) return '#10B981' // Green for shortest path
    if (frontier.has(node) && !visited.has(node)) return '#38BDF8' // In queue/stack (Cyan)
    if (visited.has(node)) return '#34D399' // Visited (Emerald)
    if (recStack.has(node)) return '#F97316' // Orange for recursion stack
    return '#71717a' // Default (lighter grey for better visibility)
  }

  function getEdgeColor(u, v) {
    if (cycleNodes.has(u) && cycleNodes.has(v)) return '#EF4444'
    if (pathSet.has(u) && pathSet.has(v)) return '#10B981'
    if ((u === current && visited.has(v)) || (v === current && visited.has(u))) return '#FBBF24'
    if (visited.has(u) && visited.has(v)) return '#34D399'
    return '#1F1F1F'
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

  const dataStructure = algoKey === 'bfs' ? queue : stack

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000000' }}>
      <Sidebar />
      
      {/* Dashboard container */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: 24,
        padding: '24px',
        overflow: 'hidden'
      }}>
        
        {/* Main visualizer column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          gap: 16
        }}>
          
          {/* Toolbar */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #1F1F1F',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(ALGOS).map(([key, { label }]) => (
                <button 
                  key={key} 
                  onClick={() => { setAlgoKey(key); playback.reset() }} 
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: algoKey === key ? '#2e2e30' : '#1f1f1f',
                    background: algoKey === key ? '#1c1c1e' : 'transparent',
                    color: algoKey === key ? '#ffffff' : '#a1a1aa',
                    fontSize: '12px',
                    fontWeight: algoKey === key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                Start: 
                <select 
                  value={startNode} 
                  onChange={(e) => { setStartNode(e.target.value); playback.reset() }}
                  style={{
                    marginLeft: 6,
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #1F1F1F',
                    background: '#050505',
                    color: '#ffffff',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {customNodes.map(node => (
                    <option key={node} value={node}>{node}</option>
                  ))}
                </select>
              </div>
              
              {algoKey === 'dijkstra' && (
                <div style={{ fontSize: '11px', color: '#71717a' }}>
                  End: 
                  <select 
                    value={endNode} 
                    onChange={(e) => { setEndNode(e.target.value); playback.reset() }}
                    style={{
                      marginLeft: 6,
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: '1px solid #1F1F1F',
                      background: '#050505',
                      color: '#ffffff',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {customNodes.map(node => (
                      <option key={node} value={node}>{node}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setIsBuilderOpen(!isBuilderOpen)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: isBuilderOpen ? '#10B981' : '#1F1F1F',
                  background: isBuilderOpen ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isBuilderOpen ? '#10B981' : '#a1a1aa',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isBuilderOpen ? '✓ Builder' : '⚙ Build Graph'}
              </button>
            </div>
          </div>

          {/* Graph Builder Panel */}
          {isBuilderOpen && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #1F1F1F',
              background: '#050505',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  Graph Builder
                </div>
                <button
                  onClick={handleResetGraph}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #EF4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset to Default
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setEditMode(editMode === 'addNode' ? 'view' : 'addNode')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: editMode === 'addNode' ? '#10B981' : '#1F1F1F',
                    background: editMode === 'addNode' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: editMode === 'addNode' ? '#10B981' : '#a1a1aa',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editMode === 'addNode' ? '✓ Adding Node' : '+ Add Node'}
                </button>

                <button
                  onClick={() => {
                    setEditMode(editMode === 'addEdge' ? 'view' : 'addEdge')
                    setSelectedNodeForEdge(null)
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: editMode === 'addEdge' ? '#38BDF8' : '#1F1F1F',
                    background: editMode === 'addEdge' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    color: editMode === 'addEdge' ? '#38BDF8' : '#a1a1aa',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editMode === 'addEdge' ? (selectedNodeForEdge ? `Select 2nd node` : '✓ Select 1st node') : '+ Add Edge'}
                </button>
              </div>

              {editMode === 'addNode' && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '11px',
                  color: '#10B981',
                }}>
                  Click anywhere on the graph canvas to add a node
                </div>
              )}

              {editMode === 'addEdge' && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(56, 189, 248, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: '11px',
                  color: '#38BDF8',
                }}>
                  {selectedNodeForEdge 
                    ? `Selected: ${selectedNodeForEdge}. Now click another node to connect.`
                    : 'Click a node to start creating an edge'}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                  Nodes ({customNodes.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {customNodes.map(node => (
                    <div key={node} style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: '#121212',
                      border: '1px solid #1F1F1F',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      {node}
                      <button
                        onClick={() => handleDeleteNode(node)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '10px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', marginTop: 8 }}>
                  Edges ({customEdges.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {customEdges.map((edge, i) => (
                    <div key={i} style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: '#121212',
                      border: '1px solid #1F1F1F',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#a1a1aa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      {edge[0]} — {edge[1]}
                      <button
                        onClick={() => handleDeleteEdge(edge)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visualizer Card */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 24px 24px 24px',
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            {/* Split Graph & Stack/Queue Sidepanel */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', marginBottom: 40 }}>
              
              {/* Graph SVG canvas */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 800 480" 
                  style={{ display: 'block', maxWidth: '1400px', maxHeight: '600px', cursor: editMode === 'addNode' ? 'crosshair' : 'default' }}
                  onClick={(e) => {
                    if (editMode === 'addNode') {
                      const svg = e.currentTarget
                      const rect = svg.getBoundingClientRect()
                      const viewBox = svg.viewBox.baseVal
                      const scaleX = viewBox.width / rect.width
                      const scaleY = viewBox.height / rect.height
                      const x = (e.clientX - rect.left) * scaleX
                      const y = (e.clientY - rect.top) * scaleY
                      handleAddNode(x, y)
                    }
                  }}
                >
                  <defs>
                    <filter id="node-glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* Edges */}
                  {customEdges.map(([u, v], idx) => {
                    const pu = customPositions[u], pv = customPositions[v]
                    if (!pu || !pv) return null
                    const edgeColor = getEdgeColor(u, v)
                    const isActive = edgeColor !== '#1F1F1F'
                    return (
                      <line key={`${u}-${v}-${idx}`}
                        x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y}
                        stroke={edgeColor}
                        strokeWidth={isActive ? 3 : 2}
                        opacity={isActive ? 1 : 0.3}
                        style={{ transition: 'all 0.4s' }}
                      />
                    )
                  })}

                  {/* Nodes */}
                  {customNodes.map(node => {
                    const pos = customPositions[node]
                    if (!pos) return null
                    const color = getNodeColor(node)
                    const isActive = node === current
                    const isVisited = visited.has(node)
                    const isFrontier = frontier.has(node) && !isVisited
                    const dist = distances[node]
                    const showDistance = algoKey === 'dijkstra' && dist !== undefined
                    const isSelected = selectedNodeForEdge === node

                    return (
                      <g 
                        key={node} 
                        style={{ opacity: 1, cursor: editMode === 'addEdge' ? 'pointer' : 'default' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNodeClick(node)
                        }}
                      >
                        {/* Glow ring for active */}
                        {isActive && (
                          <circle cx={pos.x} cy={pos.y} r={48}
                            fill="none" stroke={color} strokeWidth={1.5} opacity={0.3}
                            filter="url(#node-glow)" />
                        )}

                        {/* Selection ring for edge creation */}
                        {isSelected && (
                          <circle cx={pos.x} cy={pos.y} r={42}
                            fill="none" stroke="#38BDF8" strokeWidth={2} opacity={0.6}
                            strokeDasharray="5,5" />
                        )}

                        {/* Node circle */}
                        <circle cx={pos.x} cy={pos.y} r={isActive ? 38 : 32}
                          fill={isActive ? 'rgba(251,191,36,0.2)' : isFrontier ? 'rgba(56,189,248,0.15)' : isVisited ? 'rgba(52,211,153,0.2)' : 'rgba(113,113,122,0.1)'}
                          stroke={color}
                          strokeWidth={isActive ? 3.5 : isVisited || isFrontier ? 2.5 : 2}
                          opacity={1}
                          style={{ transition: 'all 0.3s', filter: isActive ? 'url(#node-glow)' : 'none' }}
                        />

                        {/* Node label */}
                        <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                          fill={color} 
                          fontSize={isActive ? '22px' : '18px'} 
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                          opacity={1}
                          style={{ transition: 'all 0.3s', pointerEvents: 'none' }}>
                          {node}
                        </text>

                        {/* Distance label for Dijkstra */}
                        {showDistance && (
                          <text x={pos.x} y={pos.y - 35} textAnchor="middle"
                            fill={dist === Infinity ? '#71717a' : '#10B981'} 
                            fontSize="11px" 
                            fontWeight="600"
                            fontFamily="JetBrains Mono, monospace"
                            style={{ pointerEvents: 'none' }}>
                            {dist === Infinity ? '∞' : `d=${dist}`}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Stack/Queue and Visited Sidepanel */}
              <div style={{ 
                width: 180, 
                borderLeft: '1px solid #1F1F1F', 
                padding: '0 0 0 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 24, 
                overflowY: 'auto' 
              }}>
                {/* Data Structure Card */}
                {(algoKey === 'bfs' || algoKey === 'dfs') && (
                  <div>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: 600, 
                      letterSpacing: '0.08em', 
                      color: '#71717a', 
                      textTransform: 'uppercase', 
                      marginBottom: 12 
                    }}>
                      {algoKey === 'bfs' ? 'Queue (FIFO)' : 'Stack (LIFO)'}
                    </div>
                    {dataStructure.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#52525b', fontStyle: 'italic' }}>Empty</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {dataStructure.map((n, i) => (
                          <div key={i} style={{
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            textAlign: 'center',
                            fontSize: '13px', 
                            fontFamily: 'JetBrains Mono, monospace', 
                            fontWeight: 700,
                            background: i === 0 ? 'rgba(255, 255, 255, 0.05)' : '#121212',
                            border: `1px solid ${i === 0 ? '#ffffff' : '#1F1F1F'}`,
                            color: i === 0 ? '#ffffff' : '#a1a1aa',
                            transition: 'all 0.2s'
                          }}>
                            {n}
                            {i === 0 && <span style={{ fontSize: '9px', marginLeft: 6, opacity: 0.5, color: '#71717a' }}>next</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Shortest Path for Dijkstra */}
                {algoKey === 'dijkstra' && path.length > 0 && (
                  <div>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: 600, 
                      letterSpacing: '0.08em', 
                      color: '#71717a', 
                      textTransform: 'uppercase', 
                      marginBottom: 12 
                    }}>
                      Shortest Path
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '13px', 
                      fontFamily: 'JetBrains Mono, monospace', 
                      fontWeight: 700,
                      color: '#10B981'
                    }}>
                      {path.join(' → ')}
                    </div>
                  </div>
                )}

                {/* Cycle Detection */}
                {algoKey === 'cycle' && cycleNodes.size > 0 && (
                  <div>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: 600, 
                      letterSpacing: '0.08em', 
                      color: '#71717a', 
                      textTransform: 'uppercase', 
                      marginBottom: 12 
                    }}>
                      Cycle Found
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '13px', 
                      fontFamily: 'JetBrains Mono, monospace', 
                      fontWeight: 700,
                      color: '#EF4444'
                    }}>
                      {[...cycleNodes].join(' ↔ ')}
                    </div>
                  </div>
                )}

                {/* Visited Card */}
                <div>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    letterSpacing: '0.08em', 
                    color: '#71717a', 
                    textTransform: 'uppercase', 
                    marginBottom: 12 
                  }}>
                    Visited ({visited.size})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...visited].map((n) => (
                      <div key={n} style={{
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '12px', 
                        fontFamily: 'JetBrains Mono, monospace', 
                        fontWeight: 700,
                        background: 'rgba(52, 211, 153, 0.08)', 
                        border: '1.5px solid #34D399', 
                        color: '#34D399',
                        animation: 'fadeUp 0.3s ease forwards'
                      }}>
                        {n}
                      </div>
                    ))}
                  </div>
                  {visited.size > 0 && (
                    <div style={{ 
                      marginTop: 12, 
                      fontSize: '11px', 
                      color: '#52525b', 
                      fontFamily: 'JetBrains Mono, monospace',
                      lineHeight: 1.4 
                    }}>
                      {[...visited].join(' → ')}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Playback Controls */}
            <PlaybackControls playback={playback} />
          </div>

        </div>

        {/* Right Info Widgets Column */}
        <div style={{
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0,
          paddingRight: 4
        }}>
          <GraphInfoPanel algo={algo} currentFrame={frame} />
        </div>

      </div>
    </div>
  )
}

// Custom Info Panel for Graph Algorithms
function GraphInfoPanel({ algo, currentFrame }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #1F1F1F',
      background: '#050505',
    }}>
      
      {/* Current Step */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Current Step
        </div>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(6,182,212,0.05)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderLeft: '3px solid #38BDF8',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#ffffff',
          lineHeight: 1.5,
          minHeight: 52,
        }}>
          {currentFrame?.label || 'Press Play to begin →'}
        </div>
      </div>

      {/* Description */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Algorithm
        </div>
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: '#000000',
          border: '1px solid #1F1F1F',
          fontSize: '12px',
          color: '#a1a1aa',
          lineHeight: 1.5,
        }}>
          {algo.description}
        </div>
      </div>

      {/* Pseudocode */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Pseudocode
        </div>
        <div style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #1F1F1F',
          background: '#000000',
        }}>
          {algo.pseudocode.map((line, i) => (
            <div
              key={i}
              style={{
                padding: '6px 12px',
                display: 'flex',
                gap: 12,
                borderBottom: i < algo.pseudocode.length - 1 ? '1px solid #1F1F1F' : 'none',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <span style={{ color: '#52525b', minWidth: 16, textAlign: 'right' }}>
                {i + 1}
              </span>
              <span style={{ color: '#a1a1aa', whiteSpace: 'pre', flex: 1 }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Complexity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#000000',
            border: '1px solid #1F1F1F',
          }}>
            <div style={{ fontSize: '10px', color: '#71717a', marginBottom: 4 }}>
              Time
            </div>
            <div style={{
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#FBBF24',
            }}>
              {algo.complexity.time}
            </div>
          </div>
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#000000',
            border: '1px solid #1F1F1F',
          }}>
            <div style={{ fontSize: '10px', color: '#71717a', marginBottom: 4 }}>
              Space
            </div>
            <div style={{
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              color: '#8B5CF6',
            }}>
              {algo.complexity.space}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: '#71717a',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Color Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#FBBF24',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Current</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#34D399',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Visited</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#38BDF8',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Frontier (Queue/Stack)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#10B981',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Shortest Path</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#EF4444',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Cycle Detected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#F97316',
            }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Recursion Stack</span>
          </div>
        </div>
      </div>

    </div>
  )
}