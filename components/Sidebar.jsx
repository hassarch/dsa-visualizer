'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, BarChart2, Link2, GitBranch, Boxes, Search, Sun, Moon, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const NAV = [
  {
    id: 'sorting',
    label: 'Sorting',
    icon: BarChart2,
    path: '/sorting',
    algos: ['Bubble', 'Selection', 'Insertion', 'Merge', 'Quick', 'Heap'],
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    path: '/search',
    algos: ['Binary Search', 'Linear Search'],
  },
  {
    id: 'linked-list',
    label: 'Linked List',
    icon: Link2,
    path: '/linked-list',
    algos: ['Reverse', 'Append', 'Delete'],
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: GitBranch,
    path: '/graph',
    algos: ['BFS', 'DFS'],
  },
  {
    id: 'dp',
    label: 'Dynamic Programming',
    icon: Boxes,
    path: '/dp',
    algos: ['Fibonacci', 'Coin Change', 'Climbing Stairs', '0/1 Knapsack'],
  },
]

export default function Sidebar() {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center py-4 gap-3 border-r"
        style={{ width: 48, background: 'var(--bg-surface)', borderColor: 'var(--border)', flexShrink: 0 }}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <Menu size={18} />
        </button>
        {NAV.map(({ id, icon: Icon, path }) => (
          <button key={id} onClick={() => router.push(path)}
            className="p-2 rounded-lg transition-all"
            style={{
              color: pathname === path ? 'var(--primary)' : 'var(--text-muted)',
              background: pathname === path ? 'rgba(26,86,219,0.15)' : 'transparent'
            }}>
            <Icon size={18} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col border-r"
      style={{ width: 260, background: 'var(--bg-surface)', borderColor: 'var(--border)', flexShrink: 0 }}>
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>DSA Visualizer</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Algorithm Learning</div>
        </div>
        <div className="flex gap-1">
          <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(({ id, label, icon: Icon, path, algos }) => {
          const isActive = pathname === path || pathname?.startsWith(path + '/')
          return (
            <div key={id}>
              <button onClick={() => router.push(path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                style={{
                  background: isActive ? 'rgba(26,86,219,0.12)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                <Icon size={16} />
                <span className="text-sm font-medium flex-1 text-left">{label}</span>
                <ChevronRight size={14} style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {isActive && (
                <div className="pb-1">
                  {algos.map(algo => (
                    <div key={algo} className="pl-11 py-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {algo}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Keyboard Shortcuts</div>
          <div className="flex flex-col gap-0.5">
            {[['Space', 'Play/Pause'], ['← →', 'Step'], ['R', 'Reset']].map(([key, action]) => (
              <div key={key} className="flex justify-between">
                <kbd className="px-1 rounded text-xs"
                  style={{ background: 'var(--border)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {key}
                </kbd>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}