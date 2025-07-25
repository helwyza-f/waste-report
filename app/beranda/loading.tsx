// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading halaman beranda...</p>
      </div>
    </div>
  );
}
