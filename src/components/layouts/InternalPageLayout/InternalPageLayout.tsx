import { ReactNode } from 'react'

interface InternalPageLayoutProps {
  children: ReactNode
  className?: string
}

export function InternalPageLayout({ children, className = '' }: InternalPageLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      {children}
    </div>
  )
}
