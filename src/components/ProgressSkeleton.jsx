function Block({ width = '100%', height, radius = 12, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background: 'rgba(255,255,255,0.05)',
      ...style,
    }} />
  )
}

export default function ProgressSkeleton() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 56 }}>
        {[1, 2, 3, 4].map(i => <Block key={i} height={90} style={{ flex: 1 }} />)}
      </div>

      {/* Charts */}
      <Block width={180} height={12} radius={4} style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 56 }}>
        <Block height={240} />
        <Block height={240} />
      </div>

      {/* Heatmap */}
      <Block width={160} height={12} radius={4} style={{ marginBottom: 16 }} />
      <Block height={180} style={{ marginBottom: 56 }} />

      {/* Module grid */}
      <Block width={140} height={12} radius={4} style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => <Block key={i} height={150} />)}
      </div>
    </div>
  )
}
