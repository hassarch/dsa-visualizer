'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowDownNarrowWide, Search, GitBranch, LayoutGrid, Layers, Settings, Menu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const NAV = [
  { id: 'sorting', label: 'Sorting', icon: ArrowDownNarrowWide, path: '/sorting' },
  { id: 'search', label: 'Searching', icon: Search, path: '/search' },
  { id: 'graph', label: 'Graph Algorithms', icon: GitBranch, path: '/graph' },
  { id: 'dp', label: 'Dynamic Programming', icon: LayoutGrid, path: '/dp' },
  { id: 'linked-list', label: 'Linked List', icon: Layers, path: '/linked-list' },
]

export default function Sidebar() {
  const { theme, sidebarOpen, setSidebarOpen } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  if (!sidebarOpen) {
    return (
      <div style={{
        width: 64, background: '#000000', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 8, flexShrink: 0
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          width: 40, height: 40, borderRadius: 8, border: 'none', background: 'transparent',
          color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16
        }}>
          <Menu size={20} />
        </button>
        {NAV.map(({ id, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <button key={id} onClick={() => router.push(path)} title={id} style={{
              width: 40, height: 40, borderRadius: 8, border: 'none',
              background: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#000000' : '#71717a',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}>
              <Icon size={18} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{
      width: 256, background: '#000000', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
      padding: '24px 16px', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0px 8px', marginBottom: 32 }}>
          <Layers size={20} color="#ffffff" style={{ strokeWidth: 2.5 }} />
          <span style={{
            fontWeight: 700, fontSize: 13, color: '#ffffff',
            letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            DSA Visualizer
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NAV.map(({ id, label, icon: Icon, path }) => {
            const isActive = pathname === path
            return (
              <button key={id} onClick={() => router.push(path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', border: 'none', cursor: 'pointer', borderRadius: 8,
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#000000' : '#a1a1aa',
                transition: 'all 0.15s', textAlign: 'left',
                textTransform: 'uppercase', fontSize: 11, fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.05em'
              }}>
                <Icon size={16} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ borderTop: '1px solid var(--border)', margin: '12px 4px 16px 4px' }} />
        
        <button onClick={() => router.push('/search')} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', border: 'none', cursor: 'pointer', borderRadius: 8,
          background: 'transparent', color: '#a1a1aa', transition: 'all 0.15s', textAlign: 'left',
          textTransform: 'uppercase', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em'
        }}>
          <Search size={16} />
          <span>Search</span>
        </button>

        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', border: 'none', borderRadius: 8,
          background: 'transparent', color: '#71717a', textAlign: 'left',
          textTransform: 'uppercase', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em',
          cursor: 'default'
        }}>
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}