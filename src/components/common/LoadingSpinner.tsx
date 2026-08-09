export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent mb-3" />
      <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{label}</p>
    </div>
  )
}
