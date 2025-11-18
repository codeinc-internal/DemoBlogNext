"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialLiked: boolean
  onUpdate?: (likes: number, liked: boolean) => void
  size?: "normal" | "small"
}

export default function LikeButton({
  postId,
  initialLikes,
  initialLiked,
  onUpdate,
  size = "normal"
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const handleLike = async () => {
    if (!session || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const newLikes = data.likesCount
        const newLiked = data.liked
        
        setLikes(newLikes)
        setIsLiked(newLiked)
        
        // Call the onUpdate callback if provided
        if (onUpdate) {
          onUpdate(newLikes, newLiked)
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSmall = size === "small"
  const buttonSize = isSmall ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"
  const iconSize = isSmall ? "" : ""

  if (!session) {
    return (
      <button
        disabled
        className={`flex items-center gap-1 ${buttonSize} bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed`}
      >
        ❤️ {isSmall ? "" : "Like"} ({likes})
      </button>
    )
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 ${buttonSize} rounded-lg transition-colors ${
        isLiked
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLiked ? "❤️" : "🤍"} {isSmall ? "" : "Like"} ({likes})
      {isLoading && <span className="text-xs">...</span>}
    </button>
  )
}