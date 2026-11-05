export default function StorefrontLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat koleksi"
      className="px-3 pt-3 sm:px-5 lg:px-6"
    >
      <div className="mx-auto min-h-[70svh] max-w-[1540px] rounded-[1.75rem] bg-ivory-200 sm:min-h-[600px] lg:min-h-[700px]" />
      <div className="mx-auto max-w-[1540px] px-2 pt-14 sm:px-3 lg:px-4">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full bg-ivory-200" />
            <div className="h-10 w-64 rounded-2xl bg-ivory-200" />
          </div>
          <div className="h-11 w-72 rounded-full bg-ivory-200" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-ivory-200" />
              <div className="mt-4 h-4 w-3/4 rounded-full bg-ivory-200" />
              <div className="mt-2 h-3 w-1/3 rounded-full bg-ivory-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
