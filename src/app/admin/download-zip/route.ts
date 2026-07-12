import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabaseServer'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function GET(req: NextRequest) {
  const month = parseInt(req.nextUrl.searchParams.get('month') || '1')
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('birthday_submissions')
    .select('*')
    .eq('birth_month', month)

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'No submissions' }, { status: 404 })
  }

  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = new Readable({ read() {} })
  archive.pipe(stream)

  for (const record of data) {
    // Get signed URL for each image
    const { data: urlData } = await supabase.storage
      .from('birthday-photos')
      .createSignedUrl(record.image_path, 60) // 60 seconds

    if (urlData?.signedUrl) {
      const response = await fetch(urlData.signedUrl)
      const buffer = await response.arrayBuffer()
      const fileName = `${record.full_name.replace(/\s+/g, '_')}.jpg`
      archive.append(Buffer.from(buffer), { name: fileName })
    }
  }

  await archive.finalize()

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=birthday-photos-month-${month}.zip`,
    },
  })
}