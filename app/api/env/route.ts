import { NextResponse } from "next/server"

export async function GET() {
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY

  // For debugging purposes, we'll include a masked version of the key if it exists
  let maskedKey = null
  if (hasOpenRouterKey && process.env.OPENROUTER_API_KEY) {
    const key = process.env.OPENROUTER_API_KEY
    maskedKey = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : "***" // If key is too short, just mask it completely
  }

  return NextResponse.json({
    hasOpenRouterKey,
    maskedKey,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
  })
}
