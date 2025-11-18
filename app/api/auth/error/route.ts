import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: "Authentication error occurred get",
    message: "Please try again or contact support if the problem persists."
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: "Authentication error occurred Post",
    message: "Please try again or contact support if the problem persists."
  })
}