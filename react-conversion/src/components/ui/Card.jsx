import { cn } from '../../lib/utils'

export function Card({ children, className }) {
  return (
    <div className={cn('bg-white rounded-card border border-gray-200 shadow-card overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-base font-semibold text-gray-800', className)}>{children}</h3>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('p-6', className)}>{children}</div>
  )
}