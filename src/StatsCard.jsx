export default function StatsCard({ title, value, change, icon: Icon, trend = 'up', description }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
              {change && (
                <dd className="mt-1">
                  <div className="flex items-center text-sm">
                    <span className={`font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {trend === 'up' ? '↗' : '↘'} {change}
                    </span>
                    <span className="ml-2 text-gray-500">{description}</span>
                  </div>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}