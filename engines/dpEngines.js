export function* fibonacci({ n }) {
  const dp = new Array(n + 1).fill(null)
  dp[0] = 0
  if (n >= 1) dp[1] = 1

  yield { dp: [...dp], current: 0, deps: [], label: `Base case: fib(0) = 0` }
  if (n >= 1) yield { dp: [...dp], current: 1, deps: [], label: `Base case: fib(1) = 1` }

  for (let i = 2; i <= n; i++) {
    yield { dp: [...dp], current: i, deps: [i - 1, i - 2], label: `fib(${i}) = fib(${i-1}) + fib(${i-2}) = ${dp[i-1]} + ${dp[i-2]}` }
    dp[i] = dp[i - 1] + dp[i - 2]
    yield { dp: [...dp], current: i, deps: [i - 1, i - 2], label: `fib(${i}) = ${dp[i]}` }
  }

  yield { dp: [...dp], current: n, deps: [], label: `fib(${n}) = ${dp[n]}` }
}

export function* coinChange({ coins, amount }) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0

  yield { dp: [...dp], current: 0, coins, highlight: [], label: `Base: dp[0] = 0 (0 coins needed for amount 0)` }

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] !== Infinity) {
        yield { dp: [...dp], current: a, coins, highlight: [a - coin], label: `Try coin ${coin}: dp[${a}] = min(${dp[a] === Infinity ? '∞' : dp[a]}, dp[${a-coin}]+1 = ${dp[a-coin]+1})` }
        if (dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1
      }
    }
    yield { dp: [...dp], current: a, coins, highlight: [], label: dp[a] === Infinity ? `dp[${a}] = ∞ (not reachable)` : `dp[${a}] = ${dp[a]}` }
  }

  yield { dp: [...dp], current: amount, coins, highlight: [], label: dp[amount] === Infinity ? `Amount ${amount} not reachable` : `Minimum coins for ${amount}: ${dp[amount]}` }
}

export function* climbingStairs({ n }) {
  const dp = new Array(n + 1).fill(0)
  dp[1] = 1
  if (n >= 2) dp[2] = 2

  yield { dp: [...dp], current: 1, deps: [], label: `Base: 1 way to reach step 1` }
  if (n >= 2) yield { dp: [...dp], current: 2, deps: [], label: `Base: 2 ways to reach step 2` }

  for (let i = 3; i <= n; i++) {
    yield { dp: [...dp], current: i, deps: [i - 1, i - 2], label: `ways(${i}) = ways(${i-1}) + ways(${i-2}) = ${dp[i-1]} + ${dp[i-2]}` }
    dp[i] = dp[i - 1] + dp[i - 2]
    yield { dp: [...dp], current: i, deps: [i - 1, i - 2], label: `ways(${i}) = ${dp[i]}` }
  }

  yield { dp: [...dp], current: n, deps: [], label: `${dp[n]} ways to climb ${n} stairs` }
}

export function* knapsack({ weights, values, capacity }) {
  const n = weights.length
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0))

  yield { dp: dp.map(r => [...r]), row: 0, col: 0, label: 'Initialize: dp[i][0] = 0, dp[0][j] = 0' }

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const canTake = weights[i - 1] <= w
      if (canTake) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
        yield { dp: dp.map(r => [...r]), row: i, col: w, label: `Item ${i}: take or skip? max(${dp[i-1][w]}, ${dp[i-1][w-weights[i-1]]}+${values[i-1]}) = ${dp[i][w]}` }
      } else {
        dp[i][w] = dp[i - 1][w]
        yield { dp: dp.map(r => [...r]), row: i, col: w, label: `Item ${i} too heavy for capacity ${w}, skip` }
      }
    }
  }

  yield { dp: dp.map(r => [...r]), row: n, col: capacity, label: `Max value = ${dp[n][capacity]}` }
}