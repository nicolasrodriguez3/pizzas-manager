import { ReactNode } from 'react'

type CardVariant = 'default' | 'glass' | 'solid'

interface CardProps {
    children: ReactNode
    variant?: CardVariant
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white/5 backdrop-blur-md border border-white/10',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    solid: 'bg-gray-800 border border-gray-700'
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
}

export function Card({
    children,
    variant = 'default',
    className = '',
    padding = 'md'
}: CardProps) {
    return (
        <div className={`rounded-2xl shadow-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
            {children}
        </div>
    )
}
