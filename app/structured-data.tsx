export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Resume Scan",
  url: "https://resume-scan.vercel.app",
  description: "AI-powered resume builder and job matcher",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://resume-scan.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Resume Scan",
  url: "https://resume-scan.vercel.app",
  logo: "https://resume-scan.vercel.app/logo.png",
  sameAs: [
    "https://twitter.com/resumescan",
    "https://facebook.com/resumescan",
    "https://linkedin.com/company/resumescan",
  ],
}

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Resume Builder",
  provider: {
    "@type": "Organization",
    name: "Resume Scan",
  },
  description: "AI-powered resume builder with ATS optimization",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}
