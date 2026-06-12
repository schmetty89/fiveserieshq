import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Redirect to a static OG image hosted in Supabase storage
// Replace this URL once you upload an OG image to your Supabase hero-images bucket
export async function GET(_request: NextRequest) {
  return NextResponse.redirect(
    'https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png',
    { status: 302 }
  )
}
