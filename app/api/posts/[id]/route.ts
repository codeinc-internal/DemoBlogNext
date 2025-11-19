import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PostModel } from "@/app/models/index"
import { ObjectId } from "mongodb"

async function isPostAuthor(postId: string, userId: string): Promise<boolean> {
  try {
    const post = await PostModel.getPostById(postId)
    if (!post?.authorId) return false

    const authorId =
      typeof post.authorId === "string"
        ? post.authorId
        : post.authorId.toString()

    if (authorId === userId) return true

    try {
      return new ObjectId(authorId).equals(new ObjectId(userId))
    } catch {
      return false
    }
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await PostModel.getPostById(id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!(await isPostAuthor(id, session.user.id))) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const success = await PostModel.updatePost(id, data)

    if (!success) {
      return NextResponse.json(
        { error: "Post not found or update failed" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Post updated successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!(await isPostAuthor(id, session.user.id))) {
      return NextResponse.json(
        { error: "Forbidden" },
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
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
