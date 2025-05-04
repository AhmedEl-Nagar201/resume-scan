import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { FileText, Briefcase, CheckCircle, Star, ChevronRight, Zap } from "lucide-react"
import AnimatedSection from "@/components/animated-section"
import TestimonialCard from "@/components/testimonial-card"
import FeatureCard from "@/components/feature-card"
import StatsCounter from "@/components/stats-counter"
import HeroAnimation from "@/components/hero-animation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Resume Scan | AI-Powered Resume Builder & Job Matcher",
  description:
    "Create ATS-optimized resumes with our AI-powered resume builder. Match your resume to job descriptions and get personalized improvement suggestions to land your dream job.",
  keywords: [
    "resume builder",
    "ATS-friendly resume",
    "job matcher",
    "resume analyzer",
    "resume optimization",
    "AI resume",
    "career tools",
    "job application",
    "professional resume",
    "resume templates",
  ],
  alternates: {
    canonical: "https://v0-resume-form-builder-two.vercel.app/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://v0-resume-form-builder-two.vercel.app/",
    title: "Resume Scan | AI-Powered Resume Builder & Job Matcher",
    description:
      "Create ATS-optimized resumes with our AI-powered resume builder. Match your resume to job descriptions and get personalized improvement suggestions to land your dream job.",
    siteName: "Resume Scan",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Resume Scan - AI-Powered Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Scan | AI-Powered Resume Builder & Job Matcher",
    description:
      "Create ATS-optimized resumes with our AI-powered resume builder. Match your resume to job descriptions and get personalized improvement suggestions to land your dream job.",
    images: ["/twitter-image.jpg"],
  },
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-muted">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection className="space-y-6">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary">
                  <Zap className="mr-1 h-3 w-3" />
                  AI-Powered Resume Builder
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Land Your Dream Job with an <span className="text-primary">Optimized Resume</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                Create ATS-friendly resumes, match them to job descriptions, and get personalized improvement
                suggestions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/resume-builder">
                  <Button size="lg" className="h-12 px-6 text-base group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      <FileText className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      Build Your Resume
                    </span>
                    <span className="absolute inset-0 bg-primary-foreground/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link href="/job-matcher">
                  <Button variant="outline" size="lg" className="h-12 px-6 text-base group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                      Match to Jobs
                    </span>
                    <span className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 font-medium">4.9/5 from 2k+ reviews</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="relative">
              <Suspense fallback={<div className="aspect-video bg-muted rounded-lg animate-pulse" />}>
                <HeroAnimation />
              </Suspense>
            </AnimatedSection>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-[60%] -left-[5%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-12 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatsCounter end={10000} suffix="+" label="Resumes Created" />
            <StatsCounter end={85} suffix="%" label="Success Rate" />
            <StatsCounter end={200} suffix="+" label="Job Positions" />
            <StatsCounter end={24} suffix="/7" label="Support" />
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4">
              Key Features
            </span>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our AI-powered tools help you create the perfect resume for any job application.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10" />}
              title="AI Resume Builder"
              description="Create professional, ATS-optimized resumes with customizable templates, fonts, and styles."
              benefits={["Professional templates", "ATS-friendly formats", "Custom styling options"]}
              delay={0}
            />
            <FeatureCard
              icon={<Briefcase className="h-10 w-10" />}
              title="Job Description Matcher"
              description="Match your resume to specific job descriptions and get tailored recommendations."
              benefits={["Keyword optimization", "Skill gap analysis", "Personalized suggestions"]}
              delay={0.1}
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10" />}
              title="AI Optimization"
              description="Get intelligent suggestions to improve your resume's content, structure, and impact."
              benefits={["Content enhancement", "Achievement highlighting", "Language optimization"]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">How It Works</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Three simple steps to create your perfect resume
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

            {/* Steps */}
            <AnimatedSection delay={0} className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4">Enter Your Information</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Fill in your work experience, education, skills, and other relevant details in our user-friendly form.
                </p>
                <div className="mt-auto">
                  <Link href="/resume-builder">
                    <Button variant="ghost" className="group">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4">Choose Your Style</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Select from various ATS-compatible fonts, layouts, and color schemes to personalize your resume.
                </p>
                <div className="mt-auto">
                  <Link href="/resume-builder">
                    <Button variant="ghost" className="group">
                      Explore Styles
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="relative z-10">
              <div className="bg-background rounded-lg p-8 border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-6 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4">Export & Apply</h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Download your professionally formatted resume as a PDF with all styling preserved, ready to submit to
                  employers.
                </p>
                <div className="mt-auto">
                  <Link href="/resume-builder">
                    <Button variant="ghost" className="group">
                      Create Resume
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">What Our Users Say</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Join thousands of job seekers who have found success with our platform
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Resume Scan helped me land interviews at 3 top tech companies. The job matcher feature was a game-changer!"
              author="Sarah J."
              role="Software Engineer"
              rating={5}
              delay={0}
            />
            <TestimonialCard
              quote="I love how easy it is to customize my resume while keeping it ATS-friendly. Got a job offer within 2 weeks!"
              author="Michael T."
              role="Marketing Manager"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              quote="The AI suggestions helped me highlight achievements I would have otherwise overlooked. Highly recommended!"
              author="Priya K."
              role="Financial Analyst"
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4">
              Common Questions
            </span>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Everything you need to know about our resume builder
            </p>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto">
            <AnimatedSection delay={0} className="mb-6">
              <div className="bg-background rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">Is my resume ATS-friendly?</h3>
                <p className="text-muted-foreground">
                  Yes! All our templates and styling options are designed to be fully compatible with Applicant Tracking
                  Systems, ensuring your resume gets past automated screenings.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="mb-6">
              <div className="bg-background rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">Can I customize fonts and styles?</h3>
                <p className="text-muted-foreground">
                  You can choose from multiple ATS-compatible fonts, layouts, and color schemes while maintaining
                  professional formatting that hiring managers love.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="mb-6">
              <div className="bg-background rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">How does the Job Matcher work?</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your resume against specific job descriptions, identifying keyword matches, skill
                  gaps, and providing tailored recommendations to increase your match rate.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="mb-6">
              <div className="bg-background rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground">
                  We take data security seriously. Your information is encrypted and never shared with third parties.
                  You maintain full control over your data at all times.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4">
              Get Started Today
            </span>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl mb-8">
              Join thousands of successful job seekers who have transformed their careers with our AI-powered resume
              tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/resume-builder">
                <Button size="lg" className="h-12 px-8 text-base group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <FileText className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Build Your Resume
                  </span>
                  <span className="absolute inset-0 bg-primary-foreground/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                </Button>
              </Link>
              <Link href="/job-matcher">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    Match to Jobs
                  </span>
                  <span className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Resume Scan",
            url: "https://v0-resume-form-builder-two.vercel.app/",
            description: "AI-powered resume builder and job matcher",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://v0-resume-form-builder-two.vercel.app//search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </div>
  )
}
