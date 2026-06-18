"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="p-4">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
}