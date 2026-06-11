export const PROBLEM_MAP = {
  bubble: [
    { id: 912, title: 'Sort an Array', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-an-array/' },
  ],
  selection: [
    { id: 912, title: 'Sort an Array', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-an-array/' },
  ],
  insertion: [
    { id: 147, title: 'Insertion Sort List', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/insertion-sort-list/' },
    { id: 912, title: 'Sort an Array', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-an-array/' },
  ],
  merge: [
    { id: 912, title: 'Sort an Array', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-an-array/' },
    { id: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard', pattern: 'Divide & Conquer', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    { id: 148, title: 'Sort List', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-list/' },
  ],
  quick: [
    { id: 912, title: 'Sort an Array', difficulty: 'Medium', pattern: 'Sorting', url: 'https://leetcode.com/problems/sort-an-array/' },
    { id: 215, title: 'Kth Largest Element', difficulty: 'Medium', pattern: 'QuickSelect', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  ],
  heap: [
    { id: 215, title: 'Kth Largest Element', difficulty: 'Medium', pattern: 'Heap', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
    { id: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', pattern: 'Heap', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  ],
  binarySearch: [
    { id: 704, title: 'Binary Search', difficulty: 'Easy', pattern: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
    { id: 33, title: 'Search in Rotated Array', difficulty: 'Medium', pattern: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
    { id: 153, title: 'Find Min in Rotated Array', difficulty: 'Medium', pattern: 'Binary Search', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
    { id: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', pattern: 'Binary Search', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
  ],
  linearSearch: [
    { id: 704, title: 'Binary Search', difficulty: 'Easy', pattern: 'Search', url: 'https://leetcode.com/problems/binary-search/' },
  ],
  linkedListReverse: [
    { id: 206, title: 'Reverse Linked List', difficulty: 'Easy', pattern: 'Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
    { id: 92, title: 'Reverse Linked List II', difficulty: 'Medium', pattern: 'Linked List', url: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
  ],
  linkedListDelete: [
    { id: 237, title: 'Delete Node in Linked List', difficulty: 'Medium', pattern: 'Linked List', url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/' },
    { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', pattern: 'Linked List', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  ],
  bfs: [
    { id: 102, title: 'Binary Tree Level Order', difficulty: 'Medium', pattern: 'BFS', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { id: 200, title: 'Number of Islands', difficulty: 'Medium', pattern: 'BFS/DFS', url: 'https://leetcode.com/problems/number-of-islands/' },
    { id: 127, title: 'Word Ladder', difficulty: 'Hard', pattern: 'BFS', url: 'https://leetcode.com/problems/word-ladder/' },
    { id: 994, title: 'Rotting Oranges', difficulty: 'Medium', pattern: 'BFS', url: 'https://leetcode.com/problems/rotting-oranges/' },
  ],
  dfs: [
    { id: 200, title: 'Number of Islands', difficulty: 'Medium', pattern: 'DFS', url: 'https://leetcode.com/problems/number-of-islands/' },
    { id: 133, title: 'Clone Graph', difficulty: 'Medium', pattern: 'DFS', url: 'https://leetcode.com/problems/clone-graph/' },
    { id: 695, title: 'Max Area of Island', difficulty: 'Medium', pattern: 'DFS', url: 'https://leetcode.com/problems/max-area-of-island/' },
  ],
  fibonacci: [
    { id: 509, title: 'Fibonacci Number', difficulty: 'Easy', pattern: 'DP', url: 'https://leetcode.com/problems/fibonacci-number/' },
    { id: 70, title: 'Climbing Stairs', difficulty: 'Easy', pattern: 'DP', url: 'https://leetcode.com/problems/climbing-stairs/' },
  ],
  coinChange: [
    { id: 322, title: 'Coin Change', difficulty: 'Medium', pattern: 'DP', url: 'https://leetcode.com/problems/coin-change/' },
    { id: 518, title: 'Coin Change II', difficulty: 'Medium', pattern: 'DP', url: 'https://leetcode.com/problems/coin-change-ii/' },
  ],
  climbingStairs: [
    { id: 70, title: 'Climbing Stairs', difficulty: 'Easy', pattern: 'DP', url: 'https://leetcode.com/problems/climbing-stairs/' },
    { id: 746, title: 'Min Cost Climbing Stairs', difficulty: 'Easy', pattern: 'DP', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
  ],
  knapsack: [
    { id: 416, title: 'Partition Equal Subset Sum', difficulty: 'Medium', pattern: 'DP Knapsack', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
    { id: 1049, title: 'Last Stone Weight II', difficulty: 'Medium', pattern: 'DP Knapsack', url: 'https://leetcode.com/problems/last-stone-weight-ii/' },
  ],
}

export const PSEUDOCODE = {
  bubble: [
    'for i = 0 to n-1:',
    '  for j = 0 to n-i-2:',
    '    if arr[j] > arr[j+1]:',
    '      swap(arr[j], arr[j+1])',
  ],
  selection: [
    'for i = 0 to n-1:',
    '  minIdx = i',
    '  for j = i+1 to n:',
    '    if arr[j] < arr[minIdx]:',
    '      minIdx = j',
    '  swap(arr[i], arr[minIdx])',
  ],
  insertion: [
    'for i = 1 to n:',
    '  key = arr[i]',
    '  j = i - 1',
    '  while j >= 0 and arr[j] > key:',
    '    arr[j+1] = arr[j]',
    '    j--',
    '  arr[j+1] = key',
  ],
  merge: [
    'mergeSort(arr, left, right):',
    '  mid = (left + right) / 2',
    '  mergeSort(arr, left, mid)',
    '  mergeSort(arr, mid+1, right)',
    '  merge(arr, left, mid, right)',
  ],
  quick: [
    'quickSort(arr, low, high):',
    '  pivot = arr[high]',
    '  i = low - 1',
    '  for j = low to high-1:',
    '    if arr[j] <= pivot:',
    '      i++; swap(arr[i], arr[j])',
    '  swap(arr[i+1], arr[high])',
  ],
  heap: [
    'heapSort(arr):',
    '  buildMaxHeap(arr)',
    '  for i = n-1 to 1:',
    '    swap(arr[0], arr[i])',
    '    heapify(arr, i, 0)',
  ],
  binarySearch: [
    'binarySearch(arr, target):',
    '  left = 0, right = n-1',
    '  while left <= right:',
    '    mid = (left + right) / 2',
    '    if arr[mid] == target: return mid',
    '    if arr[mid] < target: left = mid+1',
    '    else: right = mid-1',
    '  return -1',
  ],
  linearSearch: [
    'linearSearch(arr, target):',
    '  for i = 0 to n-1:',
    '    if arr[i] == target:',
    '      return i',
    '  return -1',
  ],
  fibonacci: [
    'dp[0] = 0, dp[1] = 1',
    'for i = 2 to n:',
    '  dp[i] = dp[i-1] + dp[i-2]',
    'return dp[n]',
  ],
  coinChange: [
    'dp[0] = 0',
    'for amount = 1 to target:',
    '  for coin in coins:',
    '    if coin <= amount:',
    '      dp[amount] = min(dp[amount],',
    '                   dp[amount-coin] + 1)',
    'return dp[target]',
  ],
  climbingStairs: [
    'dp[1] = 1, dp[2] = 2',
    'for i = 3 to n:',
    '  dp[i] = dp[i-1] + dp[i-2]',
    'return dp[n]',
  ],
  knapsack: [
    'for i = 1 to n:',
    '  for w = 0 to capacity:',
    '    if weights[i] <= w:',
    '      dp[i][w] = max(dp[i-1][w],',
    '        dp[i-1][w-weights[i]] + values[i])',
    '    else:',
    '      dp[i][w] = dp[i-1][w]',
  ],
}

export const COMPLEXITY = {
  bubble: { time: 'O(n²)', space: 'O(1)', best: 'O(n)', note: 'Best case when already sorted' },
  selection: { time: 'O(n²)', space: 'O(1)', best: 'O(n²)', note: 'Always scans full unsorted portion' },
  insertion: { time: 'O(n²)', space: 'O(1)', best: 'O(n)', note: 'Very fast on nearly-sorted data' },
  merge: { time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', note: 'Stable sort, requires auxiliary array' },
  quick: { time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', note: 'O(n²) worst case with bad pivot' },
  heap: { time: 'O(n log n)', space: 'O(1)', best: 'O(n log n)', note: 'In-place, not stable' },
  binarySearch: { time: 'O(log n)', space: 'O(1)', best: 'O(1)', note: 'Requires sorted input' },
  linearSearch: { time: 'O(n)', space: 'O(1)', best: 'O(1)', note: 'Works on unsorted data' },
  bfs: { time: 'O(V+E)', space: 'O(V)', best: 'O(V+E)', note: 'Finds shortest path in unweighted graph' },
  dfs: { time: 'O(V+E)', space: 'O(V)', best: 'O(V+E)', note: 'Stack depth = longest path' },
  fibonacci: { time: 'O(n)', space: 'O(n)', best: 'O(n)', note: 'O(2^n) without memoization!' },
  coinChange: { time: 'O(n×m)', space: 'O(n)', best: 'O(n×m)', note: 'n = amount, m = number of coins' },
  climbingStairs: { time: 'O(n)', space: 'O(n)', best: 'O(n)', note: 'Can optimize to O(1) space' },
  knapsack: { time: 'O(n×W)', space: 'O(n×W)', best: 'O(n×W)', note: 'n = items, W = capacity' },
}