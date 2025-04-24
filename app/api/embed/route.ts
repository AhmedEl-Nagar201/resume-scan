import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-key-service"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const apiKey = searchParams.get("key")
    const feature = searchParams.get("feature") || "resume-builder"
    const theme = searchParams.get("theme") || "light"

    // Get the referring domain
    const referer = request.headers.get("referer")
    let domain = "unknown"

    if (referer) {
      try {
        const url = new URL(referer)
        domain = url.hostname
      } catch (e) {
        console.error("Error parsing referer:", e)
      }
    }

    // For local testing, check if the request is coming from localhost
    const host = request.headers.get("host") || ""
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      domain = "localhost"
      console.log("Local testing detected, using domain:", domain)
    }

    // Validate the API key
    if (!apiKey) {
      return new NextResponse("API key is required", { status: 400 })
    }

    const isValid = await validateApiKey(apiKey, domain, feature)

    if (!isValid) {
      return new NextResponse(`Invalid API key for this domain (${domain}) or feature (${feature})`, { status: 403 })
    }

    // Generate the embedded widget HTML
    const widgetHtml = generateWidgetHtml(apiKey, feature, theme)

    // Return the HTML with the correct content type
    return new NextResponse(widgetHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error serving embedded widget:", error)
    return new NextResponse(`Error serving embedded widget: ${error.message}`, { status: 500 })
  }
}

function generateWidgetHtml(apiKey: string, feature: string, theme: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resume-scan.vercel.app"

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Scan Widget</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    .resume-scan-widget {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe 
    src="${appUrl}/embed/${feature}?key=${apiKey}&theme=${theme}" 
    class="resume-scan-widget" 
    title="Resume Scan ${feature === "resume-builder" ? "Resume Builder" : "Job Matcher"}"
    allow="clipboard-write"
  ></iframe>
</body>
</html>
  `
}
