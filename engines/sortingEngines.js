export function* bubbleSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = new Set()

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sorted], label: `Comparing ${a[j]} and ${a[j+1]}` }
      if (a[j] > a[j + 1]) {
        yield { array: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sorted], label: `Swapping ${a[j]} ↔ ${a[j+1]}` }
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: `Swapped` }
      }
    }
    sorted.add(n - 1 - i)
  }
  sorted.add(0)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: 'Sorted!' }
}

export function* selectionSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = new Set()

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      yield { array: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sorted], pivot: minIdx, label: `Finding min: comparing ${a[j]} with current min ${a[minIdx]}` }
      if (a[j] < a[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      yield { array: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sorted], label: `Swapping ${a[i]} ↔ ${a[minIdx]}` }
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
    }
    sorted.add(i)
    yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: `${a[i]} placed at position ${i}` }
  }
  sorted.add(n - 1)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: 'Sorted!' }
}

export function* insertionSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = new Set([0])

  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1
    yield { array: [...a], comparing: [i], swapping: [], sorted: [...sorted], label: `Inserting ${key} into sorted portion` }
    while (j >= 0 && a[j] > key) {
      yield { array: [...a], comparing: [j, j + 1], swapping: [j + 1], sorted: [...sorted], label: `${a[j]} > ${key}, shifting right` }
      a[j + 1] = a[j]
      j--
    }
    a[j + 1] = key
    sorted.add(i)
    yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: `${key} inserted at position ${j + 1}` }
  }
  yield { array: [...a], comparing: [], swapping: [], sorted: [...new Array(n).keys()], label: 'Sorted!' }
}

export function* mergeSort(arr) {
  const a = [...arr]
  yield* mergeSortHelper(a, 0, a.length - 1)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...new Array(a.length).keys()], label: 'Sorted!' }
}

function* mergeSortHelper(a, left, right) {
  if (left >= right) return
  const mid = Math.floor((left + right) / 2)
  yield { array: [...a], comparing: [left, right], swapping: [], sorted: [], label: `Splitting [${left}..${right}] at mid=${mid}` }
  yield* mergeSortHelper(a, left, mid)
  yield* mergeSortHelper(a, mid + 1, right)
  yield* merge(a, left, mid, right)
}

function* merge(a, left, mid, right) {
  const leftArr = a.slice(left, mid + 1)
  const rightArr = a.slice(mid + 1, right + 1)
  let i = 0, j = 0, k = left

  while (i < leftArr.length && j < rightArr.length) {
    yield { array: [...a], comparing: [left + i, mid + 1 + j], swapping: [], sorted: [], label: `Merging: comparing ${leftArr[i]} and ${rightArr[j]}` }
    if (leftArr[i] <= rightArr[j]) {
      a[k++] = leftArr[i++]
    } else {
      a[k++] = rightArr[j++]
    }
    yield { array: [...a], comparing: [], swapping: [k - 1], sorted: [], label: `Placed ${a[k-1]} at position ${k-1}` }
  }
  while (i < leftArr.length) { a[k++] = leftArr[i++]; yield { array: [...a], comparing: [], swapping: [k-1], sorted: [], label: `Copying remaining` } }
  while (j < rightArr.length) { a[k++] = rightArr[j++]; yield { array: [...a], comparing: [], swapping: [k-1], sorted: [], label: `Copying remaining` } }
}

export function* quickSort(arr) {
  const a = [...arr]
  const sorted = new Set()
  yield* quickSortHelper(a, 0, a.length - 1, sorted)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...new Array(a.length).keys()], label: 'Sorted!' }
}

function* quickSortHelper(a, low, high, sorted) {
  if (low >= high) { sorted.add(low); return }
  const pivotIdx = high
  yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], pivot: pivotIdx, label: `Pivot = ${a[pivotIdx]}` }
  let i = low - 1
  for (let j = low; j < high; j++) {
    yield { array: [...a], comparing: [j, pivotIdx], swapping: [], sorted: [...sorted], pivot: pivotIdx, label: `${a[j]} vs pivot ${a[pivotIdx]}` }
    if (a[j] <= a[pivotIdx]) {
      i++
      if (i !== j) {
        yield { array: [...a], comparing: [], swapping: [i, j], sorted: [...sorted], pivot: pivotIdx, label: `Swapping ${a[i]} ↔ ${a[j]}` }
        ;[a[i], a[j]] = [a[j], a[i]]
      }
    }
  }
  ;[a[i + 1], a[high]] = [a[high], a[i + 1]]
  const pi = i + 1
  sorted.add(pi)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], pivot: pi, label: `Pivot ${a[pi]} in final position ${pi}` }
  yield* quickSortHelper(a, low, pi - 1, sorted)
  yield* quickSortHelper(a, pi + 1, high, sorted)
}

export function* heapSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(a, n, i)
  const sorted = new Set()
  for (let i = n - 1; i > 0; i--) {
    yield { array: [...a], comparing: [], swapping: [0, i], sorted: [...sorted], label: `Moving max ${a[0]} to position ${i}` }
    ;[a[0], a[i]] = [a[i], a[0]]
    sorted.add(i)
    yield* heapify(a, i, 0, sorted)
  }
  sorted.add(0)
  yield { array: [...a], comparing: [], swapping: [], sorted: [...sorted], label: 'Sorted!' }
}

function* heapify(a, n, i, sorted = new Set()) {
  let largest = i, left = 2 * i + 1, right = 2 * i + 2
  yield { array: [...a], comparing: [i, left, right].filter(x => x < n), swapping: [], sorted: [...sorted], label: `Heapifying at index ${i}` }
  if (left < n && a[left] > a[largest]) largest = left
  if (right < n && a[right] > a[largest]) largest = right
  if (largest !== i) {
    yield { array: [...a], comparing: [], swapping: [i, largest], sorted: [...sorted], label: `Swapping ${a[i]} ↔ ${a[largest]}` }
    ;[a[i], a[largest]] = [a[largest], a[i]]
    yield* heapify(a, n, largest, sorted)
  }
}