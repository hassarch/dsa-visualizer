export function* bfsTraversal({ nodes, edges, start }) {
  const adj = {}
  nodes.forEach(n => (adj[n] = []))
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })

  const visited = new Set()
  const queue = [start]
  visited.add(start)
  const levels = { [start]: 0 }

  yield { visited: [...visited], queue: [...queue], current: null, edges, nodes, label: `BFS from node ${start}, queue: [${start}]` }

  while (queue.length) {
    const node = queue.shift()
    yield { visited: [...visited], queue: [...queue], current: node, edges, nodes, label: `Processing node ${node}` }

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        levels[neighbor] = levels[node] + 1
        queue.push(neighbor)
        yield { visited: [...visited], queue: [...queue], current: node, edges, nodes, label: `Discovered ${neighbor} (level ${levels[neighbor]}), added to queue` }
      } else {
        yield { visited: [...visited], queue: [...queue], current: node, edges, nodes, label: `${neighbor} already visited, skip` }
      }
    }
  }

  yield { visited: [...visited], queue: [], current: null, edges, nodes, label: `BFS complete. Order: ${[...visited].join(' → ')}` }
}

export function* dfsTraversal({ nodes, edges, start }) {
  const adj = {}
  nodes.forEach(n => (adj[n] = []))
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })

  const visited = new Set()
  const stack = []
  const order = []

  function* dfs(node) {
    visited.add(node)
    stack.push(node)
    order.push(node)
    yield { visited: [...visited], stack: [...stack], current: node, edges, nodes, label: `Visiting ${node}, stack: [${stack.join(', ')}]` }

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        yield { visited: [...visited], stack: [...stack], current: node, edges, nodes, label: `Exploring neighbor ${neighbor} of ${node}` }
        yield* dfs(neighbor)
      } else {
        yield { visited: [...visited], stack: [...stack], current: node, edges, nodes, label: `${neighbor} already visited (backtrack)` }
      }
    }

    stack.pop()
    yield { visited: [...visited], stack: [...stack], current: node, edges, nodes, label: `Backtracking from ${node}` }
  }

  yield* dfs(start)
  yield { visited: [...visited], stack: [], current: null, edges, nodes, label: `DFS complete. Order: ${order.join(' → ')}` }
}

export function* dijkstraShortestPath({ nodes, edges, start, end }) {
  // Build weighted adjacency list (assign weight 1 to all edges for simplicity)
  const adj = {}
  nodes.forEach(n => (adj[n] = []))
  edges.forEach(([u, v]) => { 
    adj[u].push({ node: v, weight: 1 })
    adj[v].push({ node: u, weight: 1 })
  })

  const distances = {}
  const previous = {}
  const visited = new Set()
  const pq = [] // [node, distance]

  nodes.forEach(n => { distances[n] = Infinity; previous[n] = null })
  distances[start] = 0
  pq.push([start, 0])

  yield { visited: [], current: null, distances: {...distances}, previous: {...previous}, path: [], edges, nodes, label: `Initialize: distance to ${start} = 0, all others = ∞` }

  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1])
    const [node, dist] = pq.shift()

    if (visited.has(node)) continue
    visited.add(node)

    yield { visited: [...visited], current: node, distances: {...distances}, previous: {...previous}, path: [], edges, nodes, label: `Visit ${node} (distance = ${dist})` }

    if (node === end) {
      // Reconstruct path
      const path = []
      let curr = end
      while (curr) {
        path.unshift(curr)
        curr = previous[curr]
      }
      yield { visited: [...visited], current: null, distances: {...distances}, previous: {...previous}, path, edges, nodes, label: `✓ Found shortest path: ${path.join(' → ')} (distance = ${distances[end]})` }
      return
    }

    for (const { node: neighbor, weight } of adj[node]) {
      const newDist = distances[node] + weight
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist
        previous[neighbor] = node
        pq.push([neighbor, newDist])
        yield { visited: [...visited], current: node, distances: {...distances}, previous: {...previous}, path: [], edges, nodes, label: `Update: distance to ${neighbor} = ${newDist} via ${node}` }
      }
    }
  }

  yield { visited: [...visited], current: null, distances: {...distances}, previous: {...previous}, path: [], edges, nodes, label: `No path from ${start} to ${end}` }
}

