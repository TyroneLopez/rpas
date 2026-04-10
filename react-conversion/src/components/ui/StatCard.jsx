import { cn } from '../../lib/utils'

const iconColors = {
  gold: 'bg-gold-light text-gold',
  green: 'bg-green-light text-green-brand',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'green',
  trend,
  onClick,
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-gray-200 shadow-card p-5',
        'flex items-center gap-4 card-hover',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[color])}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
        {trend && (
          <div className={cn(
            'text-xs mt-1',
            trend > 0 ? 'text-green-brand' : trend < 0 ? 'text-red-600' : 'text-gray-400'
          )}>
            {trend > 0 ? '+' : ''}{trend} from last month
          </div>
        )}
      </div>
    </div>
  )
}