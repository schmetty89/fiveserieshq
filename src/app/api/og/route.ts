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
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
        },
        children: [
          // Top bar
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: '#0055b3', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    },
                    children: {
                      type: 'span',
                      props: {
                        style: { color: 'white', fontWeight: 900, fontSize: '22px', fontStyle: 'italic' },
                        children: 'M',
                      },
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { color: 'rgba(255,255,255,0.5)', fontSize: '18px', letterSpacing: '2px' },
                    children: 'FIVESERIESHQ.COM',
                  },
                },
                genColor ? {
                  type: 'div',
                  props: {
                    style: {
                      marginLeft: 'auto',
                      background: genColor.bg,
                      color: genColor.text,
                      padding: '6px 16px',
                      borderRadius: '999px',
                      fontSize: '16px',
                      fontWeight: 700,
                    },
                    children: gen,
                  },
                } : null,
              ].filter(Boolean),
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      color: 'white',
                      fontSize: title.length > 50 ? '42px' : '54px',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: '-1px',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: 'rgba(255,255,255,0.5)', fontSize: '24px', lineHeight: 1.4 },
                    children: sub,
                  },
                },
              ],
            },
          },
          // Bottom bar
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '24px',
                gap: '32px',
              },
              children: ['Forums', 'Builds', 'Technical info', 'Videos', 'Vendors', 'Events'].map(item => ({
                type: 'span',
                props: {
                  style: { color: 'rgba(255,255,255,0.3)', fontSize: '16px' },
                  children: item,
                },
              })),
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  )
}
