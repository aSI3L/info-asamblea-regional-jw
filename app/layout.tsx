import type { Metadata } from 'next'
import './globals.css'
import { ConditionalHeader } from '../src/components/common/ConditionalHeader/ConditionalHeader'
import '../app/globals.css'
import { DataLoader } from '@/components/common/DataLoader/DataLoader'

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
      <body>
        <ConditionalHeader />
        <DataLoader>
          {children}
        </DataLoader>
      </body>
    </html>
  )
}
