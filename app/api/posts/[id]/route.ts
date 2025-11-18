import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PostModel } from "@/app/models/index"
import { ObjectId } from "mongodb"

interface Params {
  params: {
    id: string
  }
}

async function isPostAuthor(postId: string, userId: string): Promise<boolean> {
  try {
    const post = await PostModel.getPostById(postId)
    if (!post || !post.authorId) {
      return false
    }
    
    // Convert post authorId to string for comparison
    const postAuthorId = typeof post.authorId === 'string' ? post.authorId : post.authorId.toString()
    
    // Direct string comparison with session user ID
    if (postAuthorId === userId) {
      return true
    }
    
    // Also allow if the post was created by the same user but stored as ObjectId
    // This handles the case where the user might have created the post but there's a type mismatch
    try {
      const postAuthorAsObjId = new ObjectId(postAuthorId)
      const sessionUserAsObjId = new ObjectId(userId)
      return postAuthorAsObjId.equals(sessionUserAsObjId)
    } catch (error) {
      // If conversion fails, they're not the same
      return false
    }
  } catch (error) {
    console.error("Error in isPostAuthor:", error)
    return false
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const {id} = await params
    const post = await PostModel.getPostById(id)
    
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
       const {id} = await params
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    // Check if user is the author of the post
    const isAuthor = await isPostAuthor(id, session.user.id)
    if (!isAuthor) {
      return NextResponse.json(
        { error: "Forbidden - You can only edit your own posts" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, tags, featuredImage, status } = body

    const postData: any = {}
    if (title) postData.title = title
    if (content) postData.content = content
    if (excerpt) postData.excerpt = excerpt
    if (category) postData.category = category
    if (tags) postData.tags = tags
    if (featuredImage !== undefined) postData.featuredImage = featuredImage
    if (status) {
      postData.status = status
      if (status === "published") {
        postData.publishedAt = new Date()
      }
    }

    const success = await PostModel.updatePost(id, postData)
    
    if (!success) {
      return NextResponse.json(
        { error: "Post not found or update failed" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Post updated successfully" })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
      const {id} = await params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    // Check if user is the author of the post
    const isAuthor = await isPostAuthor(id, session.user.id)
    if (!isAuthor) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own posts" },
        { status: 403 }
      )
    }

    const success = await PostModel.deletePost(id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}