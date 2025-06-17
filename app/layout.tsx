import type { Metadata } from 'next'
import '../app/globals.css'

export const metadata: Metadata = {
  title: 'Asamblea Regional de los Testigos de Jehová',
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
