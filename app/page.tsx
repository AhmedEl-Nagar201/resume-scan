import ResumeForm from "@/components/resume-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resume Builder</h1>
        <Link href="/job-matcher" className="mt-4 md:mt-0">
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Job Matcher
          </Button>
        </Link>
      </div>
      <ResumeForm />
    </main>
  )
}
