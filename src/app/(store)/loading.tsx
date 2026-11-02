export default function StorefrontLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat koleksi"
      className="mx-auto max-w-[1400px] px-5 pt-10 pb-16 sm:px-8 lg:px-10 lg:pt-16"
    >
      <div className="h-4 w-40 rounded-full bg-ivory-200" />
      <div className="mt-4 space-y-3">
        <div className="h-16 w-full max-w-2xl rounded-2xl bg-ivory-200" />
        <div className="h-16 w-full max-w-xl rounded-2xl bg-ivory-200" />
      </div>
      <div className="mt-6 h-4 w-full max-w-md rounded-full bg-ivory-200" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-ivory-200" />
            <div className="mt-4 h-4 w-3/4 rounded-full bg-ivory-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
