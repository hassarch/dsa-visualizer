// ─── STACK OPERATIONS ───────────────────────────────────────────────────────

export function* stackPush({ stack, value }) {
  yield { stack: [...stack], operation: null, highlight: null, label: `Initial stack (size: ${stack.length})` }
  
  yield { stack: [...stack], operation: 'push', highlight: null, label: `Pushing ${value} onto stack...` }
  
  const newStack = [...stack, value]
  yield { stack: newStack, operation: 'push', highlight: newStack.length - 1, label: `✓ Pushed ${value}. New top = ${value}` }
}

export function* stackPop({ stack }) {
  if (stack.length === 0) {
    yield { stack: [], operation: null, highlight: null, label: `✗ Stack is empty, cannot pop!` }
    return
  }
  
  yield { stack: [...stack], operation: 'pop', highlight: stack.length - 1, label: `Popping top element (${stack[stack.length - 1]})...` }
  
  const poppedValue = stack[stack.length - 1]
  const newStack = stack.slice(0, -1)
  yield { stack: newStack, operation: 'pop', highlight: null, label: `✓ Popped ${poppedValue}. New top = ${newStack[newStack.length - 1] ?? 'empty'}` }
}

export function* stackPeek({ stack }) {
  if (stack.length === 0) {
    yield { stack: [], operation: null, highlight: null, label: `✗ Stack is empty, nothing to peek!` }
    return
  }
  
  yield { stack: [...stack], operation: 'peek', highlight: stack.length - 1, label: `Peeking at top element...` }
  
  const topValue = stack[stack.length - 1]
  yield { stack: [...stack], operation: 'peek', highlight: stack.length - 1, label: `✓ Top element = ${topValue}` }
}

export function* stackSearch({ stack, target }) {
  yield { stack: [...stack], operation: 'search', highlight: null, label: `Searching for ${target} in stack...` }
  
  for (let i = stack.length - 1; i >= 0; i--) {
    yield { stack: [...stack], operation: 'search', highlight: i, label: `Checking index ${i}: ${stack[i]}` }
    
    if (stack[i] === target) {
      yield { stack: [...stack], operation: 'search', highlight: i, label: `✓ Found ${target} at index ${i} (${stack.length - i} from top)` }
      return
    }
  }
  
  yield { stack: [...stack], operation: 'search', highlight: null, label: `✗ ${target} not found in stack` }
}

// ─── QUEUE OPERATIONS ───────────────────────────────────────────────────────

export function* queueEnqueue({ queue, value }) {
  yield { queue: [...queue], operation: null, frontIdx: 0, rearIdx: queue.length - 1, highlight: null, label: `Initial queue (size: ${queue.length})` }
  
  yield { queue: [...queue], operation: 'enqueue', frontIdx: 0, rearIdx: queue.length - 1, highlight: null, label: `Enqueueing ${value} at rear...` }
  
  const newQueue = [...queue, value]
  yield { queue: newQueue, operation: 'enqueue', frontIdx: 0, rearIdx: newQueue.length - 1, highlight: newQueue.length - 1, label: `✓ Enqueued ${value}. Rear = ${value}` }
}

export function* queueDequeue({ queue }) {
  if (queue.length === 0) {
    yield { queue: [], operation: null, frontIdx: 0, rearIdx: -1, highlight: null, label: `✗ Queue is empty, cannot dequeue!` }
    return
  }
  
  yield { queue: [...queue], operation: 'dequeue', frontIdx: 0, rearIdx: queue.length - 1, highlight: 0, label: `Dequeueing front element (${queue[0]})...` }
  
  const dequeuedValue = queue[0]
  const newQueue = queue.slice(1)
  yield { queue: newQueue, operation: 'dequeue', frontIdx: 0, rearIdx: newQueue.length - 1, highlight: null, label: `✓ Dequeued ${dequeuedValue}. New front = ${newQueue[0] ?? 'empty'}` }
}

export function* queuePeek({ queue }) {
  if (queue.length === 0) {
    yield { queue: [], operation: null, frontIdx: 0, rearIdx: -1, highlight: null, label: `✗ Queue is empty, nothing to peek!` }
    return
  }
  
  yield { queue: [...queue], operation: 'peek', frontIdx: 0, rearIdx: queue.length - 1, highlight: 0, label: `Peeking at front element...` }
  
  const frontValue = queue[0]
  yield { queue: [...queue], operation: 'peek', frontIdx: 0, rearIdx: queue.length - 1, highlight: 0, label: `✓ Front element = ${frontValue}` }
}

