"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { CartoonCard, InputField } from "@/app/components"
import Link from "next/link"

export default function EditPostPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { data: session, status } = useSession()

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "General",
    tags: "",
    featuredImage: "",
    status: "draft" as "draft" | "published",
  })

  useEffect(() => {
    if (!id) return
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    fetchPost()
  }, [session, status, id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) throw new Error("Failed to fetch post")

      const { post } = await response.json()

      if (post.authorId !== session?.user?.id) {
        setError("You can only edit your own posts")
        setLoading(false)
        return
      }

      setPost(post)
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags.join(", "),
        featuredImage: post.featuredImage || "",
        status: post.status,
      })

      setLoading(false)
    } catch (err) {
      setError("Failed to load post")
      setLoading(false)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error("Failed to update post")

      router.push(`/blog/${id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff3e0] to-[#fce4ec] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff3e0] to-[#fce4ec] p-6 flex items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href="/blog"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff3e0] to-[#fce4ec] p-6">
      <div className="max-w-4xl mx-auto">

        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/blog"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">✏️ Edit Post</h1>
          <div></div>
        </div>

        {/* Edit Form */}
        <CartoonCard title="Update Your Blog Post">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <InputField
              label="Post Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div className="space-y-2">
              <label className="font-semibold text-gray-700">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                required
                className="w-full border rounded-lg p-4 shadow-inner bg-white focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-700">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white shadow-inner focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-orange-700 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <div className="flex justify-center items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
                  Updating Post...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </CartoonCard>
      </div>
    </div>
  )
}
