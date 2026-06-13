'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlayback } from '../../hooks/usePlayback'
import { hashMapInsert, hashMapSearch, hashMapDelete, twoSum, groupAnagrams } from '../../engines/hashMapEngines'
import PlaybackControls from '../../components/PlaybackControls'
import Sidebar from '../../components/Sidebar'
import { ExternalLink, Clock, Zap, BookOpen, Code2 } from 'lucide-react'

const ALGOS = {
  hashMapInsert: {
    label: 'Insert',
    fn: hashMapInsert,
    defaultInput: { pairs: [['name', 'Alice'], ['age', '25'], ['city', 'NYC'], ['lang', 'JS'], ['role', 'Dev']] },
    description: 'Hash the key to find bucket, handle collisions with chaining',
    color: 'var(--sorted)',
    problems: [
      { id: 706, title: 'Design HashMap', difficulty: 'Easy', url: 'https://leetcode.com/problems/design-hashmap/' },
      { id: 1, title: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
    ],
    pseudocode: ['bucket = hash(key) % size', 'chain = buckets[bucket]', 'if key exists: update', 'else: chain.append((key, val))'],
    complexity: { time: 'O(1) avg', space: 'O(n)', note: 'O(n) worst case with all collisions' },
  },
  hashMapSearch: {
    label: 'Search',
    fn: hashMapSearch,
    defaultInput: { pairs: [['name', 'Alice'], ['age', '25'], ['city', 'NYC'], ['lang', 'JS']], searchKey: 'city' },
    description: 'Hash the key, go to bucket, scan chain for matching key',
    color: 'var(--current)',
    problems: [
      { id: 706, title: 'Design HashMap', difficulty: 'Easy', url: 'https://leetcode.com/problems/design-hashmap/' },
    ],
    pseudocode: ['bucket = hash(key) % size', 'for item in buckets[bucket]:', '  if item.key == key:', '    return item.value', 'return null'],
    complexity: { time: 'O(1) avg', space: 'O(1)', note: 'O(n) worst if many collisions' },
  },
  hashMapDelete: {
    label: 'Delete',
    fn: hashMapDelete,
    defaultInput: { pairs: [['name', 'Alice'], ['age', '25'], ['city', 'NYC'], ['lang', 'JS']], deleteKey: 'age' },
    description: 'Find item in bucket chain and remove it',
    color: 'var(--swap)',
    problems: [
      { id: 706, title: 'Design HashMap', difficulty: 'Easy', url: 'https://leetcode.com/problems/design-hashmap/' },
    ],
    pseudocode: ['bucket = hash(key) % size', 'chain = buckets[bucket]', 'remove item where item.key == key'],
    complexity: { time: 'O(1) avg', space: 'O(1)', note: 'Splice from chain array' },
  },
  twoSum: {
    label: 'Two Sum',
    fn: twoSum,
    defaultInput: { nums: [2, 7, 11, 15, 3, 6], target: 9 },
    description: 'Store complements in hash map for O(n) lookup instead of O(n²)',
    color: 'var(--compare)',
    problems: [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { id: 167, title: 'Two Sum II', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
    ],
    pseudocode: ['map = {}', 'for i, num in enumerate(nums):', '  complement = target - num', '  if complement in map:', '    return [map[complement], i]', '  map[num] = i'],
    complexity: { time: 'O(n)', space: 'O(n)', note: 'vs O(n²) brute force' },
  },
  groupAnagrams: {
    label: 'Group Anagrams',
    fn: groupAnagrams,
    defaultInput: { words: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
    description: 'Sort each word as the hash key — anagrams share the same sorted form',
    color: 'var(--visited)',
    problems: [
      { id: 49, title: 'Group Anagrams', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { id: 242, title: 'Valid Anagram', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-anagram/' },
    ],
    pseudocode: ['map = defaultdict(list)', 'for word in words:', '  key = sorted(word)', '  map[key].append(word)', 'return map.values()'],
    complexity: { time: 'O(n·k·log k)', space: 'O(n·k)', note: 'k = max word length' },
  },
}

const NUM_BUCKETS = 8
const difficultyColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
const difficultyBg = { Easy: 'rgba(16,185,129,0.08)', Medium: 'rgba(245,158,11,0.08)', Hard: 'rgba(239,68,68,0.08)' }

export default function HashMapPage() {
  const [algoKey, setAlgoKey] = useState('hashMapInsert')
  const [input, setInput] = useState(ALGOS.hashMapInsert.defaultInput)

  const algo = ALGOS[algoKey]
  const genFn = useCallback((inp) => ALGOS[algoKey].fn(inp), [algoKey])
  const playback = usePlayback(genFn, input)
  const frame = playback.currentFrame

  function handleAlgoChange(key) {
    setAlgoKey(key)
    setInput(ALGOS[key].defaultInput)
    playback.reset()
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') { e.preventDefault(); playback.isPlaying ? playback.pause() : playback.play() }
      if (e.code === 'ArrowRight') playback.stepForward()
      if (e.code === 'ArrowLeft') playback.stepBack()
      if (e.code === 'KeyR') playback.reset()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [playback])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          
          {/* Toolbar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {Object.entries(ALGOS).map(([key, { label, color }]) => (
              <button key={key} onClick={() => handleAlgoChange(key)} style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid',
                borderColor: algoKey === key ? color : 'var(--border)',
                background: algoKey === key ? `${color}18` : 'transparent',
                color: algoKey === key ? color : 'var(--text-secondary)',
                fontSize: 12, fontWeight: algoKey === key ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>

          {/* Description */}
          <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: algo.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{algo.description}</span>
          </div>

          {/* Hash map canvas */}
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-canvas)', padding: 24 }}>
            <HashMapCanvas frame={frame} algoKey={algoKey} algo={algo} />
          </div>

          <PlaybackControls playback={playback} />
        </div>

        {/* Info panel */}
        <div style={{ width: 300, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <HashMapInfoPanel algo={algo} currentFrame={frame} />
        </div>
      </div>
    </div>
  )
}

// ─── Hash Map Canvas ──────────────────────────────────────────────────────────

function HashMapCanvas({ frame, algoKey, algo }) {
  const buckets = frame?.buckets ?? Array.from({ length: NUM_BUCKETS }, () => [])
  const activeBucket = frame?.activeBucket
  const activeKey = frame?.activeKey
  const hashVal = frame?.hashVal
  const foundIdx = frame?.foundIdx
  const checkIdx = frame?.checkIdx
  const nums = frame?.nums
  const current = frame?.current
  const complement = frame?.complement
  const foundPair = frame?.foundPair
  const groups = frame?.groups
  const words = frame?.words

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
      
      {/* Hash function display */}
      {activeKey !== null && activeKey !== undefined && hashVal !== null && hashVal !== undefined && (
        <div style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>hash function:</span>
          <code style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--current)' }}>
            hash("{activeKey}") = sum(charCodes) % {NUM_BUCKETS} = <strong>{hashVal}</strong>
          </code>
        </div>
      )}

      {/* Two Sum nums display */}
      {nums && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Array:</span>
          {nums.map((n, i) => {
            const isCurrent = i === current
            const isFound = foundPair?.includes(i)
            const c = isFound ? 'var(--sorted)' : isCurrent ? 'var(--compare)' : 'var(--primary)'
            return (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, background: `${c}18`, border: `2px solid ${c}`, color: c, transition: 'all 0.2s' }}>
                {n}
              </div>
            )
          })}
          {complement !== null && complement !== undefined && (
            <div style={{ marginLeft: 12, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(245,158,11,0.1)', color: 'var(--compare)', border: '1px solid rgba(245,158,11,0.3)' }}>
              looking for: {complement}
            </div>
          )}
          {foundPair && (
            <div style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: 'var(--sorted)', border: '1px solid rgba(16,185,129,0.3)' }}>
              ✓ [{foundPair[0]}, {foundPair[1]}]
            </div>
          )}
        </div>
      )}

      {/* Words display for group anagrams */}
      {words && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Words:</span>
          {words.map((w, i) => (
            <div key={i} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, background: i === frame?.current ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)', color: i === frame?.current ? 'var(--compare)' : 'var(--text-secondary)', border: `1px solid ${i === frame?.current ? 'var(--compare)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Bucket visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 60, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bucket</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contents (chaining)</div>
        </div>

        {buckets.map((chain, i) => {
          const isActive = i === activeBucket
          const isTarget = i === hashVal

          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Bucket index */}
              <div style={{
                width: 60, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, flexShrink: 0,
                background: isActive ? `${algo.color}18` : 'var(--bg-elevated)',
                border: `2px solid ${isActive ? algo.color : 'var(--border)'}`,
                color: isActive ? algo.color : 'var(--text-muted)',
                boxShadow: isActive ? `0 0 12px ${algo.color}44` : 'none',
                transition: 'all 0.3s',
              }}>
                [{i}]
              </div>

              {/* Chain */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, minHeight: 40, padding: '4px 8px', borderRadius: 8, background: isActive ? `${algo.color}08` : 'var(--bg-elevated)', border: `1px solid ${isActive ? algo.color : 'var(--border)'}44`, transition: 'all 0.3s' }}>
                {chain.length === 0 ? (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>empty</span>
                ) : (
                  chain.map(([k, v], chainIdx) => {
                    const isFound = isActive && foundIdx === chainIdx
                    const isChecking = isActive && checkIdx === chainIdx
                    const isDeleting = isActive && frame?.deleteIdx === chainIdx
                    const c = isFound ? 'var(--sorted)' : isDeleting ? 'var(--swap)' : isChecking ? 'var(--compare)' : isActive ? algo.color : 'var(--text-secondary)'

                    return (
                      <div key={chainIdx} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {chainIdx > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>}
                        <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', background: `${c}18`, border: `1px solid ${c}44`, color: c, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                          {Array.isArray(v) ? `"${k}": [${v.join(', ')}]` : `"${k}": "${v}"`}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Group anagrams result */}
      {groups && Object.keys(groups).length > 0 && (
        <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Anagram Groups</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(groups).map(([key, group]) => (
              <div key={key} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>key: "{key}"</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {group.map((w, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, background: 'rgba(167,139,250,0.15)', color: 'var(--visited)', border: '1px solid rgba(167,139,250,0.3)' }}>{w}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function HashMapInfoPanel({ algo, currentFrame }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--bg-surface)' }}>
      
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Zap size={12} color="var(--current)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Step</span>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, minHeight: 52, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderLeft: '3px solid var(--current)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {currentFrame?.label || <span style={{ color: 'var(--text-muted)' }}>Press Play to begin →</span>}
        </div>
      </div>

      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Code2 size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pseudocode</span>
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-canvas)' }}>
          {algo.pseudocode.map((line, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', gap: 12, borderBottom: i < algo.pseudocode.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Clock size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--compare)' }}>{algo.complexity.time}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Space</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--visited)' }}>{algo.complexity.space}</div>
          </div>
        </div>
        {algo.complexity.note && (
          <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', fontSize: 11, color: 'var(--current)' }}>
            💡 {algo.complexity.note}
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <BookOpen size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LeetCode Problems</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {algo.problems.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>#{p.id} </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: difficultyBg[p.difficulty], color: difficultyColor[p.difficulty] }}>{p.difficulty}</span>
                <ExternalLink size={11} color="var(--text-muted)" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
