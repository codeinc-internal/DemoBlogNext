import { NextRequest, NextResponse } from "next/server"
import { PostModel } from "@/app/models/index"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = parseInt(searchParams.get("skip") || "0")
    const query = searchParams.get("q")
    const author = searchParams.get("author")

    let posts

    if (query) {
      posts = await PostModel.searchPosts(query, limit)
    } else if (author) {
      posts = await PostModel.getPostsByAuthor(author)
    } else {
      posts = await PostModel.getAllPosts(limit, skip)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, category, tags, featuredImage, status, authorId, authorName, authorEmail } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const postData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      authorId: authorId || "anonymous",
      authorName: authorName || "Anonymous",
      authorEmail: authorEmail || "anonymous@example.com",
      category: category || "General",
      tags: tags || [],
      featuredImage: featuredImage || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
      readTime,
      likes: 0,
      views: 0,
    }

    const postId = await PostModel.createPost(postData)

    return NextResponse.json(
      { 
        message: "Post created successfully",
        postId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}