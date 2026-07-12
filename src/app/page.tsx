'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    birthMonth: '',
    birthDay: '',
    age: '',
    email: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Validate image type
    if (!selected.type.startsWith('image/')) {
      alert('Please upload an image file (JPG or PNG).')
      return
    }

    // Client-side dimension validation using Image object
    const img = new Image()
    img.onload = () => {
      if (img.width < 1080 || img.height < 1080) {
        alert('Image must be at least 1080x1080 pixels for TV quality.')
        return
      }
      if (img.width !== img.height) {
        alert('Please upload a square (1:1) image. We recommend a square crop.')
        return
      }
      // All good
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
    img.src = URL.createObjectURL(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please upload your photo.')
      return
    }
    if (!form.fullName || !form.birthMonth || !form.birthDay || !form.age || !form.email) {
      alert('Please fill in all fields.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('fullName', form.fullName)
    formData.append('birthMonth', form.birthMonth)
    formData.append('birthDay', form.birthDay)
    formData.append('age', form.age)
    formData.append('email', form.email)
    formData.append('file', file)

    try {
      const res = await fetch('/api/submit', { method: 'POST', body: formData })
      if (res.ok) {
        router.push('/success')
      } else {
        const err = await res.json()
        alert('Submission failed: ' + err.error)
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>🎉 Birthday Registry</h1>
      <p style={{ textAlign: 'center', color: '#555' }}>
        Upload your details so we can celebrate you on the big screen!
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Full Name *"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            value={form.birthMonth}
            onChange={(e) => setForm({ ...form, birthMonth: e.target.value })}
            required
            style={{ flex: 1, padding: 12 }}
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={form.birthDay}
            onChange={(e) => setForm({ ...form, birthDay: e.target.value })}
            required
            style={{ flex: 1, padding: 12 }}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <input
          type="number"
          placeholder="Age (e.g., 30) *"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <input
          type="email"
          placeholder="Your Email (for confirmation) *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <div
          style={{
            border: '2px dashed #aaa',
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
          ) : (
            <div>
              <p>📸 Click to upload your photo</p>
              <small style={{ color: '#888' }}>Square (1:1) • Min 1080×1080px • JPG/PNG</small>
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" required />
          I agree to have my photo displayed on church TV screens.
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 14,
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : '🚀 Submit Birthday'}
        </button>
      </form>
    </div>
  )
}