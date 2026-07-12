import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const month = parseInt(req.nextUrl.searchParams.get('month') || '1')
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('birthday_submissions')
    .select('*')
    .eq('birth_month', month)
    .order('birth_day', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}