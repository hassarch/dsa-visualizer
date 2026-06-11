let _id = 0
const uid = () => ++_id

function makeList(values) {
  if (!values.length) return null
  const nodes = values.map(v => ({ id: uid(), val: v, next: null }))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1]
  return nodes[0]
}

function listToArray(head) {
  const arr = []
  let cur = head
  while (cur) { arr.push({ id: cur.id, val: cur.val }); cur = cur.next }
  return arr
}

export function* linkedListAppend({ values, newVal }) {
  let head = makeList(values)
  yield { nodes: listToArray(head), highlight: [], pointers: {}, label: `Appending ${newVal} to end` }

  let cur = head, prev = null
  while (cur) {
    yield { nodes: listToArray(head), highlight: [cur.id], pointers: { curr: cur.id }, label: `Traversing: at node ${cur.val}` }
    prev = cur; cur = cur.next
  }

  const newNode = { id: uid(), val: newVal, next: null }
  if (prev) prev.next = newNode
  else head = newNode

  yield { nodes: listToArray(head), highlight: [newNode.id], pointers: {}, label: `Appended ${newVal}` }
}

export function* linkedListReverse({ values }) {
  let head = makeList(values)
  
  // Store all node references before mutation to avoid traversal issues
  const allNodes = []
  let temp = head
  while (temp) {
    allNodes.push(temp)
    temp = temp.next
  }
  
  yield { nodes: allNodes.map(n => ({ id: n.id, val: n.val })), highlight: [], pointers: {}, label: 'Reversing linked list' }

  let prev = null, curr = head

  while (curr) {
    const next = curr.next
    yield {
      nodes: allNodes.map(n => ({ id: n.id, val: n.val })),
      highlight: [curr.id],
      pointers: { prev: prev?.id, curr: curr.id, next: next?.id },
      label: `curr=${curr.val}, saving next pointer`
    }
    curr.next = prev
    prev = curr
    curr = next
    yield {
      nodes: allNodes.map(n => ({ id: n.id, val: n.val })),
      highlight: [prev.id],
      pointers: { prev: prev?.id, curr: curr?.id },
      label: `Reversed pointer at ${prev.val}`
    }
  }

  head = prev
  yield { nodes: listToArray(head), highlight: [], pointers: {}, label: 'List reversed!' }
}

export function* linkedListDeleteNode({ values, target }) {
  let head = makeList(values)
  yield { nodes: listToArray(head), highlight: [], pointers: {}, label: `Deleting node with value ${target}` }

  if (!head) return

  if (head.val === target) {
    yield { nodes: listToArray(head), highlight: [head.id], pointers: { curr: head.id }, label: `Found ${target} at head, removing` }
    head = head.next
    yield { nodes: listToArray(head), highlight: [], pointers: {}, label: `Removed head node` }
    return
  }

  let cur = head
  while (cur.next) {
    yield { nodes: listToArray(head), highlight: [cur.id, cur.next.id], pointers: { curr: cur.id, next: cur.next.id }, label: `Checking ${cur.next.val}` }
    if (cur.next.val === target) {
      const toDelete = cur.next
      yield { nodes: listToArray(head), highlight: [toDelete.id], pointers: { prev: cur.id, curr: toDelete.id }, label: `Found ${target}, rewiring pointer` }
      cur.next = cur.next.next
      yield { nodes: listToArray(head), highlight: [], pointers: {}, label: `Deleted node ${target}` }
      return
    }
    cur = cur.next
  }
  yield { nodes: listToArray(head), highlight: [], pointers: {}, label: `${target} not found in list` }
}