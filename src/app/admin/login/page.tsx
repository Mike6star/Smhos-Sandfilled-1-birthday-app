'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Submission = {
  id: string
  full_name: string
  birth_month: number
  birth_day: number
  age: number
  email: string
  image_path: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [downloading, setDownloading] = useState(false)
  const [reminding, setReminding] = useState<string | null>(null)

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (!data.session) router.push('/admin/login')
    })
  }, [])

  // Fetch submissions when month changes
  useEffect(() => {
    if (!session) return
    const fetchData = async () => {
      const res = await fetch(`/api/admin/submissions?month=${month}`)
      const data = await res.json()
      setSubmissions(data)
    }
    fetchData()
  }, [month, session])

  const handleDownloadZIP = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/admin/download-zip?month=${month}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `birthday-photos-month-${month}.zip`
      a.click()
    } catch (err) {
      alert('Failed to download ZIP')
    } finally {
      setDownloading(false)
    }
  }

  const handleExportCSV = async () => {
    const res = await fetch(`/api/admin/export-csv?month=${month}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `birthday-list-month-${month}.csv`
    a.click()
  }

  const handleRemind = async (email: string, name: string) => {
    if (!confirm(`Send reminder to ${name}?`)) return
    setReminding(email)
    try {
      await fetch('/api/admin/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, month }),
      })
      alert('Reminder sent!')
    } catch {
      alert('Failed to send.')
    } finally {
      setReminding(null)
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!session) return null

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏛️ Admin Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: 8, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '20px 0' }}>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          style={{ padding: 10, fontSize: 16 }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{monthNames[m-1]}</option>
          ))}
        </select>

        <button
          onClick={handleDownloadZIP}
          disabled={downloading || submissions.length === 0}
          style={{ padding: '10px 20px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {downloading ? 'Zipping...' : '📥 Download ZIP'}
        </button>

        <button
          onClick={handleExportCSV}
          style={{ padding: '10px 20px', background: '#34a853', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          📊 Export CSV
        </button>
      </div>

      <div style={{ background: '#f0f4f9', padding: 12, borderRadius: 8, marginBottom: 20 }}>
        <strong>Status:</strong> {submissions.length} member{submissions.length !== 1 ? 's' : ''} registered for {monthNames[month-1]}.
        {submissions.length === 0 && <span style={{ color: '#d93025' }}> ⚠️ No submissions yet – announce from pulpit!</span>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#e8eaed' }}>
          <tr>
            <th style={{ padding: 10, textAlign: 'left' }}>#</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Full Name</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Birth Date</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Age</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Photo</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 8 }}>{idx + 1}</td>
              <td style={{ padding: 8 }}>{s.full_name}</td>
              <td style={{ padding: 8 }}>{monthNames[s.birth_month-1]} {s.birth_day}</td>
              <td style={{ padding: 8 }}>{s.age}</td>
              <td style={{ padding: 8 }}>{s.email}</td>
              <td style={{ padding: 8 }}>
                <a
                  href={`/api/admin/view-image?path=${encodeURIComponent(s.image_path)}`}
                  target="_blank"
                  style={{ color: '#1a73e8' }}
                >
                  📷 View
                </a>
              </td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() => handleRemind(s.email, s.full_name)}
                  disabled={reminding === s.email}
                  style={{ padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
                >
                  {reminding === s.email ? 'Sending...' : '📧 Remind'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}