export function* binarySearch({ arr, target }) {
  const a = [...arr].sort((x, y) => x - y)
  let left = 0, right = a.length - 1

  yield { array: a, left, right, mid: null, found: -1, target, label: `Searching for ${target} in sorted array` }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    yield { array: a, left, right, mid, found: -1, target, label: `mid=${mid}, a[${mid}]=${a[mid]}. Comparing with ${target}` }

    if (a[mid] === target) {
      yield { array: a, left, right, mid, found: mid, target, label: `Found ${target} at index ${mid}!` }
      return
    } else if (a[mid] < target) {
      yield { array: a, left, right, mid, found: -1, target, label: `${a[mid]} < ${target}, search right half` }
      left = mid + 1
    } else {
      yield { array: a, left, right, mid, found: -1, target, label: `${a[mid]} > ${target}, search left half` }
      right = mid - 1
    }
  }
  yield { array: a, left, right, mid: null, found: -2, target, label: `${target} not found in array` }
}

export function* linearSearch({ arr, target }) {
  for (let i = 0; i < arr.length; i++) {
    yield { array: arr, current: i, found: -1, target, label: `Checking index ${i}: ${arr[i]} === ${target}?` }
    if (arr[i] === target) {
      yield { array: arr, current: i, found: i, target, label: `Found ${target} at index ${i}!` }
      return
    }
  }
  yield { array: arr, current: -1, found: -2, target, label: `${target} not found` }
}