export function* queueSearch({ queue, target }) {
  yield { queue: [...queue], operation: 'search', frontIdx: 0, rearIdx: queue.length - 1, highlight: null, label: `Searching for ${target} in queue...` }
  
  for (let i = 0; i < queue.length; i++) {
    yield { queue: [...queue], operation: 'search', frontIdx: 0, rearIdx: queue.length - 1, highlight: i, label: `Checking index ${i}: ${queue[i]}` }
    
    if (queue[i] === target) {
      yield { queue: [...queue], operation: 'search', frontIdx: 0, rearIdx: queue.length - 1, highlight: i, label: `✓ Found ${target} at position ${i}` }
      return
    }
  }
  
  yield { queue: [...queue], operation: 'search', frontIdx: 0, rearIdx: queue.length - 1, highlight: null, label: `✗ ${target} not found in queue` }
}

// ─── BALANCED PARENTHESES (Stack Application) ────────────────────────────────

export function* balancedParentheses({ expression }) {
  const chars = expression.split('')
  const stack = []
  const pairs = { '(': ')', '[': ']', '{': '}' }
  
  yield { stack: [], chars, currentIdx: -1, operation: 'init', label: `Checking: "${expression}"` }
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    yield { stack: [...stack], chars, currentIdx: i, operation: 'check', label: `Examining '${char}'...` }
    
    if (pairs[char]) {
      // Opening bracket
      stack.push(char)
      yield { stack: [...stack], chars, currentIdx: i, operation: 'push', label: `Opening '${char}' → Push to stack` }
    } else if (Object.values(pairs).includes(char)) {
      // Closing bracket
      if (stack.length === 0) {
        yield { stack: [], chars, currentIdx: i, operation: 'error', label: `✗ Closing '${char}' with no matching opening!` }
        return
      }
      
      const top = stack[stack.length - 1]
      if (pairs[top] === char) {
        stack.pop()
        yield { stack: [...stack], chars, currentIdx: i, operation: 'match', label: `✓ Matched '${top}' with '${char}' → Pop` }
      } else {
        yield { stack: [...stack], chars, currentIdx: i, operation: 'error', label: `✗ Mismatched! Expected '${pairs[top]}' but found '${char}'` }
        return
      }
    }
  }
  
  if (stack.length === 0) {
    yield { stack: [], chars, currentIdx: chars.length, operation: 'success', label: `✓ All brackets balanced!` }
  } else {
    yield { stack: [...stack], chars, currentIdx: chars.length, operation: 'error', label: `✗ Unmatched opening brackets remain: ${stack.join(', ')}` }
  }
}

// ─── REVERSE POLISH NOTATION (RPN) ────────────────────────────────────────────

export function* reversePolishNotation({ expression }) {
  const tokens = expression.split(' ')
  const stack = []
  const operators = new Set(['+', '-', '*', '/'])
  
  yield { stack: [], tokens, currentIdx: -1, operation: 'init', result: null, label: `Evaluating RPN: "${expression}"` }
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    yield { stack: [...stack], tokens, currentIdx: i, operation: 'check', result: null, label: `Examining token: ${token}` }
    
    if (operators.has(token)) {
      // Operator: pop two operands
      if (stack.length < 2) {
        yield { stack: [...stack], tokens, currentIdx: i, operation: 'error', result: null, label: `✗ Not enough operands for '${token}'` }
        return
      }
      
      const b = stack.pop()
      const a = stack.pop()
      yield { stack: [...stack], tokens, currentIdx: i, operation: 'pop', result: null, label: `Popped operands: ${a} and ${b}` }
      
      let result
      switch (token) {
        case '+': result = a + b; break
        case '-': result = a - b; break
        case '*': result = a * b; break
        case '/': result = Math.floor(a / b); break
      }
      
      stack.push(result)
      yield { stack: [...stack], tokens, currentIdx: i, operation: 'compute', result: null, label: `Computed: ${a} ${token} ${b} = ${result}` }
    } else {
      // Number: push to stack
      const num = parseInt(token)
      stack.push(num)
      yield { stack: [...stack], tokens, currentIdx: i, operation: 'push', result: null, label: `Pushed ${num} to stack` }
    }
  }
  
  if (stack.length === 1) {
    yield { stack: [...stack], tokens, currentIdx: tokens.length, operation: 'success', result: stack[0], label: `✓ Final result: ${stack[0]}` }
  } else {
    yield { stack: [...stack], tokens, currentIdx: tokens.length, operation: 'error', result: null, label: `✗ Invalid expression: ${stack.length} values remain` }
  }
}

// ─── STACK USING QUEUES ───────────────────────────────────────────────────────

