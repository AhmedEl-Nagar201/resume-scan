import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Briefcase, CheckCircle, ArrowRight, Star, Code } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resume Scan | Build and Optimize Your Professional Resume",
  description:
    "Create, analyze, and optimize your resume with AI-powered tools to match job descriptions and stand out to employers.",
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Build Your Perfect Resume with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Create, analyze, and optimize your resume to match job descriptions and stand out to employers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/resume-builder">
                <Button size="lg" className="h-12">
                  <FileText className="mr-2 h-5 w-5" />
                  Build Resume
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
                <span>4.9/5 from 2k+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Our AI-powered tools help you create the perfect resume for any job application.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Resume Builder</h3>
              <ul className="text-center text-muted-foreground space-y-2">
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Professional templates
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time analysis
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated formatting
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Job Matcher</h3>
              <ul className="text-center text-muted-foreground space-y-2">
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Job description analysis
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Skill gap detection
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tailored recommendations
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI Optimization</h3>
              <ul className="text-center text-muted-foreground space-y-2">
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Keyword optimization
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Content scoring
                </li>
                <li className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Continuous improvements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* API Integration Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Embed on Your Website</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Add Resume Scan's powerful tools to your own website with our simple embed API
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-bold">Easy Integration</h3>
              <p className="text-muted-foreground">
                Add our resume builder and job matcher to your website with just a few lines of code. Perfect for career
                sites, job boards, and educational platforms.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  {`<iframe 
  src="https://resume-scan.vercel.app/api/embed?key=YOUR_API_KEY" 
  style="width: 100%; height: 800px; border: none;" 
></iframe>`}
                </pre>
              </div>
              <Link href="/api-keys">
                <Button variant="outline" className="mt-4">
                  <Code className="mr-2 h-4 w-4" />
                  Get Your API Key
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold mb-2">Resume Builder Widget</h4>
                      <p className="text-sm text-muted-foreground mb-4">Embedded on your website</p>
                      <div className="flex justify-center">
                        <Button size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Create Resume
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Boost Your Career?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Start building your professional resume today and increase your chances of landing your dream job.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/resume-builder">
                <Button size="lg" className="h-12">
                  <FileText className="mr-2 h-5 w-5" />
                  Build Resume
                </Button>
              </Link>
              <Link href="/job-matcher">
                <Button variant="outline" size="lg" className="h-12">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Analyze Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
