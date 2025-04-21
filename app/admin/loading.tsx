import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Loading Admin Dashboard</h3>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
}
