function hash(key, buckets) {
  let h = 0
  for (let i = 0; i < key.toString().length; i++) {
    h = (h + key.toString().charCodeAt(i)) % buckets
  }
  return h
}

const NUM_BUCKETS = 8

export function* hashMapInsert({ pairs }) {
  const buckets = Array.from({ length: NUM_BUCKETS }, () => [])

  yield { buckets: buckets.map(b => [...b]), activeKey: null, activeBucket: null, hashVal: null, label: `Empty hash map with ${NUM_BUCKETS} buckets` }

  for (const [key, value] of pairs) {
    const h = hash(key, NUM_BUCKETS)

    yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: null, hashVal: null, label: `Inserting key="${key}", value="${value}"` }

    yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: null, hashVal: h, label: `hash("${key}") = ${h} (sum of char codes % ${NUM_BUCKETS})` }

    yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: h, hashVal: h, label: `Going to bucket ${h}` }

    const existingIdx = buckets[h].findIndex(([k]) => k === key)
    if (existingIdx >= 0) {
      buckets[h][existingIdx] = [key, value]
      yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: h, hashVal: h, label: `Key "${key}" exists, updating value to "${value}"` }
    } else {
      if (buckets[h].length > 0) {
        yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: h, hashVal: h, label: `Collision! Bucket ${h} already has ${buckets[h].length} item(s). Chaining...` }
      }
      buckets[h].push([key, value])
      yield { buckets: buckets.map(b => [...b]), activeKey: key, activeBucket: h, hashVal: h, label: `✓ Inserted ("${key}", "${value}") at bucket ${h}` }
    }
  }

  yield { buckets: buckets.map(b => [...b]), activeKey: null, activeBucket: null, hashVal: null, label: `✓ All pairs inserted. Load factor = ${pairs.length}/${NUM_BUCKETS}` }
}

export function* hashMapSearch({ pairs, searchKey }) {
  const buckets = Array.from({ length: NUM_BUCKETS }, () => [])
  for (const [key, value] of pairs) {
    const h = hash(key, NUM_BUCKETS)
    buckets[h].push([key, value])
  }

  yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: null, hashVal: null, foundIdx: null, label: `Searching for key="${searchKey}"` }

  const h = hash(searchKey, NUM_BUCKETS)
  yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: null, hashVal: h, foundIdx: null, label: `hash("${searchKey}") = ${h}` }

  yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: h, hashVal: h, foundIdx: null, label: `Looking in bucket ${h} (has ${buckets[h].length} item(s))` }

  for (let i = 0; i < buckets[h].length; i++) {
    const [k, v] = buckets[h][i]
    yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: h, hashVal: h, foundIdx: null, checkIdx: i, label: `Checking chain[${i}]: key="${k}"` }

    if (k === searchKey) {
      yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: h, hashVal: h, foundIdx: i, label: `✓ Found! "${searchKey}" → "${v}"` }
      return
    }
  }

  yield { buckets: buckets.map(b => [...b]), activeKey: searchKey, activeBucket: h, hashVal: h, foundIdx: -1, label: `✗ "${searchKey}" not found in bucket ${h}` }
}

export function* hashMapDelete({ pairs, deleteKey }) {
  const buckets = Array.from({ length: NUM_BUCKETS }, () => [])
  for (const [key, value] of pairs) {
    const h = hash(key, NUM_BUCKETS)
    buckets[h].push([key, value])
  }

  yield { buckets: buckets.map(b => [...b]), activeKey: deleteKey, activeBucket: null, hashVal: null, label: `Deleting key="${deleteKey}"` }

  const h = hash(deleteKey, NUM_BUCKETS)
  yield { buckets: buckets.map(b => [...b]), activeKey: deleteKey, activeBucket: h, hashVal: h, label: `hash("${deleteKey}") = ${h}, checking bucket ${h}` }

  const idx = buckets[h].findIndex(([k]) => k === deleteKey)
  if (idx >= 0) {
    yield { buckets: buckets.map(b => [...b]), activeKey: deleteKey, activeBucket: h, hashVal: h, deleteIdx: idx, label: `Found "${deleteKey}" at chain index ${idx}, removing...` }
    buckets[h].splice(idx, 1)
    yield { buckets: buckets.map(b => [...b]), activeKey: null, activeBucket: h, hashVal: h, label: `✓ Deleted "${deleteKey}" from bucket ${h}` }
  } else {
    yield { buckets: buckets.map(b => [...b]), activeKey: deleteKey, activeBucket: h, hashVal: h, foundIdx: -1, label: `✗ "${deleteKey}" not found` }
  }
}

export function* twoSum({ nums, target }) {
  const map = {}
  const buckets = Array.from({ length: NUM_BUCKETS }, () => [])

  yield { buckets: buckets.map(b => [...b]), nums, current: -1, complement: null, foundPair: null, label: `Two Sum: find indices where nums[i] + nums[j] = ${target}` }

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    yield { buckets: buckets.map(b => [...b]), nums, current: i, complement, foundPair: null, label: `nums[${i}]=${nums[i]}, need complement ${target}-${nums[i]}=${complement}` }

    if (map.hasOwnProperty(complement)) {
      yield { buckets: buckets.map(b => [...b]), nums, current: i, complement, foundPair: [map[complement], i], label: `✓ Found! nums[${map[complement]}]=${complement} + nums[${i}]=${nums[i]} = ${target}` }
      return
    }

    const h = hash(nums[i], NUM_BUCKETS)
    buckets[h].push([nums[i], i])
    map[nums[i]] = i
    yield { buckets: buckets.map(b => [...b]), nums, current: i, complement, foundPair: null, label: `Store nums[${i}]=${nums[i]} in map at bucket ${h}` }
  }

  yield { buckets: buckets.map(b => [...b]), nums, current: -1, complement: null, foundPair: null, label: `No pair found that sums to ${target}` }
}

export function* groupAnagrams({ words }) {
  const buckets = Array.from({ length: NUM_BUCKETS }, () => [])
  const groups = {}

  yield { buckets: buckets.map(b => [...b]), words, current: -1, groups: {}, label: `Group anagrams using sorted string as hash key` }

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const key = word.split('').sort().join('')
    const h = hash(key, NUM_BUCKETS)

    yield { buckets: buckets.map(b => [...b]), words, current: i, groups: { ...groups }, label: `"${word}" → sorted key="${key}" → bucket ${h}` }

    if (!groups[key]) groups[key] = []
    groups[key].push(word)

    const bIdx = buckets[h].findIndex(([k]) => k === key)
    if (bIdx >= 0) {
      buckets[h][bIdx][1].push(word)
    } else {
      buckets[h].push([key, [word]])
    }

    yield { buckets: buckets.map(b => [...b]), words, current: i, groups: { ...groups }, label: `Added "${word}" to group [${groups[key].join(', ')}]` }
  }

  yield { buckets: buckets.map(b => [...b]), words, current: -1, groups: { ...groups }, label: `✓ ${Object.keys(groups).length} anagram groups found` }
}
