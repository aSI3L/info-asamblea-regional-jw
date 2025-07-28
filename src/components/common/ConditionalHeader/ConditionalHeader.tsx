"use client"

import { usePathname } from 'next/navigation'
import { Header } from '../Header'

// Rutas donde NO se debe mostrar el header
const ROUTES_WITHOUT_HEADER = ['/']

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // No mostrar header en rutas específicas
  if (ROUTES_WITHOUT_HEADER.includes(pathname)) {
    return null
  }
  
  return <Header />
}
