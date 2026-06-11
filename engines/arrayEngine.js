export const DEFAULT_TEMPLATES = {
  javascript: `// Write your custom JavaScript array code here...
// You can access elements via arr[index] and swap via swap(index1, index2)

let i = 0, j = arr.length - 1;
while (i < j) {
  swap(i, j);
  i++;
  j--;
}`,
  python: `# Write your custom Python array code here...
# You can access elements via arr[index] and swap via swap(index1, index2)

left = 0
right = len(arr) - 1
while left < right:
    swap(left, right)
    left += 1
    right -= 1`,
  java: `// Write your custom Java array code here...
// You can access elements via arr[index] and swap via swap(index1, index2)

int left = 0;
int right = arr.length - 1;
while (left < right) {
    swap(left, right);
    left++;
    right--;
}`
}

function transpilePython(code) {
  const lines = code.split('\n')
  let jsCode = ''
  const indentStack = []
  
  for (let line of lines) {
    const trimmed = line.trim()
    
    // Ignore empty lines and comment lines for indentation/blocks
    if (!trimmed || trimmed.startsWith('#')) {
      const processedComment = trimmed.startsWith('#') ? '//' + trimmed.slice(1) : ''
      jsCode += ' '.repeat(line.length - line.trimStart().length) + processedComment + '\n'
      continue
    }
    
    const indent = line.length - line.trimStart().length
    
    // Close blocks when indentation decreases
    while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop()
      jsCode += ' '.repeat(indent) + '}\n'
    }
    
    let processed = trimmed
    
    // Convert basic Python operators and booleans
    processed = processed.replace(/\band\b/g, '&&')
    processed = processed.replace(/\bor\b/g, '||')
    processed = processed.replace(/\bnot\b/g, '!')
    processed = processed.replace(/\bTrue\b/g, 'true')
    processed = processed.replace(/\bFalse\b/g, 'false')
    processed = processed.replace(/\bNone\b/g, 'null')
    
    // Replace len(arr) with arr.length
    processed = processed.replace(/len\((\w+)\)/g, '$1.length')
    
    // Replace append and insert
    processed = processed.replace(/\.append\(/g, '.push(')
    processed = processed.replace(/\.insert\(\s*([^,]+)\s*,\s*([^)]+)\)/g, '.splice($1, 0, $2)')
    
    // Replace print
    processed = processed.replace(/\bprint\(/g, 'console.log(')
    
    // Replace self.swap with swap
    processed = processed.replace(/\bself\.swap\(/g, 'swap(')
    
    // Replace self.method call with method call
    processed = processed.replace(/\bself\.(\w+)\(/g, '$1(')
    processed = processed.replace(/\bself\./g, '')
    
    // Convert Python swap: arr[i], arr[j] = arr[j], arr[i] -> swap(i, j)
    processed = processed.replace(/(\w+)\[([^\]]+)\]\s*,\s*\1\[([^\]]+)\]\s*=\s*\1\[\3\]\s*,\s*\1\[\2\]/g, 'swap($2, $3)')
    
    // Convert floor division: a // b -> Math.floor(a / b)
    processed = processed.replace(/([A-Za-z0-9_().+\-*\/ ]+)\s*\/\/\s*([A-Za-z0-9_().+\-*\/ ]+)/g, 'Math.floor($1 / $2)')
    
    // Replace int() with Math.floor()
    processed = processed.replace(/\bint\(/g, 'Math.floor(')
    
    // Strip class Solution:
    if (processed.startsWith('class ')) {
      processed = '// ' + processed
    } else if (processed.endsWith(':')) {
      processed = processed.slice(0, -1).trim() // Remove colon
      
      if (processed.startsWith('def ')) {
        // Strip self from parameter list
        processed = processed.replace(/def\s+(\w+)\(\s*self\s*,\s*/g, 'def $1(')
        processed = processed.replace(/def\s+(\w+)\(\s*self\s*\)/g, 'def $1()')
        
        processed = processed.replace('def ', 'function ') + ' {'
      } else if (processed.startsWith('for ')) {
        const forMatch = processed.match(/for\s+(\w+)\s+in\s+range\((.*)\)/)
        const forOfMatch = processed.match(/for\s+(\w+)\s+in\s+(\w+)/)
        
        if (forMatch) {
          const varName = forMatch[1]
          const rangeArgs = forMatch[2].split(',').map(s => s.trim())
          if (rangeArgs.length === 1) {
            processed = `for (let ${varName} = 0; ${varName} < ${rangeArgs[0]}; ${varName}++) {`
          } else if (rangeArgs.length === 2) {
            processed = `for (let ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName}++) {`
          } else if (rangeArgs.length === 3) {
            const step = rangeArgs[2]
            const isNegative = step.startsWith('-') || parseFloat(step) < 0
            const comp = isNegative ? '>' : '<'
            processed = `for (let ${varName} = ${rangeArgs[0]}; ${varName} ${comp} ${rangeArgs[1]}; ${varName} += ${step}) {`
          }
        } else if (forOfMatch) {
          const varName = forOfMatch[1]
          const arrName = forOfMatch[2]
          processed = `for (let ${varName} of ${arrName}) {`
        }
      } else if (processed.startsWith('while ')) {
        processed = `while (${processed.slice(6)}) {`
      } else if (processed.startsWith('if ')) {
        processed = `if (${processed.slice(3)}) {`
      } else if (processed.startsWith('elif ')) {
        processed = `else if (${processed.slice(5)}) {`
      } else if (processed.startsWith('else')) {
        processed = `else {`
      } else {
        processed += ' {'
      }
      
      indentStack.push(indent)
    }
    
    jsCode += ' '.repeat(indent) + processed + '\n'
  }
  
  // Close remaining open blocks
  while (indentStack.length > 0) {
    indentStack.pop()
    jsCode += '}\n'
  }
  
  return jsCode
}

function transpileJava(code) {
  let js = code
  
  // Strip package, imports (including wildcards like java.util.*), annotations
  js = js.replace(/package\s+[\w.]+;/g, '')
  js = js.replace(/import\s+[\w.*]+;/g, '')
  js = js.replace(/@\w+(\(.*?\))?/g, '')
  
  // Strip class wrappers
  let hasClass = false
  js = js.replace(/(?:public|private|protected)?\s*class\s+\w+(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{/g, () => {
    hasClass = true
    return ''
  })
  
  // Find all method declarations, extract param names for later binding
  const methodParamNames = []
  const methodRegex = /(?:public|protected|private|static|\s)+(?:void|int|double|float|char|boolean|String|List|int\[\]|double\[\]|float\[\])\s+(\w+)\s*\(\s*([^)]*)\)\s*\{/g
  
  js = js.replace(methodRegex, (match, methodName, paramsList) => {
    const params = paramsList.split(',').map(p => {
      const parts = p.trim().split(/\s+/)
      return parts[parts.length - 1]
    }).filter(Boolean)
    
    // Track array-typed parameters for auto-binding
    const paramTypes = paramsList.split(',').map(p => p.trim())
    paramTypes.forEach((pt, idx) => {
      if (pt.includes('[]') && params[idx]) {
        methodParamNames.push(params[idx])
      }
    })
    
    return `function ${methodName}(${params.join(', ')}) {`
  })
  
  // Convert standard Java types into JS let bindings
  js = js.replace(/\b(?:int|double|float|char|boolean|String|long|short|byte|Integer|Double|Float|Boolean)\[\]\s+(\w+)\b/g, 'let $1')
  js = js.replace(/\b(?:int|double|float|char|boolean|String|long|short|byte|Integer|Double|Float|Boolean)\s+(\w+)\b/g, 'let $1')
  
  // Clean up new array allocations
  js = js.replace(/new\s+(?:int|double|float|char|boolean|String|long|short|byte)\[\]\s*\{([^}]+)\}/g, '[$1]')
  js = js.replace(/new\s+(?:int|double|float|char|boolean|String|long|short|byte)\[([^\]]+)\]/g, 'new Array($1).fill(0)')
  
  // Clean up type casts
  js = js.replace(/\(double\)\s*\(([^)]+)\)/g, '($1)')
  js = js.replace(/\(double\)\s*(\w+)/g, '($1)')
  js = js.replace(/\(int\)\s*\(([^)]+)\)/g, 'Math.floor($1)')
  js = js.replace(/\(int\)\s*(\w+)/g, 'Math.floor($1)')
  
  // Convert Arrays.sort(x) to x.sort((a,b) => a-b)
  js = js.replace(/Arrays\.sort\(([^)]+)\)/g, '$1.sort((a,b) => a-b)')
  
  // Convert Math.min, Math.max, Math.abs — these are the same in JS, keep them
  // Convert Arrays.copyOf, Arrays.fill etc
  js = js.replace(/Arrays\.copyOf\(([^,]+),\s*([^)]+)\)/g, '$1.slice(0, $2)')
  js = js.replace(/Arrays\.fill\(([^,]+),\s*([^)]+)\)/g, '$1.fill($2)')
  
  // Replace System.out.println BEFORE generic method call cleanup
  js = js.replace(/System\.out\.print(?:ln)?\(/g, 'console.log(')
  
  // DO NOT strip all object.method() calls — that was too aggressive.
  // Only strip specific Java-only patterns that have no JS equivalent.
  
  if (hasClass) {
    const lastBraceIdx = js.lastIndexOf('}')
    if (lastBraceIdx !== -1) {
      js = js.slice(0, lastBraceIdx) + js.slice(lastBraceIdx + 1)
    }
  }
  
  return { code: js, methodParamNames }
}

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
  findMin: `// Template: Find Minimum Value
let minIdx = 0;

for (let i = 1; i < arr.length; i++) {
  // Read elements to compare them
  if (arr[i] < arr[minIdx]) {
    minIdx = i;
  }
}`,
  linearSearch: `// Template: Linear Search
let target = 12; // Edit this target to search for different elements
let foundIdx = -1;

for (let i = 0; i < arr.length; i++) {
  // Check each item
  if (arr[i] === target) {
    foundIdx = i;
    break;
  }
}`,
  isSorted: `// Template: Check if Array is Sorted
let sorted = true;

for (let i = 0; i < arr.length - 1; i++) {
  // Check adjacent elements
  if (arr[i] > arr[i + 1]) {
    sorted = false;
    break;
  }
}`,
  arraySum: `// Template: Array Sum & Average
let sum = 0;

for (let i = 0; i < arr.length; i++) {
  sum = sum + arr[i];
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
}`,
  selectionSort: `// Template: Selection Sort
let n = arr.length;

for (let i = 0; i < n - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < n; j++) {
    if (arr[j] < arr[minIdx]) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    swap(i, minIdx);
  }
}`,
  insertionSort: `// Template: Insertion Sort
let n = arr.length;

for (let i = 1; i < n; i++) {
  let key = arr[i];
  let j = i - 1;
  
  // Shift elements larger than key to the right
  while (j >= 0 && arr[j] > key) {
    arr[j + 1] = arr[j];
    j = j - 1;
  }
  arr[j + 1] = key;
}`,
  binarySearch: `// Template: Binary Search (Array must be sorted first!)
let target = 30; // Find target 30
let low = 0;
let high = arr.length - 1;
let foundAt = -1;

while (low <= high) {
  let mid = Math.floor((low + high) / 2);
  
  // Read and check mid
  if (arr[mid] === target) {
    foundAt = mid;
    break;
  } else if (arr[mid] < target) {
    low = mid + 1;
  } else {
    high = mid - 1;
  }
}`,
  findSecondLargest: `// Template: Find Second Largest
if (arr.length >= 2) {
  let maxIdx = 0;
  let secondIdx = -1;
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIdx]) {
      secondIdx = maxIdx;
      maxIdx = i;
    } else if (secondIdx === -1 || arr[i] > arr[secondIdx]) {
      if (arr[i] !== arr[maxIdx]) {
        secondIdx = i;
      }
    }
  }
}`,
  countOccurrences: `// Template: Count Occurrences
let target = 10; // Value to count
let count = 0;

for (let i = 0; i < arr.length; i++) {
  if (arr[i] === target) {
    count++;
  }
}`,
  swapFirstLast: `// Template: Swap First and Last Element
if (arr.length > 1) {
  swap(0, arr.length - 1);
}`,
  leetcode189: `// LeetCode 189: Rotate Array Right by k
let k = 3; // Shift right by 3
k = k % arr.length;

// Step 1: Reverse the whole array
let i = 0, j = arr.length - 1;
while (i < j) { swap(i, j); i++; j--; }

// Step 2: Reverse first k elements
i = 0; j = k - 1;
while (i < j) { swap(i, j); i++; j--; }

// Step 3: Reverse remaining elements
i = k; j = arr.length - 1;
while (i < j) { swap(i, j); i++; j--; }`,
  leetcode283: `// LeetCode 283: Move Zeroes
// Moves all 0s to end, keeping order of non-zeroes
let insertPos = 0;

for (let i = 0; i < arr.length; i++) {
  // Check element and swap non-zeroes forward
  if (arr[i] !== 0) {
    if (i !== insertPos) {
      swap(i, insertPos);
    }
    insertPos++;
  }
}`,
  leetcode75: `// LeetCode 75: Sort Colors (Dutch Flag)
// (Works best on arrays with only 0s, 1s, 2s. Try input: 2,0,2,1,1,0)
let low = 0;
let mid = 0;
let high = arr.length - 1;

while (mid <= high) {
  if (arr[mid] === 0) {
    swap(low, mid);
    low++;
    mid++;
  } else if (arr[mid] === 1) {
    mid++;
  } else {
    swap(mid, high);
    high--;
  }
}`,
  leetcode905: `// LeetCode 905: Sort Array By Parity
// Move even integers to start, odd integers to end
let left = 0;
let right = arr.length - 1;

while (left < right) {
  if (arr[left] % 2 > arr[right] % 2) {
    swap(left, right);
  }
  if (arr[left] % 2 === 0) left++;
  if (arr[right] % 2 === 1) right--;
}`,
  leetcode27: `// LeetCode 27: Remove Element
let val = 12; // Element to remove
let k = 0;

for (let i = 0; i < arr.length; i++) {
  if (arr[i] !== val) {
    arr[k] = arr[i];
    k++;
  }
}`
}

