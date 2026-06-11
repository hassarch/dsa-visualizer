export const ARRAY_PROBLEMS = {
  twoPointers: {
    problems: [
      { id: 167, title: 'Two Sum II', difficulty: 'Medium', pattern: 'Two Pointers', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: 15, title: '3Sum', difficulty: 'Medium', pattern: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/' },
      { id: 11, title: 'Container With Most Water', difficulty: 'Medium', pattern: 'Two Pointers', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard', pattern: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/' },
    ],
    pseudocode: [
      'left = 0, right = n-1',
      'while left < right:',
      '  sum = arr[left] + arr[right]',
      '  if sum == target: return [left, right]',
      '  elif sum < target: left++',
      '  else: right--',
    ],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'Requires sorted array' },
  },
  slidingWindowFixed: {
    problems: [
      { id: 643, title: 'Maximum Average Subarray I', difficulty: 'Easy', pattern: 'Sliding Window', url: 'https://leetcode.com/problems/maximum-average-subarray-i/' },
      { id: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', pattern: 'Sliding Window', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
    ],
    pseudocode: [
      'windowSum = sum(arr[0..k-1])',
      'maxSum = windowSum',
      'for i = k to n-1:',
      '  windowSum += arr[i] - arr[i-k]',
      '  maxSum = max(maxSum, windowSum)',
      'return maxSum',
    ],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'Fixed window slides one step at a time' },
  },
  slidingWindowVariable: {
    problems: [
      { id: 3, title: 'Longest Substring Without Repeating', difficulty: 'Medium', pattern: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard', pattern: 'Sliding Window', url: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 209, title: 'Minimum Size Subarray Sum', difficulty: 'Medium', pattern: 'Sliding Window', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/' },
    ],
    pseudocode: [
      'left = 0, maxLen = 0',
      'for right = 0 to n-1:',
      '  currentSum += arr[right]',
      '  while currentSum > target:',
      '    currentSum -= arr[left]',
      '    left++',
      '  maxLen = max(maxLen, right-left+1)',
    ],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'Window expands right, shrinks from left' },
  },
  prefixSum: {
    problems: [
      { id: 303, title: 'Range Sum Query', difficulty: 'Easy', pattern: 'Prefix Sum', url: 'https://leetcode.com/problems/range-sum-query-immutable/' },
      { id: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', pattern: 'Prefix Sum', url: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium', pattern: 'Prefix Sum', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
    ],
    pseudocode: [
      'prefix[0] = 0',
      'for i = 0 to n-1:',
      '  prefix[i+1] = prefix[i] + arr[i]',
      '',
      'rangeSum(L, R):',
      '  return prefix[R+1] - prefix[L]',
    ],
    complexity: { time: 'O(n) build, O(1) query', space: 'O(n)', note: 'Precompute once, query in O(1)' },
  },
  kadane: {
    problems: [
      { id: 53, title: 'Maximum Subarray', difficulty: 'Medium', pattern: "Kadane's", url: 'https://leetcode.com/problems/maximum-subarray/' },
      { id: 918, title: 'Maximum Sum Circular Subarray', difficulty: 'Medium', pattern: "Kadane's", url: 'https://leetcode.com/problems/maximum-sum-circular-subarray/' },
      { id: 152, title: 'Maximum Product Subarray', difficulty: 'Medium', pattern: "Kadane's", url: 'https://leetcode.com/problems/maximum-product-subarray/' },
    ],
    pseudocode: [
      'maxSum = arr[0]',
      'currentSum = arr[0]',
      'for i = 1 to n-1:',
      '  currentSum = max(arr[i], currentSum + arr[i])',
      '  maxSum = max(maxSum, currentSum)',
      'return maxSum',
    ],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'Classic DP disguised as greedy' },
  },
  trappingRainWater: {
    problems: [
      { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard', pattern: 'Two Pointers / Prefix', url: 'https://leetcode.com/problems/trapping-rain-water/' },
      { id: 407, title: 'Trapping Rain Water II', difficulty: 'Hard', pattern: 'BFS / Heap', url: 'https://leetcode.com/problems/trapping-rain-water-ii/' },
    ],
    pseudocode: [
      'for i in range(n): leftMax[i] = max(leftMax[i-1], arr[i])',
      'for i in range(n-1,-1,-1): rightMax[i] = max(rightMax[i+1], arr[i])',
      'for i in range(n):',
      '  water[i] = min(leftMax[i], rightMax[i]) - arr[i]',
      'return sum(water)',
    ],
    complexity: { time: 'O(n)', space: 'O(n)', note: 'Can be O(1) space with two pointer approach' },
  },
  dutchNationalFlag: {
    problems: [
      { id: 75, title: 'Sort Colors', difficulty: 'Medium', pattern: 'Dutch National Flag', url: 'https://leetcode.com/problems/sort-colors/' },
      { id: 280, title: 'Wiggle Sort', difficulty: 'Medium', pattern: 'Three Pointers', url: 'https://leetcode.com/problems/wiggle-sort/' },
    ],
    pseudocode: [
      'low=0, mid=0, high=n-1',
      'while mid <= high:',
      '  if arr[mid]==0: swap(low,mid); low++; mid++',
      '  elif arr[mid]==1: mid++',
      '  else: swap(mid,high); high--',
    ],
    complexity: { time: 'O(n)', space: 'O(1)', note: 'Single pass, three-way partition' },
  },
}
