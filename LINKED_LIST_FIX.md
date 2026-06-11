# Linked List Page - Infinite Loop Fix

## 🐛 Issue

When clicking on the Linked List page, the entire application would break with an infinite render loop, causing:
- Maximum update depth exceeded error
- Browser freezing
- Application becoming unresponsive

## 🔍 Root Cause

The issue was in `/app/linked-list/page.jsx`:

```javascript
// ❌ PROBLEMATIC CODE
const getInput = useCallback(() => {
  if (algoKey === 'linkedListReverse') return { values: DEFAULT_VALUES }
  if (algoKey === 'linkedListAppend') return { values: DEFAULT_VALUES, newVal: opArg }
  return { values: DEFAULT_VALUES, target: opArg }
}, [algoKey, opArg])

const playback = usePlayback(genFn, getInput())  // ⚠️ Calling function returns new object every render
```

### Why This Caused an Infinite Loop:

1. `getInput()` is called during render
2. Even though `getInput` is memoized with `useCallback`, **calling it returns a new object** `{ values: [...] }` on every render
3. The new object reference is passed to `usePlayback(genFn, input)`
4. `usePlayback` has a dependency on `input`, so it sees a "new" input every time
5. This triggers `buildFrames()` which calls `setFrames()`
6. Setting state causes a re-render
7. Re-render calls `getInput()` again → new object → infinite loop 🔄

## ✅ Solution

Changed from `useCallback` (which memoizes the function) to `useMemo` (which memoizes the **value**):

```javascript
// ✅ FIXED CODE
const input = useMemo(() => {
  if (algoKey === 'linkedListReverse') return { values: DEFAULT_VALUES }
  if (algoKey === 'linkedListAppend') return { values: DEFAULT_VALUES, newVal: opArg }
  return { values: DEFAULT_VALUES, target: opArg }
}, [algoKey, opArg])

const playback = usePlayback(genFn, input)  // ✅ Memoized object, same reference until deps change
```

### Why This Works:

1. `useMemo` memoizes the **returned object**, not just the function
2. The same object reference is used across renders as long as `algoKey` and `opArg` don't change
3. `usePlayback` only rebuilds frames when `input` actually changes
4. No infinite loop! 🎉

## 📝 Changes Made

### File: `/app/linked-list/page.jsx`

1. **Added import**: Added `useMemo` to the React imports
   ```javascript
   import { useState, useCallback, useEffect, useMemo } from 'react'
   ```

2. **Replaced `useCallback` with `useMemo`**: Changed the input generation from a memoized function to a memoized value
   ```javascript
   // Before: const getInput = useCallback(() => { ... }, [algoKey, opArg])
   // After:  const input = useMemo(() => { ... }, [algoKey, opArg])
   ```

3. **Updated usage**: Changed from calling the function to using the memoized value directly
   ```javascript
   // Before: const playback = usePlayback(genFn, getInput())
   // After:  const playback = usePlayback(genFn, input)
   ```

## 🧪 Testing

✅ **Build Status**: Successful
✅ **Page Load**: Working correctly
✅ **Navigation**: No longer breaks when clicking Linked List
✅ **Animations**: All linked list operations working
- Reverse
- Append
- Delete Node

## 📚 Key Takeaway

**When to use what:**

- **`useCallback`**: Memoize a **function** (returns the same function reference)
  ```javascript
  const handleClick = useCallback(() => { ... }, [deps])
  ```

- **`useMemo`**: Memoize a **value** (returns the same value reference)
  ```javascript
  const expensiveValue = useMemo(() => computeValue(), [deps])
  ```

In our case, we needed a stable object reference, so `useMemo` was the correct choice.

## ✨ Result

The Linked List page now works perfectly without any infinite loops or crashes!
