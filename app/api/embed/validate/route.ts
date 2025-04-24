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

    const isValid = await validateApiKey(apiKey, domain, feature)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("Error validating API key:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Error validating API key",
      },
      { status: 500 },
    )
  }
}
