import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-key-service"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, domain, feature } = await request.json()
    console.log("Validate request received:", { apiKey: apiKey?.substring(0, 8) + "...", domain, feature })

    if (!apiKey || !feature) {
      return NextResponse.json(
        {
          valid: false,
          error: "Missing required parameters",
        },
        { status: 400 },
      )
    }

    // Special handling for local testing
    let domainToCheck = domain

    // If domain is unknown or empty, or we're in a local environment
    if (domain === "unknown" || domain === "" || domain.includes("localhost") || domain.includes("127.0.0.1")) {
      // For local testing, we'll accept any local domain variant
      const host = request.headers.get("host") || ""
      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        // Use the domain from the API key if it's a local domain
        // This helps when testing with different local domain formats
        domainToCheck = "localhost"
        console.log("Local testing detected, using domain:", domainToCheck)
      }
    }

    const isValid = await validateApiKey(apiKey, domainToCheck, feature)

    console.log("Validation result:", {
      valid: isValid,
      domain: domainToCheck,
      feature: feature,
    })

    return NextResponse.json({
      valid: isValid,
      domain: domainToCheck,
      feature: feature,
    })
  } catch (error) {
    console.error("Error validating API key:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Error validating API key: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}
