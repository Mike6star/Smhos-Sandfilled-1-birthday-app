import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, name, month } = await req.json()
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  await resend.emails.send({
    from: 'Salvation Ministries <onboarding@resend.dev>',
    to: email,
    subject: '📸 Don\'t forget your birthday photo!',
    html: `
      <h2>Dear ${name},</h2>
      <p>We noticed you registered for the <strong>${monthNames[month-1]}</strong> birthday celebration.</p>
      <p>If you haven't uploaded your photo yet, please do so now at:</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Click here to submit</a></p>
      <p style="color:#888;">We want to feature you on the big screen!</p>
    `,
  })

  return NextResponse.json({ success: true })
}