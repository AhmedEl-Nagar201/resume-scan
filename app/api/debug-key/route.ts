import { type NextRequest, NextResponse } from "next/server"
import { debugApiKey } from "@/lib/api-key-service"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, domain, feature } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "API key is required",
        },
        { status: 400 },
      )
    }

    // Get the debug information
    const debugInfo = await debugApiKey(apiKey, domain || "localhost", feature || "resume-builder")

    return NextResponse.json({
      debug: true,
      ...debugInfo,
      requestInfo: {
        apiKey: apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4),
        domain: domain || "localhost",
        feature: feature || "resume-builder",
        headers: {
          host: request.headers.get("host"),
          referer: request.headers.get("referer"),
          origin: request.headers.get("origin"),
        },
      },
    })
  } catch (error) {
    console.error("Error debugging API key:", error)
    return NextResponse.json(
      {
        debug: true,
        error: "Error debugging API key: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}
