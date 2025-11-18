import { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password?: string
  image?: string
  telegram?: string
  phone?: string
  bio?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: ObjectId
  title: string
  content: string
  excerpt: string
  authorId: ObjectId
  authorName: string
  authorEmail: string
  featuredImage?: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  readTime: number
  likes: number
  views: number
}

export interface Comment {
  _id?: ObjectId
  postId: ObjectId
  authorId: ObjectId
  authorName: string
  authorEmail: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  _id?: ObjectId
  postId: ObjectId
  userId: ObjectId
  createdAt: Date
}