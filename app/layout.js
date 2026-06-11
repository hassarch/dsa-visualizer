import './globals.css'

export const metadata = {
  title: 'DSA Visualizer',
  description: 'Interactive Data Structures & Algorithms learning platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}