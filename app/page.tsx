export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      color: 'var(--text-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
          DSA Visualizer
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Algorithm learning platform — coming soon
        </p>
      </div>
    </main>
  )
}