export default function ProductHuntEmbed() {
  return (
    <div className="flex justify-center my-12 px-4">
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        border: '1px solid rgb(224, 224, 224)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '500px',
        width: '100%',
        background: 'rgb(255, 255, 255)',
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <img
            alt="Repo Diary"
            src="https://ph-files.imgix.net/f6fe687b-5b5e-4fc0-bd50-34232b88ff9b.png?auto=format&fit=crop&w=80&h=80"
            style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'rgb(26, 26, 26)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Repo Diary
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgb(102, 102, 102)', lineHeight: 1.4 }}>
              Your GitHub story, written daily
            </p>
          </div>
        </div>
        <a
          href="https://www.producthunt.com/products/repo-diary?embed=true&utm_source=embed&utm_medium=post_embed"
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '12px',
            padding: '8px 16px',
            background: 'rgb(255, 97, 84)',
            color: 'rgb(255, 255, 255)',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Check it out on Product Hunt →
        </a>
      </div>
    </div>
  )
}
