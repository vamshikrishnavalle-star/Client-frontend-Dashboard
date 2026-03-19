export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl bg-orange-50 border border-orange-100 px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-orange-200/60 rounded-full" />
            <div className="h-7 w-56 bg-gray-200 rounded-xl" />
            <div className="h-3 w-44 bg-gray-100 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-200/60" />
            <div className="h-9 w-24 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Section header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-32 bg-gray-200 rounded-lg" />
          <div className="h-3 w-52 bg-gray-100 rounded-full" />
        </div>
        <div className="h-9 w-36 bg-gray-100 rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
              <div className="w-12 h-5 rounded-full bg-gray-100" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-3 w-full bg-gray-100 rounded-full" />
              <div className="h-3 w-5/6 bg-gray-100 rounded-full" />
            </div>
            <div className="pt-3 border-t border-gray-50 flex justify-between">
              <div className="h-3 w-16 bg-gray-100 rounded-full" />
              <div className="h-3 w-4 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
