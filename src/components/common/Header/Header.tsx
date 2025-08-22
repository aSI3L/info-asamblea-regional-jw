// src/components/common/Header/Header.tsx
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.scss' // Si usas SCSS
// O puedes usar className directamente con Tailwind

interface HeaderProps {
  title?: string
  showNavigation?: boolean
  className?: string
}

export function Header({ 
  title = "Asamblea Regional", 
  showNavigation = true,
  className = ""
}: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        {/* Logo/Title */}
        <Link href="/" className={styles.logo}>
          <h1>{title}</h1>
        </Link>

        {/* Navigation */}
        {showNavigation && (
          <nav className={styles.nav}>
            <Link 
              href="/" 
              className={pathname === '/' ? styles.active : ''}
            >
              Inicio
            </Link>
            <Link 
              href="/consultas" 
              className={pathname === '/consultas' ? styles.active : ''}
            >
              Consultas
            </Link>
            <Link 
              href="/mapa-interno" 
              className={pathname === '/mapa-interno' ? styles.active : ''}
            >
              Mapa Interno
            </Link>
            <Link 
              href="/servicios" 
              className={pathname === '/servicios' ? styles.active : ''}
            >
              Servicios
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}