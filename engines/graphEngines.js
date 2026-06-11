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