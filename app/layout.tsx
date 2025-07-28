import type { Metadata } from 'next'
import './globals.css'
import { Header } from '../src/components/common/Header'
import { ConditionalHeader } from '../src/components/common/ConditionalHeader/ConditionalHeader'

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
      <body>
        <ConditionalHeader />
        {children}
      </body>
    </html>
  )
}
