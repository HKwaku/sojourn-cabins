import { ReactNode } from 'react'

interface SectionProps {
  id?: string
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  background?: 'white' | 'light' | 'dark'
}

export default function Section({ 
  id, 
  title, 
  subtitle, 
  children, 
  className = '',
  background = 'white'
}: SectionProps) {
  const bgClass = {
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900 text-white'
  }[background]

  return (
    <section 
      id={id} 
      className={`py-20 md:py-28 lg:py-32 ${bgClass} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-16 md:mb-20">
            {title && (
              <h2 className="font-light text-3xl md:text-4xl lg:text-5xl mb-6 tracking-wide">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </section>
  )
}
