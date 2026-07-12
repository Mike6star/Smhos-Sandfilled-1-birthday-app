import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  if (!path) return new NextResponse('Missing path', { status: 400 })

  const supabase = getAdminSupabase()
  const { data } = await supabase.storage
    .from('birthday-photos')
    .createSignedUrl(path, 60)

  if (!data?.signedUrl) return new NextResponse('Not found', { status: 404 })
  return NextResponse.redirect(data.signedUrl)
}