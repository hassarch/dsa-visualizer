// Two Pointers - Two Sum II
export function* twoPointers({ arr, target }) {
  const a = [...arr].sort((x, y) => x - y)
  let left = 0, right = a.length - 1
  
  yield { array: a, left, right, found: [], label: `Two pointers: left=${left}, right=${right}, target=${target}` }
  
  while (left < right) {
    const sum = a[left] + a[right]
    yield { array: a, left, right, found: [], sum, label: `a[${left}](${a[left]}) + a[${right}](${a[right]}) = ${sum}` }
    
    if (sum === target) {
      yield { array: a, left, right, found: [left, right], sum, label: `✓ Found! indices [${left}, ${right}] sum to ${target}` }
      return
    } else if (sum < target) {
      yield { array: a, left, right, found: [], sum, label: `${sum} < ${target}, move left pointer right` }
      left++
    } else {
      yield { array: a, left, right, found: [], sum, label: `${sum} > ${target}, move right pointer left` }
      right--
    }
  }
  yield { array: a, left, right, found: [], label: `No pair found that sums to ${target}` }
}

// Sliding Window - Fixed size
export function* slidingWindowFixed({ arr, k }) {
  const n = arr.length
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0)
  let maxSum = windowSum
  let maxStart = 0
  
  yield { array: arr, windowStart: 0, windowEnd: k - 1, windowSum, maxSum, maxStart, label: `Initial window [0..${k-1}], sum=${windowSum}` }
  
  for (let i = k; i < n; i++) {
    const leaving = arr[i - k]
    const entering = arr[i]
    windowSum = windowSum - leaving + entering
    
    yield {
      array: arr, windowStart: i - k + 1, windowEnd: i,
      windowSum, maxSum, maxStart,
      leaving: i - k, entering: i,
      label: `Slide: remove ${leaving}, add ${entering}, sum=${windowSum}`
    }
    
    if (windowSum > maxSum) {
      maxSum = windowSum
      maxStart = i - k + 1
      yield { array: arr, windowStart: i - k + 1, windowEnd: i, windowSum, maxSum, maxStart, label: `New max sum=${maxSum} at window [${maxStart}..${i}]` }
    }
  }
  
  yield { array: arr, windowStart: maxStart, windowEnd: maxStart + k - 1, windowSum: maxSum, maxSum, maxStart, label: `Max sum=${maxSum} in window [${maxStart}..${maxStart + k - 1}]` }
}

// Sliding Window - Variable size (longest subarray with sum <= target)
export function* slidingWindowVariable({ arr, target }) {
  let left = 0, currentSum = 0, maxLen = 0, bestLeft = 0, bestRight = 0
  
  yield { array: arr, left, right: -1, currentSum, maxLen, label: `Find longest subarray with sum ≤ ${target}` }
  
  for (let right = 0; right < arr.length; right++) {
    currentSum += arr[right]
    yield { array: arr, left, right, currentSum, maxLen, label: `Expand: add arr[${right}]=${arr[right]}, sum=${currentSum}` }
    
    while (currentSum > target && left <= right) {
      yield { array: arr, left, right, currentSum, maxLen, label: `sum=${currentSum} > ${target}, shrink from left, remove ${arr[left]}` }
      currentSum -= arr[left]
      left++
    }
    
    if (right - left + 1 > maxLen) {
      maxLen = right - left + 1
      bestLeft = left
      bestRight = right
      yield { array: arr, left, right, currentSum, maxLen, bestLeft, bestRight, label: `New longest window [${left}..${right}], length=${maxLen}, sum=${currentSum}` }
    }
  }
  
  yield { array: arr, left: bestLeft, right: bestRight, currentSum, maxLen, bestLeft, bestRight, label: `Longest subarray: [${bestLeft}..${bestRight}], length=${maxLen}` }
}

// Prefix Sum
export function* prefixSum({ arr, queryL, queryR }) {
  const n = arr.length
  const prefix = new Array(n + 1).fill(0)
  
  yield { array: arr, prefix: [...prefix], building: -1, queryL, queryR, phase: 'build', label: `Building prefix sum array` }
  
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + arr[i]
    yield { array: arr, prefix: [...prefix], building: i, queryL, queryR, phase: 'build', label: `prefix[${i+1}] = prefix[${i}] + arr[${i}] = ${prefix[i]} + ${arr[i]} = ${prefix[i+1]}` }
  }
  
  yield { array: arr, prefix: [...prefix], building: -1, queryL, queryR, phase: 'query', label: `Prefix sum built! Now query range [${queryL}, ${queryR}]` }
  
  yield { array: arr, prefix: [...prefix], building: -1, queryL, queryR, phase: 'query', label: `Range sum = prefix[${queryR+1}] - prefix[${queryL}] = ${prefix[queryR+1]} - ${prefix[queryL]} = ${prefix[queryR+1] - prefix[queryL]}` }
  
  const result = prefix[queryR + 1] - prefix[queryL]
  yield { array: arr, prefix: [...prefix], building: -1, queryL, queryR, result, phase: 'done', label: `✓ Sum of arr[${queryL}..${queryR}] = ${result} in O(1) time` }
}

