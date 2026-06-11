# Hydration Error Fix

## 🐛 Problem

Hydration error on the sorting page:
```
Uncaught Error: Hydration failed because the server rendered text didn't match the client.
```

The error was pointing to the number labels above the bars in the sorting visualization.

## 🔍 Root Cause

The issue was caused by **server-side rendering (SSR) mismatch**:

```javascript
// ❌ PROBLEMATIC CODE
export default function SortingPage() {
  const [inputArr, setInputArr] = useState(() => randomArray())
  // ...
}

function randomArray(n = 20) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10)
}
```

### Why This Caused Hydration Errors:

1. **Initial State with Random Data**: `useState(() => randomArray())` generates random numbers
2. **Server-Side Rendering**: Next.js pre-renders the page on the server with one set of random numbers
3. **Client-Side Hydration**: When React hydrates on the client, it generates a **different** set of random numbers
4. **Mismatch**: The numbers in the DOM don't match what React expects
   - Server: `[29, 34, 17, ...]`
   - Client: `[19, 17, 45, ...]`
5. **React Throws Error**: Hydration mismatch detected! ⚠️

## ✅ Solution

Generate random array **only on the client side** after hydration:

```javascript
// ✅ FIXED CODE
export default function SortingPage() {
  const [algoKey, setAlgoKey] = useState('bubble')
  const [inputArr, setInputArr] = useState([])  // Start with empty array
  const [inputText, setInputText] = useState('')
  const [size, setSize] = useState(20)
  const [isClient, setIsClient] = useState(false)  // Track client-side status
  
  // Generate random array only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)  // Mark as client-side
    setInputArr(randomArray(20))  // Generate random array on client only
  }, [])
  
  // ... rest of component
  
  // Don't render visualization until client-side hydration is complete
  if (!isClient) {
    return null  // or return loading state
  }
}
```

### Why This Works:

1. **Initial State is Empty**: `useState([])` - same on server and client
2. **useEffect Runs Only on Client**: The effect runs after hydration
3. **Random Generation on Client**: `setInputArr(randomArray(20))` happens after hydration
4. **Consistent Hydration**: Server and client render the same initial content (null or empty)
5. **Update After Hydration**: Once hydrated, the component updates with random data

## 📝 Changes Made

### File: `/app/sorting/page.jsx`

1. **Changed initial state**:
   ```javascript
   // Before: const [inputArr, setInputArr] = useState(() => randomArray())
   // After:  const [inputArr, setInputArr] = useState([])
   ```

2. **Added client-side tracking**:
   ```javascript
   const [isClient, setIsClient] = useState(false)
   ```

3. **Added useEffect for client-side initialization**:
   ```javascript
   useEffect(() => {
     setIsClient(true)
     setInputArr(randomArray(20))
   }, [])
   ```

4. **Added safety check in playback**:
   ```javascript
   const playback = usePlayback(genFn, inputArr.length > 0 ? inputArr : [10])
   ```

5. **Added array safety check**:
   ```javascript
   const arr = frame?.array ?? (inputArr.length > 0 ? inputArr : [10])
   ```

6. **Added early return for SSR**:
   ```javascript
   if (!isClient) {
     return null  // Don't render until client-side
   }
   ```

## 🎯 Best Practices for Avoiding Hydration Errors

### 1. **Avoid Random Data in Initial State**
```javascript
// ❌ BAD
const [data, setData] = useState(() => Math.random())

// ✅ GOOD
const [data, setData] = useState(null)
useEffect(() => setData(Math.random()), [])
```

### 2. **Avoid Date/Time in Initial State**
```javascript
// ❌ BAD
const [time, setTime] = useState(Date.now())

// ✅ GOOD
const [time, setTime] = useState(null)
useEffect(() => setTime(Date.now()), [])
```

### 3. **Avoid Browser-Only APIs in Render**
```javascript
// ❌ BAD
const width = window.innerWidth

// ✅ GOOD
const [width, setWidth] = useState(null)
useEffect(() => setWidth(window.innerWidth), [])
```

### 4. **Use Client-Side Flag**
```javascript
const [isClient, setIsClient] = useState(false)
useEffect(() => setIsClient(true), [])

if (!isClient) return <LoadingSkeleton />
return <ActualComponent />
```

### 5. **Suppress Hydration Warning (Last Resort)**
```javascript
<div suppressHydrationWarning>
  {Date.now()}
</div>
```

## 🧪 Testing

✅ **Build Status**: Successful  
✅ **No Hydration Errors**: Console is clean  
✅ **Page Loads**: Sorting page works correctly  
✅ **Random Arrays**: Generated on client-side  
✅ **Playback**: All controls functional  

## 📚 Related Documentation

- [React Hydration Docs](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js SSR Guide](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)
- [Hydration Mismatch](https://react.dev/link/hydration-mismatch)

## ✨ Result

The sorting page now hydrates correctly without errors. The initial render shows nothing (or a loading state), then quickly populates with random data once React has hydrated on the client side.

This pattern should be applied to any component that uses:
- `Math.random()`
- `Date.now()`
- `window` object
- Browser-specific APIs
- Any non-deterministic data

---

**Hydration error fixed! The app now renders consistently between server and client.** ✅
