export const metadata = {
  title: 'Salvation Ministries Sandfilled 1 - Birthday Registry',
  description: 'Register your birthday for church celebration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}