// Kadane's Algorithm - Maximum Subarray
export function* kadane({ arr }) {
  let maxSum = arr[0], currentSum = arr[0]
  let maxStart = 0, maxEnd = 0, tempStart = 0
  
  yield { array: arr, currentStart: 0, currentEnd: 0, maxStart, maxEnd, currentSum, maxSum, label: `Start: currentSum=${currentSum}, maxSum=${maxSum}` }
  
  for (let i = 1; i < arr.length; i++) {
    if (currentSum + arr[i] < arr[i]) {
      yield { array: arr, currentStart: tempStart, currentEnd: i - 1, maxStart, maxEnd, currentSum, maxSum, label: `Reset: starting fresh at index ${i} (${currentSum} + ${arr[i]} < ${arr[i]})` }
      currentSum = arr[i]
      tempStart = i
    } else {
      currentSum += arr[i]
      yield { array: arr, currentStart: tempStart, currentEnd: i, maxStart, maxEnd, currentSum, maxSum, label: `Extend: currentSum = ${currentSum} (added ${arr[i]})` }
    }
    
    if (currentSum > maxSum) {
      maxSum = currentSum
      maxStart = tempStart
      maxEnd = i
      yield { array: arr, currentStart: tempStart, currentEnd: i, maxStart, maxEnd, currentSum, maxSum, label: `New max! maxSum=${maxSum} at [${maxStart}..${maxEnd}]` }
    }
  }
  
  yield { array: arr, currentStart: maxStart, currentEnd: maxEnd, maxStart, maxEnd, currentSum, maxSum, label: `✓ Max subarray [${maxStart}..${maxEnd}] = ${maxSum}` }
}

// Trapping Rain Water
export function* trappingRainWater({ arr }) {
  const n = arr.length
  const leftMax = new Array(n).fill(0)
  const rightMax = new Array(n).fill(0)
  const water = new Array(n).fill(0)
  
  leftMax[0] = arr[0]
  yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'leftMax', current: 0, label: `Building leftMax array` }
  
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(leftMax[i - 1], arr[i])
    yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'leftMax', current: i, label: `leftMax[${i}] = max(${leftMax[i-1]}, ${arr[i]}) = ${leftMax[i]}` }
  }
  
  rightMax[n - 1] = arr[n - 1]
  yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'rightMax', current: n - 1, label: `Building rightMax array` }
  
  for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(rightMax[i + 1], arr[i])
    yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'rightMax', current: i, label: `rightMax[${i}] = max(${rightMax[i+1]}, ${arr[i]}) = ${rightMax[i]}` }
  }
  
  let total = 0
  for (let i = 0; i < n; i++) {
    water[i] = Math.max(0, Math.min(leftMax[i], rightMax[i]) - arr[i])
    total += water[i]
    yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'fill', current: i, total, label: `water[${i}] = min(${leftMax[i]}, ${rightMax[i]}) - ${arr[i]} = ${water[i]}` }
  }
  
  yield { array: arr, leftMax: [...leftMax], rightMax: [...rightMax], water: [...water], phase: 'done', total, label: `✓ Total water trapped = ${total} units` }
}

// Dutch National Flag - 3-way partition
export function* dutchNationalFlag({ arr }) {
  const a = [...arr]
  let low = 0, mid = 0, high = a.length - 1
  
  yield { array: [...a], low, mid, high, label: `Dutch National Flag: partition 0s, 1s, 2s` }
  
  while (mid <= high) {
    yield { array: [...a], low, mid, high, label: `Examining a[${mid}]=${a[mid]}: low=${low}, mid=${mid}, high=${high}` }
    
    if (a[mid] === 0) {
      yield { array: [...a], low, mid, high, swapping: [low, mid], label: `a[${mid}]=0, swap with low(${low}): ${a[mid]} ↔ ${a[low]}` }
      ;[a[low], a[mid]] = [a[mid], a[low]]
      low++; mid++
      yield { array: [...a], low, mid, high, label: `After swap: low=${low}, mid=${mid}` }
    } else if (a[mid] === 1) {
      mid++
      yield { array: [...a], low, mid, high, label: `a[${mid-1}]=1, already in place, mid++` }
    } else {
      yield { array: [...a], low, mid, high, swapping: [mid, high], label: `a[${mid}]=2, swap with high(${high}): ${a[mid]} ↔ ${a[high]}` }
      ;[a[mid], a[high]] = [a[high], a[mid]]
      high--
      yield { array: [...a], low, mid, high, label: `After swap: high=${high}` }
    }
  }
  
  yield { array: [...a], low, mid, high, label: `✓ Sorted! 0s: [0..${low-1}], 1s: [${low}..${high}], 2s: [${high+1}..${a.length-1}]` }
}
