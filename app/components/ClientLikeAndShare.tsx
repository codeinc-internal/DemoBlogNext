"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { LikeButton } from "@/app/components"

export default function ClientLikeAndShare({
  postId,
  initialLikes,
  onLikeUpdate
}: {
  postId: string
  initialLikes: number
  onLikeUpdate?: (likes: number, liked: boolean) => void
}) {
  const { data: session } = useSession()
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setUserHasLiked(false)
      setLoading(false)
      return
    }

    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/like`)
        if (response.ok) {
          const data = await response.json()
          setUserHasLiked(data.liked)
        }
      } catch (error) {
        console.error("Error checking like status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkLikeStatus()
  }, [postId, session])

  const handleLikeUpdate = (likes: number, liked: boolean) => {
    setUserHasLiked(liked)
    if (onLikeUpdate) {
      onLikeUpdate(likes, liked)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
          <span className="text-gray-400">❤️</span>
          <span className="text-gray-400">{initialLikes}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <LikeButton
        postId={postId}
        initialLikes={initialLikes}
        initialLiked={userHasLiked}
        onUpdate={handleLikeUpdate}
      />

      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Check out this post!',
              url: window.location.href,
            })
          } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
      >
        📤 Share
      </button>
    </div>
  )
}
