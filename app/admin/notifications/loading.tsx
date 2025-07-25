// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full px-4">
      <div className="h-10 w-10 md:h-12 md:w-12 border-t-4 border-teal-500 border-opacity-50 rounded-full animate-spin" />
    </div>
  );
}
