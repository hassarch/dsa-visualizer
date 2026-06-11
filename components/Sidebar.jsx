'use client'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart2, Link2, GitBranch, Boxes, Search, Sun, Moon, Menu, X, ChevronRight, Zap } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const NAV = [
  { id: 'sorting', label: 'Sorting', icon: BarChart2, path: '/sorting', algos: ['Bubble', 'Selection', 'Insertion', 'Merge', 'Quick', 'Heap'] },
  { id: 'search', label: 'Search', icon: Search, path: '/search', algos: ['Binary Search', 'Linear Search'] },
  { id: 'linked-list', label: 'Linked List', icon: Link2, path: '/linked-list', algos: ['Reverse', 'Append', 'Delete'] },
  { id: 'graph', label: 'Graph', icon: GitBranch, path: '/graph', algos: ['BFS', 'DFS'] },
  { id: 'dp', label: 'Dynamic Programming', icon: Boxes, path: '/dp', algos: ['Fibonacci', 'Coin Change', 'Climbing Stairs', 'Knapsack'] },
]

export default function Sidebar() {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  if (!sidebarOpen) {
    return (
      <div style={{
        width: 52, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          width: 36, height: 36, borderRadius: 8, border: 'none', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 8
        }}>
          <Menu size={18} />
        </button>
        {NAV.map(({ id, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <button key={id} onClick={() => router.push(path)} title={id} style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: isActive ? 'var(--primary-glow)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}>
              <Icon size={17} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      width: 248, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>DSA Visualizer</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Algorithm Learning</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={toggleTheme} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => setSidebarOpen(false)} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Visualizers
        </div>
        {NAV.map(({ id, label, icon: Icon, path, algos }) => {
          const isActive = pathname === path
          return (
            <div key={id}>
              <button onClick={() => router.push(path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.15s', textAlign: 'left'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'var(--bg-elevated)'
                }}>
                  <Icon size={14} />
                </div>
                <span style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, flex: 1 }}>{label}</span>
                <ChevronRight size={12} style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }} />
              </button>
              {isActive && (
                <div style={{ paddingBottom: 4 }}>
                  {algos.map(algo => (
                    <div key={algo} style={{ padding: '3px 16px 3px 54px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {algo}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Keyboard Shortcuts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['Space', 'Play / Pause'], ['← →', 'Step through'], ['R', 'Reset']].map(([key, action]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <kbd style={{
                padding: '2px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)'
              }}>{key}</kbd>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}