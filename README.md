# DSA Visualizer

An interactive web-based visualizer for Data Structures and Algorithms. Built with Next.js and React, this tool helps students and developers understand algorithmic concepts through step-by-step visual animations.

## Features

### Data Structures
- **Arrays**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort
- **Linked Lists**: Insert, Delete, Reverse, Detect Cycle, Find Middle, Check Palindrome
- **Stacks & Queues**: Push, Pop, Enqueue, Dequeue, Valid Parentheses, Next Greater Element
- **Binary Trees**: BST Insert, BST Search, Inorder, Preorder, Postorder, Level Order, Tree Height
- **Hash Maps**: Two Sum, Group Anagrams, Frequency Counter
- **Graphs**: BFS, DFS, Dijkstra, Topological Sort, Cycle Detection, Connected Components

### Search Algorithms
- Linear Search
- Binary Search

### Dynamic Programming
- Fibonacci Sequence
- Climbing Stairs
- Coin Change
- 0/1 Knapsack

### Interactive Features
- **Step-by-step Playback**: Play, pause, step forward, step backward through algorithm execution
- **Speed Control**: Adjust animation speed (0.25x to 4x)
- **Custom Inputs**: Modify input data for most algorithms
- **Graph Builder**: Create custom graphs by adding nodes and connecting edges
- **Real-time Visualization**: See data structures change as algorithms execute
- **Code Display**: View pseudocode alongside visualizations
- **Complexity Analysis**: Time and space complexity for each algorithm
- **LeetCode Integration**: Direct links to related practice problems

## Technology Stack

- **Framework**: Next.js 16.2.9
- **UI Library**: React 19.2.4
- **State Management**: Zustand 5.0.14
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React 1.17.0
- **Language**: JavaScript/TypeScript

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dsa-visualizer.git
cd dsa-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dsa-visualizer/
├── app/                      # Next.js app directory
│   ├── arrays/              # Array visualizations
│   ├── binary-tree/         # Binary tree visualizations
│   ├── dp/                  # Dynamic programming visualizations
│   ├── graph/               # Graph algorithm visualizations
│   ├── hash-map/            # Hash map visualizations
│   ├── linked-list/         # Linked list visualizations
│   ├── search/              # Search algorithm visualizations
│   ├── sorting/             # Sorting algorithm visualizations
│   ├── stack-queue/         # Stack and queue visualizations
│   ├── layout.js            # Root layout component
│   ├── page.js              # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── InfoPanel.jsx        # Algorithm information panel
│   ├── PlaybackControls.jsx # Playback control buttons
│   └── Sidebar.jsx          # Navigation sidebar
├── data/                    # Static data and configuration
│   └── problemMap.js        # Algorithm metadata and LeetCode links
├── engines/                 # Algorithm implementations
│   ├── arrayEngines.js      # Array operation algorithms
│   ├── binaryTreeEngines.js # Binary tree algorithms
│   ├── dpEngines.js         # Dynamic programming algorithms
│   ├── graphEngines.js      # Graph algorithms
│   ├── linkedListEngines.js # Linked list algorithms
│   ├── searchEngines.js     # Search algorithms
│   └── sortingEngines.js    # Sorting algorithms
├── hooks/                   # Custom React hooks
│   └── usePlayback.js       # Playback control logic
├── store/                   # State management
│   └── useAppStore.js       # Zustand store
└── public/                  # Static assets
```

## Usage Guide

### Basic Navigation
1. Use the sidebar to navigate between different data structures and algorithms
2. Select an algorithm from the toolbar
3. Customize input data if needed
4. Click "Play" to start the visualization

### Playback Controls
- **Play/Pause**: Start or pause the animation
- **Step Forward**: Move to the next step
- **Step Back**: Return to the previous step
- **Reset**: Return to the initial state
- **Speed Control**: Adjust animation speed using the slider

### Keyboard Shortcuts
- `Space`: Play/Pause
- `Right Arrow`: Step forward
- `Left Arrow`: Step back
- `R`: Reset

### Graph Builder
1. Navigate to the Graph section
2. Click "Build Graph" button
3. Click "+ Add Node" and click on canvas to place nodes
4. Click "+ Add Edge" and select two nodes to connect them
5. Delete nodes or edges using the × button
6. Click "Reset to Default" to restore the original graph

## Algorithm Implementations

All algorithms are implemented as JavaScript generator functions that yield frame-by-frame state updates. This architecture enables:
- Step-by-step execution control
- Bidirectional playback (forward and backward)
- Frame caching for performance
- Smooth animations with configurable speed

Example algorithm structure:
```javascript
export function* bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      yield { array: [...arr], comparing: [j, j + 1] }
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        yield { array: [...arr], swapping: [j, j + 1] }
      }
    }
  }
  yield { array: [...arr], sorted: true }
}
```

## Customization

### Adding New Algorithms

1. Create a generator function in the appropriate engine file:
```javascript
// engines/sortingEngines.js
export function* newSortingAlgorithm(arr) {
  // Implementation with yield statements
}
```

2. Register the algorithm in the page component:
```javascript
// app/sorting/page.jsx
const ALGOS = {
  newSort: { 
    label: 'New Sort', 
    fn: newSortingAlgorithm,
    // ... other metadata
  }
}
```

3. Add algorithm metadata to problemMap:
```javascript
// data/problemMap.js
export const PSEUDOCODE = {
  newSort: ['line 1', 'line 2', 'line 3']
}

export const COMPLEXITY = {
  newSort: { time: 'O(n log n)', space: 'O(n)' }
}
```

### Styling
The project uses Tailwind CSS with custom color variables defined in `globals.css`. Modify the CSS variables to change the theme:

```css
:root {
  --primary: #ffffff;
  --sorted: #10B981;
  --current: #38BDF8;
  /* ... more variables */
}
```

## Performance Considerations

- Algorithms use generator functions for lazy evaluation
- Frame data is cached using `useRef` to avoid re-computation
- SVG rendering is optimized with CSS transitions
- State updates are batched for smooth animations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-algorithm`)
3. Commit your changes (`git commit -m 'Add new sorting algorithm'`)
4. Push to the branch (`git push origin feature/new-algorithm`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure and naming conventions
- Add comments for complex logic
- Test algorithms thoroughly with edge cases
- Update documentation when adding new features
- Ensure responsive design on all screen sizes

## Known Issues

- Some algorithms may not work correctly with empty inputs
- Graph builder node positioning may need manual adjustment for optimal layout
- Performance may degrade with very large datasets (1000+ elements)

## Future Enhancements

- [ ] Add more graph algorithms (A*, Bellman-Ford, Floyd-Warshall)
- [ ] Implement advanced tree structures (AVL, Red-Black, B-Tree)
- [ ] Add string algorithms (KMP, Rabin-Karp, Z-algorithm)
- [ ] Export visualizations as video or GIF
- [ ] Save and share custom inputs via URL
- [ ] Dark/Light theme toggle
- [ ] Mobile touch support for graph builder
- [ ] Undo/Redo for graph editing
- [ ] Weighted and directed edge support
- [ ] Algorithm comparison mode (side-by-side)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by VisuAlgo, Algorithm Visualizer, and similar educational tools
- LeetCode for problem references and practice questions
- Next.js team for the excellent framework
- React team for the UI library


## Resources

- [Algorithm Visualizations](https://www.cs.usfca.edu/~galles/visualization/Algorithms.html)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
- [LeetCode](https://leetcode.com/)
- [GeeksforGeeks](https://www.geeksforgeeks.org/)

---

**Star this repository if you find it helpful!**