export function* stackUsingQueues({ operations }) {
  let q1 = []
  let q2 = []
  
  yield { q1: [], q2: [], operation: 'init', value: null, label: `Implementing Stack using 2 Queues` }
  
  for (const op of operations) {
    if (op.type === 'push') {
      // Push: Add to q1, then move all old elements from q1 to q2, swap queues
      yield { q1: [...q1], q2: [...q2], operation: 'push', value: op.value, label: `Push ${op.value}: Enqueue to q1` }
      
      q1.push(op.value)
      yield { q1: [...q1], q2: [...q2], operation: 'push', value: op.value, label: `Added ${op.value} to q1` }
      
      // Move all old elements to q2
      while (q1.length > 1) {
        const val = q1.shift()
        q2.push(val)
        yield { q1: [...q1], q2: [...q2], operation: 'transfer', value: val, label: `Transfer ${val} from q1 to q2` }
      }
      
      // Swap q1 and q2
      const temp = q1
      q1 = q2
      q2 = temp
      yield { q1: [...q1], q2: [...q2], operation: 'swap', value: null, label: `Swap queues: q1 is now the main queue` }
      
    } else if (op.type === 'pop') {
      if (q1.length === 0) {
        yield { q1: [...q1], q2: [...q2], operation: 'error', value: null, label: `✗ Stack is empty!` }
      } else {
        const val = q1.shift()
        yield { q1: [...q1], q2: [...q2], operation: 'pop', value: val, label: `Pop: Dequeued ${val} from q1` }
      }
    }
  }
}

// ─── QUEUE USING STACKS ───────────────────────────────────────────────────────

export function* queueUsingStacks({ operations }) {
  let s1 = []
  let s2 = []
  
  yield { s1: [], s2: [], operation: 'init', value: null, label: `Implementing Queue using 2 Stacks` }
  
  for (const op of operations) {
    if (op.type === 'enqueue') {
      // Enqueue: Simply push to s1
      yield { s1: [...s1], s2: [...s2], operation: 'enqueue', value: op.value, label: `Enqueue ${op.value}: Push to s1` }
      
      s1.push(op.value)
      yield { s1: [...s1], s2: [...s2], operation: 'enqueue', value: op.value, label: `Added ${op.value} to s1` }
      
    } else if (op.type === 'dequeue') {
      // Dequeue: If s2 is empty, move all from s1 to s2
      if (s2.length === 0) {
        if (s1.length === 0) {
          yield { s1: [...s1], s2: [...s2], operation: 'error', value: null, label: `✗ Queue is empty!` }
          continue
        }
        
        yield { s1: [...s1], s2: [...s2], operation: 'transfer-start', value: null, label: `s2 is empty, transferring from s1...` }
        
        while (s1.length > 0) {
          const val = s1.pop()
          s2.push(val)
          yield { s1: [...s1], s2: [...s2], operation: 'transfer', value: val, label: `Pop ${val} from s1, push to s2` }
        }
      }
      
      const val = s2.pop()
      yield { s1: [...s1], s2: [...s2], operation: 'dequeue', value: val, label: `Dequeue: Popped ${val} from s2` }
    }
  }
}

// ─── MIN STACK ────────────────────────────────────────────────────────────────

export function* minStack({ operations }) {
  let stack = []
  let minStack = []
  
  yield { stack: [], minStack: [], operation: 'init', value: null, currentMin: null, label: `Min Stack: Tracks minimum in O(1)` }
  
  for (const op of operations) {
    if (op.type === 'push') {
      yield { stack: [...stack], minStack: [...minStack], operation: 'push', value: op.value, currentMin: minStack[minStack.length - 1], label: `Push ${op.value}` }
      
      stack.push(op.value)
      
      // Update min stack
      if (minStack.length === 0 || op.value <= minStack[minStack.length - 1]) {
        minStack.push(op.value)
        yield { stack: [...stack], minStack: [...minStack], operation: 'push-min', value: op.value, currentMin: op.value, label: `${op.value} is new minimum, push to minStack` }
      } else {
        yield { stack: [...stack], minStack: [...minStack], operation: 'push', value: op.value, currentMin: minStack[minStack.length - 1], label: `Pushed ${op.value}, min remains ${minStack[minStack.length - 1]}` }
      }
      
    } else if (op.type === 'pop') {
      if (stack.length === 0) {
        yield { stack: [], minStack: [], operation: 'error', value: null, currentMin: null, label: `✗ Stack is empty!` }
        continue
      }
      
      const val = stack.pop()
      yield { stack: [...stack], minStack: [...minStack], operation: 'pop', value: val, currentMin: minStack[minStack.length - 1], label: `Popped ${val}` }
      
      // Update min stack if popped value was the minimum
      if (minStack.length > 0 && val === minStack[minStack.length - 1]) {
        minStack.pop()
        yield { stack: [...stack], minStack: [...minStack], operation: 'pop-min', value: val, currentMin: minStack[minStack.length - 1] ?? null, label: `${val} was min, removed from minStack. New min = ${minStack[minStack.length - 1] ?? 'none'}` }
      }
      
    } else if (op.type === 'getMin') {
      const min = minStack[minStack.length - 1] ?? null
      yield { stack: [...stack], minStack: [...minStack], operation: 'getMin', value: null, currentMin: min, label: `Get Min: ${min ?? 'Stack is empty'}` }
    }
  }
}
