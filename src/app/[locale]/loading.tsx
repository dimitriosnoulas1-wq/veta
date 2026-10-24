export default function Loading() {
  return (
    <div className="grid gap-4 p-6" aria-busy="true" aria-live="polite">
      <div className="skeleton h-32 w-full rounded-[1.5rem]" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <div className="skeleton h-36" />
        <div className="skeleton h-36" />
        <div className="skeleton h-36" />
        <div className="skeleton h-36" />
      </div>
    </div>
  );
}
