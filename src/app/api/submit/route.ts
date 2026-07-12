import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabaseServer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const fullName = formData.get('fullName') as string
    const birthMonth = parseInt(formData.get('birthMonth') as string)
    const birthDay = parseInt(formData.get('birthDay') as string)
    const age = parseInt(formData.get('age') as string)
    const email = formData.get('email') as string
    const file = formData.get('file') as File

    if (!fullName || !birthMonth || !birthDay || !age || !email || !file) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = getAdminSupabase()

    // 1. Upload image to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${fullName.replace(/\s+/g, '_')}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('birthday-photos')
      .upload(fileName, file, { contentType: file.type })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
    }

    // 2. Save record to database
    const { error: dbError } = await supabase
      .from('birthday_submissions')
      .insert({
        full_name: fullName,
        birth_month: birthMonth,
        birth_day: birthDay,
        age,
        email,
        image_path: fileName,
      })

    if (dbError) {
      // Rollback: delete uploaded image if DB fails
      await supabase.storage.from('birthday-photos').remove([fileName])
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Database save failed' }, { status: 500 })
    }

    // 3. Send confirmation email (auto-feature)
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const dateStr = `${monthNames[birthMonth - 1]} ${birthDay}`
    await resend.emails.send({
      from: 'Salvation Ministries <onboarding@resend.dev>', // Change to your verified domain later
      to: email,
      subject: '🎉 Birthday Registration Confirmed!',
      html: `
        <h2>Hello ${fullName},</h2>
        <p>We have received your birthday details (<strong>${dateStr}</strong>, age ${age}).</p>
        <p>Watch the church screens on your special day – we will celebrate you!</p>
        <p style="color:#888; font-size:14px;">Glory to God!</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}