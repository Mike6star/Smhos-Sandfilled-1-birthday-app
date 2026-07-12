export default function SuccessPage() {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: 20 }}>
      <h1 style={{ fontSize: 48 }}>🙌</h1>
      <h2>Thank You!</h2>
      <p style={{ fontSize: 18 }}>
        Your birthday has been registered. Watch out for your face on the big screen!
        <br />
        <small style={{ color: '#666' }}>A confirmation email has been sent to you.</small>
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#1a73e8' }}>
        ← Register another family member
      </a>
    </div>
  )
}