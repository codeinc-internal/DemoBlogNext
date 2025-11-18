"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { InputField, CartoonCard } from "@/app/components"

export default function NewPostPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "General",
    tags: "",
    featuredImage: "",
    status: "published"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const tagsArray = form.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const postData = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || form.content.substring(0, 150) + "...",
        category: form.category,
        tags: tagsArray,
        featuredImage: form.featuredImage || null,
        status: form.status,
        authorId: session?.user?.id || "anonymous",
        authorName: session?.user?.name || "Anonymous",
        authorEmail: session?.user?.email || "anonymous@example.com"
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create post")
        return
      }

      const data = await response.json()
      router.push(`/blog/${data.postId}`)
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6 flex items-center justify-center">
        <CartoonCard title="Authentication Required">
          <div className="text-center">
            <p className="mb-4">You need to be logged in to create posts.</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </CartoonCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">✍️ Create New Post</h1>
          <button
            onClick={() => router.push("/blog")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Blog
          </button>
        </div>

        <CartoonCard title="Write Your Post">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Title"
              name="title"
              placeholder="Enter your post title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General">General</option>
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Health">Health</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <InputField
              label="Tags (comma separated)"
              name="tags"
              placeholder="javascript, react, web development"
              value={form.tags}
              onChange={handleChange}
            />

            <InputField
              label="Featured Image URL (optional)"
              name="featuredImage"
              placeholder="https://example.com/image.jpg"
              value={form.featuredImage}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                name="content"
                rows={15}
                placeholder="Write your blog post content here..."
                value={form.content}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt (optional - will be generated from content if not provided)
              </label>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="Brief description of your post..."
                value={form.excerpt}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                style={{ boxShadow: "6px 6px 0px #000" }}
              >
                {isLoading ? "Creating..." : "🚀 Create Post"}
              </button>
              
              <button
                type="button"
                onClick={() => router.push("/blog")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </CartoonCard>
      </div>
    </div>
  )
}