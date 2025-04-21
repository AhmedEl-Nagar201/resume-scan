import ResumeForm from "@/components/resume-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Create and customize your professional resume with our easy-to-use resume builder.",
}

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Builder</h1>
      <ResumeForm />
    </div>
  )
}