export function* topologicalSort({ nodes, edges }) {
  // Build directed adjacency list
  const adj = {}
  const inDegree = {}
  nodes.forEach(n => { adj[n] = []; inDegree[n] = 0 })
  edges.forEach(([u, v]) => { 
    adj[u].push(v)
    inDegree[v]++
  })

  const queue = []
  const result = []

  // Find all nodes with in-degree 0
  nodes.forEach(n => {
    if (inDegree[n] === 0) queue.push(n)
  })

  yield { queue: [...queue], result: [], current: null, inDegree: {...inDegree}, edges, nodes, label: `Start with nodes having in-degree 0: [${queue.join(', ')}]` }

  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node)

    yield { queue: [...queue], result: [...result], current: node, inDegree: {...inDegree}, edges, nodes, label: `Process ${node}, add to result` }

    for (const neighbor of adj[node]) {
      inDegree[neighbor]--
      yield { queue: [...queue], result: [...result], current: node, inDegree: {...inDegree}, edges, nodes, label: `Reduce in-degree of ${neighbor} to ${inDegree[neighbor]}` }
      
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
        yield { queue: [...queue], result: [...result], current: null, inDegree: {...inDegree}, edges, nodes, label: `${neighbor} now has in-degree 0, add to queue` }
      }
    }
  }

  if (result.length === nodes.length) {
    yield { queue: [], result: [...result], current: null, inDegree: {...inDegree}, edges, nodes, label: `✓ Topological order: ${result.join(' → ')}` }
  } else {
    yield { queue: [], result: [...result], current: null, inDegree: {...inDegree}, edges, nodes, label: `✗ Graph has a cycle! Cannot complete topological sort.` }
  }
}

export function* cycleDetection({ nodes, edges }) {
  const adj = {}
  nodes.forEach(n => (adj[n] = []))
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })

  const visited = new Set()
  const recStack = new Set()
  let cycleFound = false
  let cycleNodes = []

  function* dfs(node, parent) {
    visited.add(node)
    recStack.add(node)

    yield { visited: [...visited], recStack: [...recStack], current: node, cycleNodes: [], edges, nodes, label: `Visit ${node}` }

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        yield { visited: [...visited], recStack: [...recStack], current: node, cycleNodes: [], edges, nodes, label: `Explore ${neighbor} from ${node}` }
        const result = yield* dfs(neighbor, node)
        if (result) return true
      } else if (neighbor !== parent && recStack.has(neighbor)) {
        cycleFound = true
        cycleNodes = [node, neighbor]
        yield { visited: [...visited], recStack: [...recStack], current: node, cycleNodes: [node, neighbor], edges, nodes, label: `✗ Cycle detected: ${node} → ${neighbor}` }
        return true
      }
    }

    recStack.delete(node)
    yield { visited: [...visited], recStack: [...recStack], current: node, cycleNodes: [], edges, nodes, label: `Backtrack from ${node}` }
    return false
  }

  yield { visited: [], recStack: [], current: null, cycleNodes: [], edges, nodes, label: `Starting cycle detection` }

  for (const node of nodes) {
    if (!visited.has(node)) {
      const hasCycle = yield* dfs(node, null)
      if (hasCycle) {
        yield { visited: [...visited], recStack: [], current: null, cycleNodes, edges, nodes, label: `✗ Graph contains a cycle` }
        return
      }
    }
  }

  yield { visited: [...visited], recStack: [], current: null, cycleNodes: [], edges, nodes, label: `✓ No cycles found. Graph is acyclic.` }
}

export function* connectedComponents({ nodes, edges }) {
  const adj = {}
  nodes.forEach(n => (adj[n] = []))
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })

  const visited = new Set()
  const components = []
  let currentComponent = []

  function* bfs(start, componentId) {
    const queue = [start]
    visited.add(start)
    currentComponent.push(start)

    yield { visited: [...visited], current: start, components: [...components], currentComponent: [...currentComponent], edges, nodes, label: `Component ${componentId}: Start BFS from ${start}` }

    while (queue.length > 0) {
      const node = queue.shift()
      yield { visited: [...visited], current: node, components: [...components], currentComponent: [...currentComponent], edges, nodes, label: `Component ${componentId}: Process ${node}` }

      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          currentComponent.push(neighbor)
          queue.push(neighbor)
          yield { visited: [...visited], current: node, components: [...components], currentComponent: [...currentComponent], edges, nodes, label: `Component ${componentId}: Add ${neighbor}` }
        }
      }
    }
  }

  yield { visited: [], current: null, components: [], currentComponent: [], edges, nodes, label: `Finding connected components...` }

  let componentId = 1
  for (const node of nodes) {
    if (!visited.has(node)) {
      currentComponent = []
      yield* bfs(node, componentId)
      components.push([...currentComponent])
      yield { visited: [...visited], current: null, components: [...components], currentComponent: [], edges, nodes, label: `Component ${componentId} complete: [${currentComponent.join(', ')}]` }
      componentId++
    }
  }

  yield { visited: [...visited], current: null, components: [...components], currentComponent: [], edges, nodes, label: `✓ Found ${components.length} connected component(s)` }
}