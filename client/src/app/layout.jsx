import React from 'react'
import './globals.css'
import styles from './page.module.css'

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <main className={styles.main}>
          {children}
        </main>  
        </body>
    </html>
  )
}
