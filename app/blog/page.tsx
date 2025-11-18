"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CartoonCard, LikeButton } from "@/app/components"
import Link from "next/link"

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

export default function BlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status !== "loading") {
      fetchPosts()
    }
  }, [status])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }
      const { posts } = await response.json()
      setPosts(posts)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
    }
  }

  const fetchLikedPosts = async () => {
    if (!session) return
    
    try {
      const response = await fetch("/api/user/liked-posts")
      if (response.ok) {
        const likedPostsData = await response.json()
        const likedIds = new Set<string>(likedPostsData.map((post: Post) => post._id as string))
        setLikedPosts(likedIds)
      }
    } catch (error) {
      console.error("Error fetching liked posts:", error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchLikedPosts()
    }
  }, [session])

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(postId)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete post")
      }

      // Remove the deleted post from the local state
      setPosts(posts => posts.filter(post => post._id !== postId))
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete post")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleLikeUpdate = (postId: string, newLikes: number, isLiked: boolean) => {
    setPosts(posts => posts.map(post =>
      post._id === postId
        ? { ...post, likes: newLikes }
        : post
    ))
    
    if (isLiked) {
      setLikedPosts(prev => new Set([...prev, postId]))
    } else {
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🏠 Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">📝 Our Blog</h1>
          </div>
          <Link
            href="/blog/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            ✍️ Write New Post
          </Link>
        </div>

        {/* Featured Post */}
        {posts.length > 0 && (
          <CartoonCard title="🌟 Featured Post">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <Link href={`/blog/${posts[0]._id}`} className="flex-1">
                  <h2 className="text-2xl font-bold hover:text-blue-600 transition-colors">
                    {posts[0].title}
                  </h2>
                </Link>
                
                {/* Edit and Delete buttons for featured post author */}
                {session?.user?.id && (() => {
                  const postAuthorId = typeof (posts[0] as any).authorId === 'string' ? (posts[0] as any).authorId : (posts[0] as any).authorId.toString()
                  return postAuthorId === session.user.id
                })() && (
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/blog/${posts[0]._id}/edit`}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={(e) => handleDelete(posts[0]._id, e)}
                      disabled={deleteLoading === posts[0]._id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      {deleteLoading === posts[0]._id ? "🗑️..." : "🗑️"}
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 line-clamp-3">
                {posts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {posts[0].authorName}</span>
                  <span>📖 {posts[0].readTime} min read</span>
                  <span>👀 {posts[0].views} views</span>
                </div>
                <LikeButton
                  postId={posts[0]._id}
                  initialLikes={posts[0].likes}
                  initialLiked={likedPosts.has(posts[0]._id)}
                  onUpdate={(likes, liked) => handleLikeUpdate(posts[0]._id, likes, liked)}
                />
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {posts[0].category}
                </span>
                {posts[0].tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </CartoonCard>
        )}

        {/* Blog Posts Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <CartoonCard key={post._id} title="">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Link href={`/blog/${post._id}`} className="flex-1">
                    <h3 className="font-bold text-lg hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  {/* Edit and Delete buttons for post author */}
                  {session?.user?.id && (() => {
                    const postAuthorId = typeof (post as any).authorId === 'string' ? (post as any).authorId : (post as any).authorId.toString()
                    return postAuthorId === session.user.id
                  })() && (
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Link
                        href={`/blog/${post._id}/edit`}
                        className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={(e) => handleDelete(post._id, e)}
                        disabled={deleteLoading === post._id}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                      >
                        {deleteLoading === post._id ? "..." : "🗑️"}
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.authorName}</span>
                    <span>📖 {post.readTime}m</span>
                    <span>👀 {post.views}</span>
                  </div>
                  <LikeButton
                    postId={post._id}
                    initialLikes={post.likes}
                    initialLiked={likedPosts.has(post._id)}
                    onUpdate={(likes, liked) => handleLikeUpdate(post._id, likes, liked)}
                    size="small"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {post.category}
                  </span>
                </div>
              </div>
            </CartoonCard>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <CartoonCard title="No Posts Yet">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No blog posts have been published yet.
              </p>
              <Link
                href="/blog/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
              >
                Create Your First Post
              </Link>
            </div>
          </CartoonCard>
        )}
      </div>
    </div>
  )
}