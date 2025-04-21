"use client"

import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileActionButton() {
  const pathname = usePathname()

  // Don't show on the job matcher page
  if (pathname === "/job-matcher") {
    return null
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 md:hidden flex justify-center pb-4">
      <Link href="/job-matcher">
        <Button size="lg" className="shadow-lg rounded-full px-6">
          <Briefcase className="mr-2 h-5 w-5" />
          Analyze Resume
        </Button>
      </Link>
    </div>
  )
}
