import { ReactNode } from 'react'

type StatColor = 'green' | 'red' | 'purple' | 'blue' | 'orange'

interface StatCardProps {
    title: string
    value: string | number
    color?: StatColor
    icon?: ReactNode
    subtitle?: string
}

const colorStyles: Record<StatColor, string> = {
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400'
}

export function StatCard({
    title,
    value,
    color = 'green',
    icon,
    subtitle
}: StatCardProps) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wider">
                    {title}
                </h3>
                {icon && <span className="text-xl opacity-60">{icon}</span>}
            </div>
            <div className={`text-3xl font-bold ${colorStyles[color]}`}>
                {value}
            </div>
            {subtitle && (
                <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
            )}
        </div>
    )
}
