interface LoadingSpinnerProps {
  label?: string
}

export function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5EF] gap-4">
      <div className="w-8 h-8 border-4 border-[#0E120A] border-t-[#D3FA2E] rounded-full animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-[#312B22]">{label}</span>
    </div>
  )
}
