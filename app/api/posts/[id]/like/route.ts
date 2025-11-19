import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PostModel } from "@/app/models/index"



export async function POST(request: NextRequest,  { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    const {id} = await params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await PostModel.toggleLike(id, session.user.id as string)
    
    return NextResponse.json({
      liked: result.liked,
      likesCount: result.likesCount
    })
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest,   { params }: { params: Promise<{ id: string }> }) {
  try {
    const {id } = await params;
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ liked: false })
    }

    const hasLiked = await PostModel.userHasLiked(id, session.user.id as string)
    
    return NextResponse.json({
      liked: hasLiked
    })
  } catch (error) {
    console.error("Check like status error:", error)
    return NextResponse.json({ liked: false }, { status: 500 })
  }
}