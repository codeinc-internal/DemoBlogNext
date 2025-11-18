import { NextRequest, NextResponse } from "next/server"
import { CommentModel } from "@/app/models/index"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const comments = await CommentModel.getCommentsByPostId(id)
    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    const comment = await CommentModel.createComment({
      postId: new ObjectId(id),
      authorId: new ObjectId(session.user.id),
      content: content.trim(),
      authorName: session.user.name ?? "Anonymous",
      authorEmail: session.user.email ?? "",
    })

    return NextResponse.json({ id: comment })
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
