import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Certified Slop - We make slop. That\'s it.',
  description: 'Certified Slop - We make slop. That\'s it. Explore our AI-powered projects including websAIte, calculAItor, SQuAiL, and more.',
  keywords: ['Certified Slop', 'AI', 'Python', 'Kotlin', 'Rust', 'open source', 'GitHub', 'LLM', 'machine learning'],
  authors: [{ name: 'Certified Slop' }],
  openGraph: {
    title: 'Certified Slop - We make slop. That\'s it.',
    description: 'Explore our AI-powered projects including websAIte, calculAItor, SQuAiL, and more.',
    url: 'https://certifiedslop.github.io/',
    siteName: 'Certified Slop',
    images: [{ url: 'https://avatars.githubusercontent.com/u/265597819?v=4', width: 400, height: 400 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Certified Slop - We make slop. That\'s it.',
    description: 'Explore our AI-powered projects including websAIte, calculAItor, SQuAiL, and more.',
    site: '@CertifiedSlop',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-primary text-white min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
