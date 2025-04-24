import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-key-service"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, domain, feature } = await request.json()

    if (!apiKey || !domain || !feature) {
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
    if (domain === "unknown" || domain === "") {
      // Check if the request is coming from localhost
      const host = request.headers.get("host") || ""
      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        domainToCheck = "localhost"
        console.log("Local testing detected, using domain:", domainToCheck)
      }
    }

    const isValid = await validateApiKey(apiKey, domainToCheck, feature)

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
