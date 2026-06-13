let _id = 0
const uid = () => ++_id

function makeNode(val) {
  return { id: uid(), val, left: null, right: null }
}

function cloneTree(node) {
  if (!node) return null
  return { id: node.id, val: node.val, left: cloneTree(node.left), right: cloneTree(node.right) }
}

function treeToNodes(root) {
  if (!root) return []
  const result = []
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    result.push({ id: node.id, val: node.val, leftId: node.left?.id ?? null, rightId: node.right?.id ?? null })
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return result
}

function computePositions(root) {
  if (!root) return {}
  const positions = {}
  const WIDTH = 60
  const HEIGHT = 80

  function assign(node, depth, left, right) {
    if (!node) return
    const x = (left + right) / 2
    const y = depth * HEIGHT + 40
    positions[node.id] = { x, y }
    assign(node.left, depth + 1, left, x)
    assign(node.right, depth + 1, x, right)
  }

  assign(root, 0, 0, 720)
  return positions
}

// BST Insert
export function* bstInsert({ values, insertVal }) {
  let root = null

  // Build initial tree
  for (const v of values) {
    root = insertNode(root, v)
  }

  // Handle empty tree case
  if (!root) {
    root = makeNode(insertVal)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [root.id], path: [root.id], newId: root.id, label: `Inserted ${insertVal} as root (tree was empty)` }
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], path: [], newId: null, label: `✓ Insert complete` }
    return
  }

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], path: [], newId: null, label: `Inserting ${insertVal} into BST` }

  // Now animate the insert
  let curr = root
  const path = []

  while (curr) {
    path.push(curr.id)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], newId: null, label: `Compare ${insertVal} with ${curr.val}` }

    if (insertVal < curr.val) {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], newId: null, label: `${insertVal} < ${curr.val}, go LEFT` }
      if (!curr.left) {
        curr.left = makeNode(insertVal)
        const newPath = [...path, curr.left.id]
        yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.left.id], path: newPath, newId: curr.left.id, label: `Inserted ${insertVal} as left child of ${curr.val}` }
        // Add a brief pause to highlight the newly inserted node
        yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.left.id], path: newPath, newId: curr.left.id, label: `✨ New node ${insertVal} successfully added` }
        break
      }
      curr = curr.left
    } else if (insertVal > curr.val) {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], newId: null, label: `${insertVal} > ${curr.val}, go RIGHT` }
      if (!curr.right) {
        curr.right = makeNode(insertVal)
        const newPath = [...path, curr.right.id]
        yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.right.id], path: newPath, newId: curr.right.id, label: `Inserted ${insertVal} as right child of ${curr.val}` }
        // Add a brief pause to highlight the newly inserted node
        yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.right.id], path: newPath, newId: curr.right.id, label: `✨ New node ${insertVal} successfully added` }
        break
      }
      curr = curr.right
    } else {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], newId: null, label: `${insertVal} already exists in BST` }
      break
    }
  }

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], path: [], newId: null, label: `✓ Insert complete` }
}

function insertNode(root, val) {
  if (!root) return makeNode(val)
  if (val < root.val) root.left = insertNode(root.left, val)
  else if (val > root.val) root.right = insertNode(root.right, val)
  return root
}

// BST Search
export function* bstSearch({ values, searchVal }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], path: [], foundId: null, label: `Searching for ${searchVal} in BST` }

  let curr = root
  const path = []

  while (curr) {
    path.push(curr.id)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], foundId: null, label: `Visiting node ${curr.val}` }

    if (curr.val === searchVal) {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], foundId: curr.id, label: `✓ Found ${searchVal}!` }
      return
    } else if (searchVal < curr.val) {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], foundId: null, label: `${searchVal} < ${curr.val}, go LEFT` }
      curr = curr.left
    } else {
      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [curr.id], path: [...path], foundId: null, label: `${searchVal} > ${curr.val}, go RIGHT` }
      curr = curr.right
    }
  }

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], path: [], foundId: -1, label: `✗ ${searchVal} not found in BST` }
}

// Inorder traversal (Left → Root → Right)
export function* inorderTraversal({ values }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  const visited = []

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [], currentId: null, label: `Inorder: Left → Root → Right (gives sorted order for BST)` }

  function* inorder(node) {
    if (!node) return
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: null, label: `Go LEFT from ${node.val}` }
    yield* inorder(node.left)
    visited.push(node.val)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: node.id, label: `Visit ${node.val} (add to result)` }
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: null, label: `Go RIGHT from ${node.val}` }
    yield* inorder(node.right)
  }

  yield* inorder(root)
  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [...visited], currentId: null, label: `✓ Inorder result: [${visited.join(', ')}]` }
}

// Preorder traversal (Root → Left → Right)
export function* preorderTraversal({ values }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  const visited = []

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [], currentId: null, label: `Preorder: Root → Left → Right` }

  function* preorder(node) {
    if (!node) return
    visited.push(node.val)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: node.id, label: `Visit ${node.val} (Root first)` }
    yield* preorder(node.left)
    yield* preorder(node.right)
  }

  yield* preorder(root)
  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [...visited], currentId: null, label: `✓ Preorder result: [${visited.join(', ')}]` }
}

// Postorder traversal (Left → Right → Root)
export function* postorderTraversal({ values }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  const visited = []

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [], currentId: null, label: `Postorder: Left → Right → Root` }

  function* postorder(node) {
    if (!node) return
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: null, label: `Go LEFT from ${node.val}` }
    yield* postorder(node.left)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: null, label: `Go RIGHT from ${node.val}` }
    yield* postorder(node.right)
    visited.push(node.val)
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], currentId: node.id, label: `Visit ${node.val} (Root last)` }
  }

  yield* postorder(root)
  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [...visited], currentId: null, label: `✓ Postorder result: [${visited.join(', ')}]` }
}

// Level Order (BFS)
export function* levelOrderTraversal({ values }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  const visited = []
  const levels = []

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [], levels: [], queue: [root.val], label: `Level Order (BFS): process level by level` }

  const queue = [root]
  let level = 0

  while (queue.length) {
    const levelSize = queue.length
    const currentLevel = []

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      currentLevel.push(node.val)
      visited.push(node.val)

      yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], visited: [...visited], levels: [...levels, currentLevel], queue: queue.map(n => n.val), label: `Level ${level}: visiting ${node.val}` }

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    levels.push(currentLevel)
    level++
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [...visited], levels: [...levels], queue: queue.map(n => n.val), label: `Level ${level - 1} complete: [${currentLevel.join(', ')}]` }
  }

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], visited: [...visited], levels: [...levels], queue: [], label: `✓ Level order: [${visited.join(', ')}]` }
}

// Tree Height
export function* treeHeight({ values }) {
  let root = null
  for (const v of values) root = insertNode(root, v)

  const heights = {}

  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], heights: {}, label: `Computing tree height (max depth)` }

  function* computeHeight(node) {
    if (!node) return 0
    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], heights: { ...heights }, label: `Computing height of subtree rooted at ${node.val}` }

    const leftH = yield* computeHeight(node.left)
    const rightH = yield* computeHeight(node.right)
    const h = Math.max(leftH, rightH) + 1
    heights[node.id] = h

    yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [node.id], heights: { ...heights }, label: `Height at ${node.val} = max(${leftH}, ${rightH}) + 1 = ${h}` }
    return h
  }

  const h = yield* computeHeight(root)
  yield { nodes: treeToNodes(root), positions: computePositions(root), highlight: [], heights: { ...heights }, label: `✓ Tree height = ${h}` }
}
