/**
 * Custom Arrays Code Visualizer Engine
 * Traces index reads and writes on a proxy array, returning playframes.
 */

export const CODE_TEMPLATES = {
  reverse: `// Template: Reverse an Array
let left = 0;
let right = arr.length - 1;

while (left < right) {
  // Exchanging elements using helper swap(i, j)
  swap(left, right);
  left++;
  right--;
}`,
  findMax: `// Template: Find Maximum Value
let maxIdx = 0;

for (let i = 1; i < arr.length; i++) {
  // Read elements to compare them
  if (arr[i] > arr[maxIdx]) {
    maxIdx = i;
  }
}`,
  rotate: `// Template: Rotate Array Left by 1
if (arr.length > 0) {
  let first = arr[0];
  
  for (let i = 0; i < arr.length - 1; i++) {
    // Shifting elements left
    arr[i] = arr[i + 1];
  }
  
  arr[arr.length - 1] = first;
}`,
  bubbleSort: `// Template: Bubble Sort
let n = arr.length;

for (let i = 0; i < n; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    // Compare and swap if larger
    if (arr[j] > arr[j + 1]) {
      swap(j, j + 1);
    }
  }
}`
}

export function runArrayCode(code, initialArray) {
  const frames = []
  const arrayCopy = [...initialArray]
  
  // Custom Proxy to intercept array accesses
  const handler = {
    get(target, prop) {
      if (prop === 'length') return target.length
      if (prop === 'toString' || prop === 'valueOf') return target[prop]
      
      const index = Number(prop)
      if (!isNaN(index) && index >= 0 && index < target.length) {
        frames.push({
          array: [...target],
          comparing: [index],
          swapping: [],
          label: `Reading element at index ${index} (Value: ${target[index]})`
        })
        return target[index]
      }
      return target[prop]
    },
    set(target, prop, value) {
      const index = Number(prop)
      if (!isNaN(index) && index >= 0) {
        const oldValue = target[index]
        target[index] = value
        frames.push({
          array: [...target],
          comparing: [],
          swapping: [index],
          label: `Writing to index ${index}: changing ${oldValue !== undefined ? oldValue : 'empty'} → ${value}`
        })
        return true
      }
      target[prop] = value
      return true
    }
  }

  const proxy = new Proxy(arrayCopy, handler)

  // Exposed helper function
  const swapHelper = (i, j) => {
    if (i < 0 || i >= proxy.length || j < 0 || j >= proxy.length) {
      throw new Error(`Swap out of bounds: indices (${i}, ${j}) on length ${proxy.length}`)
    }
    const temp = proxy[i]
    proxy[i] = proxy[j]
    proxy[j] = temp
  }

  try {
    // sandboxed evaluation
    const runner = new Function('arr', 'swap', `
      try {
        ${code}
      } catch (err) {
        throw err;
      }
    `)
    runner(proxy, swapHelper)
  } catch (err) {
    frames.push({
      array: [...arrayCopy],
      comparing: [],
      swapping: [],
      label: `Runtime Error: ${err.message}`
    })
  }

  // Final confirmation frame
  frames.push({
    array: [...arrayCopy],
    comparing: [],
    swapping: [],
    label: `Execution finished. Final array state: [${arrayCopy.join(', ')}]`
  })

  return frames
}
