"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CartoonCard, Comments } from "@/app/components"
import Link from "next/link"
import ClientLikeAndShare from "@/app/components/ClientLikeAndShare"

interface Post {
  _id: string
  title: string
  content: string
  excerpt: string
  authorId: string
  authorName: string
  category: string
  tags: string[]
  featuredImage?: string
  status: "draft" | "published"
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  readTime: number
  likes: number
  views: number
}

interface Props {
  id: string
}

export default function BlogPostPage({ id }: Props) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userHasLiked, setUserHasLiked] = useState(false)

  useEffect(() => {
    if (status !== "loading") {
      fetchPost()
    }
  }, [status, id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) throw new Error("Failed to fetch post")

      const { post } = await response.json()
      setPost(post)

      // Check like status
      if (session?.user?.id) {
        try {
          const likeResponse = await fetch(`/api/posts/${id}/like`)
          if (likeResponse.ok) {
            const likeData = await likeResponse.json()
            setUserHasLiked(likeData.liked)
          }
        } catch (error) {
          console.error("Error checking like status:", error)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load post")
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete post")
      }

      router.push("/blog")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete post")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLikeUpdate = (likes: number, liked: boolean) => {
    if (post) setPost({ ...post, likes })
    setUserHasLiked(liked)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Post not found"}</p>
          <Link href="/blog" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const isAuthor =
    session?.user?.id &&
    (typeof post.authorId === "string" ? post.authorId : post.authorId) === session.user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">🏠 Home</Link>
            <Link href="/blog" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">← Back</Link>
          </div>

          <div className="flex gap-2">
            <Link href="/blog/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ✍️ Write New
            </Link>

            {isAuthor && (
              <>
                <Link href={`/blog/${id}/edit`} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  ✏️ Edit
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "🗑️ Delete"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Post */}
        <CartoonCard title="">
          <div className="space-y-6">
            <header className="border-b pb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span>By {post.authorName}</span>
                </div>

                {post.publishedAt && <span>📅 {formatDate(post.publishedAt)}</span>}
                <span>📖 {post.readTime} min read</span>
                <span>👀 {post.views} views</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{post.category}</span>
                {post.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">#{tag}</span>
                ))}
              </div>
            </header>

            {post.featuredImage && (
              <div className="rounded-lg overflow-hidden">
                <img src={post.featuredImage} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
              </div>
            )}

            <article className="prose prose-lg max-w-none">
              <div className="text-gray-800 whitespace-pre-wrap">{post.content}</div>
            </article>

            <footer className="border-t pt-6 mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <ClientLikeAndShare
                  postId={post._id}
                  initialLikes={post.likes}
                  onLikeUpdate={handleLikeUpdate}
                />
                <div className="text-sm text-gray-500">
                  Last updated {formatDate(post.updatedAt)}
                </div>
              </div>
            </footer>
          </div>
        </CartoonCard>

        <div className="mt-8">
          <CartoonCard title="">
            <Comments postId={post._id} />
          </CartoonCard>
        </div>

        <div className="mt-8">
          <CartoonCard title="More Posts">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Explore more blog posts.</p>
              <Link href="/blog" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View All Posts
              </Link>
            </div>
          </CartoonCard>
        </div>
      </div>
    </div>
  )
}
