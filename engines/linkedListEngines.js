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
  const seen = new Set()
  while (cur && !seen.has(cur.id)) {
    arr.push({ id: cur.id, val: cur.val, nextId: cur.next?.id ?? null })
    seen.add(cur.id)
    cur = cur.next
  }
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
  yield { nodes: listToArray(head), highlight: [], pointers: {}, label: 'Reversing linked list' }
  let prev = null, curr = head
  while (curr) {
    const next = curr.next
    yield { nodes: listToArray(head), highlight: [curr.id], pointers: { prev: prev?.id, curr: curr.id, next: next?.id }, label: `curr=${curr.val}, saving next pointer` }
    curr.next = prev
    prev = curr
    curr = next
    yield { nodes: listToArray(head), highlight: [prev.id], pointers: { prev: prev?.id, curr: curr?.id }, label: `Reversed pointer at ${prev.val}` }
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

export function* detectCycle({ values, cycleAt }) {
  const nodes = values.map(v => ({ id: uid(), val: v, next: null }))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1]
  if (cycleAt >= 0 && cycleAt < nodes.length) {
    nodes[nodes.length - 1].next = nodes[cycleAt]
  }
  
  const flatNodes = nodes.map(n => ({ id: n.id, val: n.val, nextId: n.next?.id ?? null }))
  let slow = nodes[0], fast = nodes[0]
  let step = 0
  
  yield { nodes: flatNodes, slowId: slow.id, fastId: fast.id, meetId: null, cycleAtId: cycleAt >= 0 ? nodes[cycleAt].id : null, label: `Floyd's cycle detection: slow and fast start at head` }
  
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    step++
    const isMeet = slow.id === fast?.id
    yield {
      nodes: flatNodes,
      slowId: slow.id,
      fastId: fast?.id,
      meetId: isMeet ? slow.id : null,
      cycleAtId: cycleAt >= 0 ? nodes[cycleAt].id : null,
      label: isMeet
        ? `✓ Cycle detected! slow and fast meet at node ${slow.val}`
        : `Step ${step}: slow→${slow.val}, fast→${fast?.val ?? 'null'}`
    }
    if (isMeet) return
  }
  yield { nodes: flatNodes, slowId: null, fastId: null, meetId: null, label: `No cycle detected` }
}

export function* findMiddle({ values }) {
  let head = makeList(values)
  const flatNodes = listToArray(head)
  let slow = head, fast = head, step = 0
  
  yield { nodes: flatNodes, slowId: slow.id, fastId: fast.id, middleId: null, label: `Find middle: slow moves 1 step, fast moves 2 steps` }
  
  while (fast.next && fast.next.next) {
    slow = slow.next
    fast = fast.next.next
    step++
    yield { nodes: flatNodes, slowId: slow.id, fastId: fast.id, middleId: null, label: `Step ${step}: slow→${slow.val}, fast→${fast.val}` }
  }
  
  yield { nodes: flatNodes, slowId: slow.id, fastId: fast.id, middleId: slow.id, label: `✓ Middle node = ${slow.val} (slow pointer stops here)` }
}

