export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-3 w-3/4 rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-12 rounded-lg" />
          <div className="skeleton h-3 w-10 rounded-lg" />
          <div className="skeleton h-3 w-16 rounded-lg" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-6 w-24 rounded-lg" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