export function runArrayCode(code, initialArray, language = 'javascript', initialArray2 = null) {
  const frames = []
  const arrayCopy = [...initialArray]
  const array2Copy = initialArray2 ? [...initialArray2] : null
  let stepCount = 0
  const STEP_LIMIT = 2000
  let resultValue = undefined
  
  const checkLimit = () => {
    stepCount++
    if (stepCount > STEP_LIMIT) {
      throw new Error(`Step limit of ${STEP_LIMIT} exceeded. This may be caused by an infinite loop in your code.`)
    }
  }

  // Preprocess/transpile code based on language
  let transpiledCode = code
  let javaParamNames = []
  if (language === 'python') {
    transpiledCode = transpilePython(code)
    
    // Auto call python function if defined but not called
    let firstFuncName = null
    const defMatch = code.match(/def\s+(\w+)/)
    if (defMatch) {
      firstFuncName = defMatch[1]
    }
    if (firstFuncName) {
      const occurrences = transpiledCode.match(new RegExp(`\\b${firstFuncName}\\s*\\(`, 'g')) || []
      const definitionCount = transpiledCode.match(new RegExp(`\\bfunction\\s+${firstFuncName}\\b`, 'g')) || []
      if (occurrences.length <= definitionCount.length) {
        transpiledCode += `\n\n${firstFuncName}(arr);`
      }
    }
  } else if (language === 'java') {
    const result = transpileJava(code)
    transpiledCode = result.code
    javaParamNames = result.methodParamNames
    
    // Auto call java method if defined but not called
    let methodName = null
    const methodRegex = /(?:public|protected|private|static|\s)+(?:void|int|double|float|char|boolean|String|List|int\[\]|double\[\]|float\[\])\s+(\w+)\s*\(\s*([^)]*)\)\s*\{/
    const match = code.match(methodRegex)
    if (match) {
      methodName = match[1]
      const occurrences = transpiledCode.match(new RegExp(`\\b${methodName}\\s*\\(`, 'g')) || []
      const definitionCount = transpiledCode.match(new RegExp(`\\bfunction\\s+${methodName}\\b`, 'g')) || []
      if (occurrences.length <= definitionCount.length) {
        // Build argument list matching extracted parameter names
        if (javaParamNames.length >= 2 && array2Copy) {
          transpiledCode += `\n\nlet __result = ${methodName}(${javaParamNames[0]}, ${javaParamNames[1]});`
        } else if (javaParamNames.length >= 1) {
          transpiledCode += `\n\nlet __result = ${methodName}(${javaParamNames[0]});`
        } else {
          transpiledCode += `\n\nlet __result = ${methodName}(arr);`
        }
      }
    }
  }

  // Preprocess code to inject loop safety check in every block opening '{'
  let blockCount = 0
  const limitHelper = () => {
    blockCount++
    if (blockCount > 5000) {
      throw new Error("Infinite loop or recursion detected! Execution aborted.")
    }
  }

  const processedCode = transpiledCode.replace(/\{/g, '{ __limit(); ')

  // Custom Proxy to intercept array accesses and produce visualization frames
  const createArrayProxy = (targetArray, arrayName) => {
    const handler = {
      get(target, prop) {
        if (prop === 'length') return target.length
        if (prop === 'toString' || prop === 'valueOf') return target[prop]
        if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return target[prop]
        // Allow native array methods to work through the proxy
        if (typeof prop === 'string' && typeof target[prop] === 'function') {
          return target[prop].bind(target)
        }
        // Allow sort property to be accessed
        if (prop === 'sort' || prop === 'slice' || prop === 'fill' || prop === 'push' 
            || prop === 'pop' || prop === 'splice' || prop === 'indexOf'
            || prop === 'map' || prop === 'filter' || prop === 'reduce'
            || prop === 'join' || prop === 'concat' || prop === 'forEach'
            || prop === 'includes' || prop === 'find' || prop === 'findIndex') {
          return target[prop].bind(target)
        }
        
        const index = Number(prop)
        if (!isNaN(index) && index >= 0 && index < target.length) {
          checkLimit()
          frames.push({
            array: [...arrayCopy],
            array2: array2Copy ? [...array2Copy] : null,
            comparing: [index],
            swapping: [],
            activeArray: arrayName,
            label: `${arrayName}: Reading index ${index} (Value: ${target[index]})`
          })
          return target[index]
        }
        return target[prop]
      },
      set(target, prop, value) {
        const index = Number(prop)
        if (!isNaN(index) && index >= 0) {
          checkLimit()
          const oldValue = target[index]
          target[index] = value
          frames.push({
            array: [...arrayCopy],
            array2: array2Copy ? [...array2Copy] : null,
            comparing: [],
            swapping: [index],
            activeArray: arrayName,
            label: `${arrayName}: Writing index ${index}: ${oldValue !== undefined ? oldValue : 'empty'} → ${value}`
          })
          return true
        }
        target[prop] = value
        return true
      }
    }
    return new Proxy(targetArray, handler)
  }

  const proxy = createArrayProxy(arrayCopy, 'arr')
  const proxy2 = array2Copy ? createArrayProxy(array2Copy, 'arr2') : null

  // Exposed helper function
  const swapHelper = (i, j) => {
    checkLimit()
    if (i < 0 || i >= proxy.length || j < 0 || j >= proxy.length) {
      throw new Error(`Swap out of bounds: indices (${i}, ${j}) on length ${proxy.length}`)
    }
    const temp = proxy[i]
    proxy[i] = proxy[j]
    proxy[j] = temp
  }

  try {
    // Build sandbox variables — always provide arr and swap,
    // plus any named aliases from Java param extraction
    const sandboxArgs = ['arr', 'swap', '__limit']
    const sandboxValues = [proxy, swapHelper, limitHelper]
    
    // If a second array is provided, expose it as arr2 and also map Java param names
    if (proxy2) {
      sandboxArgs.push('arr2')
      sandboxValues.push(proxy2)
    }
    
    // Map Java method parameter names to the actual proxied arrays
    if (javaParamNames.length >= 1 && javaParamNames[0] !== 'arr') {
      sandboxArgs.push(javaParamNames[0])
      sandboxValues.push(proxy)
    }
    if (javaParamNames.length >= 2 && proxy2) {
      sandboxArgs.push(javaParamNames[1])
      sandboxValues.push(proxy2)
    }
    
    // Provide __setResult so we can capture return values
    sandboxArgs.push('__setResult')
    sandboxValues.push((v) => { resultValue = v })
    
    // Wrap code to capture return value if there's __result
    let finalCode = processedCode
    if (transpiledCode.includes('__result')) {
      finalCode += `\nif (typeof __result !== 'undefined') __setResult(__result);`
    }

    const runner = new Function(...sandboxArgs, `
      try {
        ${finalCode}
      } catch (err) {
        throw err;
      }
    `)
    runner(...sandboxValues)
  } catch (err) {
    frames.push({
      array: [...arrayCopy],
      array2: array2Copy ? [...array2Copy] : null,
      comparing: [],
      swapping: [],
      label: `Runtime Error: ${err.message}`
    })
  }

  // Final confirmation frame with result if available
  let finalLabel = `Execution finished. Final array: [${arrayCopy.join(', ')}]`
  if (resultValue !== undefined) {
    finalLabel += ` | Result: ${resultValue}`
  }
  if (array2Copy) {
    finalLabel = `Done. arr: [${arrayCopy.join(', ')}]`
    if (resultValue !== undefined) {
      finalLabel += ` | Result: ${resultValue}`
    }
  }

  frames.push({
    array: [...arrayCopy],
    array2: array2Copy ? [...array2Copy] : null,
    comparing: [],
    swapping: [],
    label: finalLabel
  })

  return frames
}
