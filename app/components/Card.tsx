import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'minimal' | 'elevated'
}

export default function Card({ 
  title, 
  children, 
  className = '',
  variant = 'default'
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-gray-100 hover:border-gray-200',
    minimal: 'bg-transparent',
    elevated: 'bg-white shadow-sm hover:shadow-xl'
  }

  return (
    <div className={`
      ${variantStyles[variant]} 
      transition-all duration-300 
      ${className}
    `}>
      {title && (
        <h3 className="font-light text-xl md:text-2xl mb-4 tracking-wide">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