export function* mergeSortedLists({ values1, values2 }) {
  const head1 = makeList(values1)
  const head2 = makeList(values2)
  const list1Nodes = listToArray(head1)
  const list2Nodes = listToArray(head2)
  
  yield { list1: list1Nodes, list2: list2Nodes, merged: [], p1Id: head1?.id, p2Id: head2?.id, label: `Merging two sorted lists` }
  
  const mergedVals = []
  let p1 = head1, p2 = head2
  
  while (p1 && p2) {
    yield { list1: list1Nodes, list2: list2Nodes, merged: [...mergedVals], p1Id: p1.id, p2Id: p2.id, label: `Comparing ${p1.val} and ${p2.val}` }
    if (p1.val <= p2.val) {
      mergedVals.push(p1.val)
      yield { list1: list1Nodes, list2: list2Nodes, merged: [...mergedVals], p1Id: p1.id, p2Id: p2.id, label: `${p1.val} ≤ ${p2.val}, take from list1` }
      p1 = p1.next
    } else {
      mergedVals.push(p2.val)
      yield { list1: list1Nodes, list2: list2Nodes, merged: [...mergedVals], p1Id: p1.id, p2Id: p2.id, label: `${p2.val} < ${p1.val}, take from list2` }
      p2 = p2.next
    }
  }
  
  while (p1) {
    mergedVals.push(p1.val)
    yield { list1: list1Nodes, list2: list2Nodes, merged: [...mergedVals], p1Id: p1.id, p2Id: null, label: `Append remaining from list1: ${p1.val}` }
    p1 = p1.next
  }
  while (p2) {
    mergedVals.push(p2.val)
    yield { list1: list1Nodes, list2: list2Nodes, merged: [...mergedVals], p1Id: null, p2Id: p2.id, label: `Append remaining from list2: ${p2.val}` }
    p2 = p2.next
  }
  
  yield { list1: list1Nodes, list2: list2Nodes, merged: mergedVals, p1Id: null, p2Id: null, label: `✓ Merged: [${mergedVals.join(', ')}]` }
}

export function* removeNthFromEnd({ values, n }) {
  let head = makeList(values)
  const flatNodes = listToArray(head)
  
  if (!head) {
    yield { nodes: [], fastId: null, slowId: null, removeId: null, label: `Empty list - nothing to remove` }
    return
  }
  
  if (n <= 0) {
    yield { nodes: flatNodes, fastId: null, slowId: null, removeId: null, label: `Invalid n value: ${n}. Must be positive.` }
    return
  }
  
  if (n > values.length) {
    yield { nodes: flatNodes, fastId: null, slowId: null, removeId: null, label: `n=${n} is larger than list length (${values.length})` }
    return
  }
  
  let fast = head, slow = head
  let step = 0
  
  yield { nodes: flatNodes, fastId: fast.id, slowId: slow.id, removeId: null, label: `Remove ${n}th node from end. Move fast ${n} steps ahead` }
  
  for (let i = 0; i < n; i++) {
    if (!fast) {
      yield { nodes: flatNodes, fastId: null, slowId: slow.id, removeId: null, label: `Fast is null → n is larger than list length` }
      return
    }
    fast = fast.next
    step++
    yield { nodes: flatNodes, fastId: fast?.id, slowId: slow.id, removeId: null, label: `Fast moved to ${fast?.val ?? 'null'} (step ${step})` }
  }
  
  if (!fast) {
    yield { nodes: flatNodes, fastId: null, slowId: slow.id, removeId: slow.id, label: `Fast is null → remove head node ${slow.val}` }
    head = head.next
    yield { nodes: listToArray(head), fastId: null, slowId: null, removeId: null, label: `Removed head. Done.` }
    return
  }
  
  while (fast.next) {
    slow = slow.next
    fast = fast.next
    yield { nodes: flatNodes, fastId: fast.id, slowId: slow.id, removeId: null, label: `Move both: slow→${slow.val}, fast→${fast.val}` }
  }
  
  const toRemove = slow.next
  yield { nodes: flatNodes, fastId: fast.id, slowId: slow.id, removeId: toRemove?.id, label: `slow.next=${toRemove?.val} is the ${n}th from end. Removing...` }
  if (slow.next) slow.next = slow.next.next
  
  yield { nodes: listToArray(head), fastId: null, slowId: null, removeId: null, label: `✓ Removed ${toRemove?.val}. Done.` }
}

