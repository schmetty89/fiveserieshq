import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'The Five Series HQ'
  const sub = searchParams.get('sub') || 'The definitive BMW 5 Series community'
  const gen = searchParams.get('gen') || ''

  const GEN_COLORS: Record<string, { bg: string; text: string }> = {
    E34: { bg: '#FAECE7', text: '#993C1D' },
    E39: { bg: '#E6F1FB', text: '#185FA5' },
    E60: { bg: '#EEEDFE', text: '#534AB7' },
    F10: { bg: '#E1F5EE', text: '#0F6E56' },
    G30: { bg: '#FAEEDA', text: '#854F0B' },
  }

  const genColor = gen && GEN_COLORS[gen] ? GEN_COLORS[gen] : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#0055b3', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '22px', fontStyle: 'italic' }}>M</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', letterSpacing: '2px' }}>
            FIVESERIESHQ.COM
          </span>
          {genColor && (
            <div style={{
              marginLeft: 'auto',
              background: genColor.bg,
              color: genColor.text,
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 700,
            }}>
              {gen}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1 style={{
            color: 'white',
            fontSize: title.length > 50 ? '42px' : '54px',
            fontWeight: 900,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: '-1px',
          }}>
            {title}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '24px',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {sub}
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          gap: '32px',
        }}>
          {['Forums', 'Builds', 'Technical info', 'Videos', 'Vendors', 'Events'].map(item => (
            <span key={item} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
