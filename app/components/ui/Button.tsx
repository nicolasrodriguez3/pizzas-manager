import { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg',
    secondary: 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    ghost: 'hover:bg-white/5 text-gray-400 hover:text-white',
    success: 'bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm rounded',
    md: 'px-4 py-2 rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl font-bold'
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                font-medium transition-all transform active:scale-95
                ${className}
            `}
            {...props}
        >
            {isLoading ? 'Cargando...' : children}
        </button>
    )
}