export function* palindromeCheck({ values }) {
  let head = makeList(values)
  const flatNodes = listToArray(head)
  const vals = values
  
  yield { nodes: flatNodes, left: 0, right: vals.length - 1, isPalindrome: null, matched: [], label: `Check if linked list is a palindrome` }
  
  let left = 0, right = vals.length - 1
  let result = true
  const matched = []
  
  while (left < right) {
    yield { nodes: flatNodes, left, right, isPalindrome: null, matched: [...matched], label: `Comparing vals[${left}]=${vals[left]} and vals[${right}]=${vals[right]}` }
    
    if (vals[left] !== vals[right]) {
      result = false
      yield { nodes: flatNodes, left, right, isPalindrome: false, matched: [...matched], label: `✗ ${vals[left]} ≠ ${vals[right]}, not a palindrome` }
      return
    }
    
    // Values match! Mark them as matched (green)
    matched.push(left, right)
    yield { nodes: flatNodes, left, right, isPalindrome: null, matched: [...matched], label: `✓ ${vals[left]} === ${vals[right]}, values match! Turning green...` }
    
    // Move pointers inward
    left++
    right--
    yield { nodes: flatNodes, left, right, isPalindrome: null, matched: [...matched], label: `Moving pointers inward: left→${left}, right→${right}` }
  }
  
  yield { nodes: flatNodes, left, right, isPalindrome: true, matched: [...matched], label: `✓ All pairs matched — list IS a palindrome!` }
}

export function* intersectionOfLists({ values1, values2, intersectAt }) {
  const shared = values2.slice(intersectAt).map(v => ({ id: uid(), val: v, next: null }))
  for (let i = 0; i < shared.length - 1; i++) shared[i].next = shared[i + 1]
  
  const list1Unique = values1.slice(0, values1.length - shared.length).map(v => ({ id: uid(), val: v, next: null }))
  const list2Unique = values2.slice(0, intersectAt).map(v => ({ id: uid(), val: v, next: null }))
  
  for (let i = 0; i < list1Unique.length - 1; i++) list1Unique[i].next = list1Unique[i + 1]
  for (let i = 0; i < list2Unique.length - 1; i++) list2Unique[i].next = list2Unique[i + 1]
  
  if (list1Unique.length) list1Unique[list1Unique.length - 1].next = shared[0]
  if (list2Unique.length) list2Unique[list2Unique.length - 1].next = shared[0]
  
  const list1Nodes = [...list1Unique, ...shared].map(n => ({ id: n.id, val: n.val }))
  const list2Nodes = [...list2Unique, ...shared].map(n => ({ id: n.id, val: n.val }))
  const sharedIds = new Set(shared.map(n => n.id))
  const intersectId = shared[0]?.id ?? null
  
  let pA = list1Nodes[0], pB = list2Nodes[0]
  let stepA = 0, stepB = 0
  
  yield { list1: list1Nodes, list2: list2Nodes, sharedIds: [...sharedIds], pAId: pA?.id, pBId: pB?.id, intersectId: null, label: `Two pointer intersection: pA on list1, pB on list2` }
  
  const maxSteps = list1Nodes.length + list2Nodes.length + 2
  
  for (let i = 0; i < maxSteps; i++) {
    if (pA?.id === pB?.id) {
      yield { list1: list1Nodes, list2: list2Nodes, sharedIds: [...sharedIds], pAId: pA?.id, pBId: pB?.id, intersectId: pA?.id, label: `✓ Intersection found at node ${pA?.val}!` }
      return
    }
    
    stepA++; stepB++
    const nextA = list1Nodes[list1Nodes.findIndex(n => n.id === pA?.id) + 1] ?? list2Nodes[0]
    const nextB = list2Nodes[list2Nodes.findIndex(n => n.id === pB?.id) + 1] ?? list1Nodes[0]
    
    yield { list1: list1Nodes, list2: list2Nodes, sharedIds: [...sharedIds], pAId: pA?.id, pBId: pB?.id, intersectId: null, label: `pA→${nextA?.val ?? 'switch'}, pB→${nextB?.val ?? 'switch'}` }
    pA = nextA; pB = nextB
  }
  
  yield { list1: list1Nodes, list2: list2Nodes, sharedIds: [...sharedIds], pAId: null, pBId: null, intersectId: null, label: `No intersection found` }
}
