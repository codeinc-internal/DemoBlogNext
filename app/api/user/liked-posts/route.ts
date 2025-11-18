import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserModel, PostModel } from "@/app/models/index"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const likedPosts = await UserModel.getUserLikedPosts(session.user.id)
    const posts = await Promise.all(
      likedPosts.map(async (postId) => {
        const post = await PostModel.getPostById(postId)
        return post
      })
    )

    // Filter out null posts
    const validPosts = posts.filter(post => post !== null)
    
    return NextResponse.json(validPosts)
  } catch (error) {
    console.error("Get liked posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}