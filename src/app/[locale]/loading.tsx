export default function Loading() {
  return (
    <div className="grid gap-4 p-6" aria-busy="true" aria-live="polite">
      <div className="skeleton h-28 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="skeleton h-44" />
        <div className="skeleton h-44" />
        <div className="skeleton h-44" />
      </div>
    </div>
  );
}
