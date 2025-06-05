import type { Metadata } from 'next'
import '../app/globals.css'

export const metadata: Metadata = {
  title: '"Adoración Pura" Asamblea Regional 2025',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
