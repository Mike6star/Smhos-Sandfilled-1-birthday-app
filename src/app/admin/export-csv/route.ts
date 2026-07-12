import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const month = parseInt(req.nextUrl.searchParams.get('month') || '1')
  const supabase = getAdminSupabase()
  const { data } = await supabase
    .from('birthday_submissions')
    .select('full_name, birth_month, birth_day, age, email')
    .eq('birth_month', month)
    .order('birth_day')

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No data' }, { status: 404 })
  }

  const headers = 'Full Name,Birth Date,Age,Email\n'
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const rows = data.map(r =>
    `${r.full_name},${monthNames[r.birth_month-1]} ${r.birth_day},${r.age},${r.email}`
  ).join('\n')

  const csv = headers + rows
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=birthday-list-month-${month}.csv`,
    },
  })
}