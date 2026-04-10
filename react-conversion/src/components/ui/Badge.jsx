import { cn } from '../../lib/utils'
import { STATUS_LABELS } from '../../lib/supabase'

const statusStyles = {
  submitted: 'bg-gray-100 text-gray-600',
  under_review: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  for_revision: 'bg-red-100 text-red-700',
  resubmitted: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function Badge({ status, children, className, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        statusStyles[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || STATUS_LABELS[status] || status}
    </span>
  )
}