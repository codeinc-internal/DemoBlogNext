import clientPromise from "@/lib/mongodb"
import { Post, User, Comment } from "./types"
import { ObjectId } from "mongodb"

export class PostModel {
  static async getAllPosts(limit = 20, skip = 0): Promise<Post[]> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    const result = await posts
      .find({ status: "published" })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    return result.map(post => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
    } as any)) as Post[]
  }

  static async getPostById(id: string): Promise<Post | null> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    try {
      const post = await posts.findOne({ _id: new ObjectId(id) })
      
      if (!post) return null
      
      // Increment views
      await posts.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } }
      )
      
      return {
        ...post,
        _id: post._id.toString(),
        authorId: post.authorId.toString(),
      } as any as Post
    } catch (error) {
      return null
    }
  }

  static async createPost(postData: Omit<Post, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    const now = new Date()
    
    // Simplified approach: Always store authorId as ObjectId if it's a valid user ID
    let authorIdData: any = postData.authorId
    
    // If authorId is a string that looks like a valid ObjectId, convert it
    if (typeof authorIdData === 'string' && authorIdData !== 'anonymous' && authorIdData) {
      try {
        authorIdData = new ObjectId(authorIdData)
      } catch (error) {
        console.warn("Could not convert authorId to ObjectId:", authorIdData)
        // Keep as string if conversion fails
      }
    }
    
    const post = {
      ...postData,
      authorId: authorIdData,
      createdAt: now,
      updatedAt: now,
    }
    
    const result = await posts.insertOne(post)
    return result.insertedId.toString()
  }

  static async updatePost(id: string, postData: Partial<Post>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    try {
      const result = await posts.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...postData, 
            updatedAt: new Date() 
          } 
        }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      return false
    }
  }

  static async deletePost(id: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    try {
      const result = await posts.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch (error) {
      return false
    }
  }

  static async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    const result = await posts
      .find({ authorId: new ObjectId(authorId) })
      .sort({ publishedAt: -1 })
      .toArray()
    
    return result.map(post => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
    } as any)) as Post[]
  }

  static async searchPosts(query: string, limit = 20): Promise<Post[]> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    
    const result = await posts
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
        status: "published"
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray()
    
    return result.map(post => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
    } as any)) as Post[]
  }

  static async toggleLike(postId: string, userId: string): Promise<{liked: boolean, likesCount: number}> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const posts = db.collection("posts")
    const likes = db.collection("likes")
    
    try {
      const existingLike = await likes.findOne({ 
        postId: new ObjectId(postId), 
        userId: new ObjectId(userId) 
      })
      
      if (existingLike) {
        // Unlike
        await likes.deleteOne({ _id: existingLike._id })
        await posts.updateOne(
          { _id: new ObjectId(postId) },
          { $inc: { likes: -1 } }
        )
      } else {
        // Like
        await likes.insertOne({
          postId: new ObjectId(postId),
          userId: new ObjectId(userId),
          createdAt: new Date()
        })
        await posts.updateOne(
          { _id: new ObjectId(postId) },
          { $inc: { likes: 1 } }
        )
      }
      
      const updatedPost = await posts.findOne({ _id: new ObjectId(postId) })
      return { 
        liked: !existingLike, 
        likesCount: updatedPost?.likes || 0 
      }
    } catch (error) {
      return { liked: false, likesCount: 0 }
    }
  }

  static async userHasLiked(postId: string, userId: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const likes = db.collection("likes")
    
    try {
      const like = await likes.findOne({ 
        postId: new ObjectId(postId), 
        userId: new ObjectId(userId) 
      })
      return !!like
    } catch (error) {
      return false
    }
  }
}

export class CommentModel {
  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const comments = db.collection("comments")
    
    const result = await comments
      .find({ postId: new ObjectId(postId) })
      .sort({ createdAt: 1 })
      .toArray()
    
    return result.map(comment => ({
      ...comment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      authorId: comment.authorId.toString(),
    } as any)) as Comment[]
  }

  static async createComment(commentData: Omit<Comment, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const comments = db.collection("comments")
    
    const now = new Date()
    const comment = {
      ...commentData,
      createdAt: now,
      updatedAt: now,
    }
    
    const result = await comments.insertOne(comment)
    return result.insertedId.toString()
  }

  static async deleteComment(id: string, userId: string): Promise<boolean> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const comments = db.collection("comments")
    
    try {
      const result = await comments.deleteOne({ 
        _id: new ObjectId(id),
        authorId: new ObjectId(userId)
      })
      return result.deletedCount > 0
    } catch (error) {
      return false
    }
  }
}

export class UserModel {
  static async getUserByEmail(email: string): Promise<User | null> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const users = db.collection("users")
    
    const user = await users.findOne({ email })
    
    if (!user) return null
    
    return {
      ...user,
      _id: user._id.toString(),
    } as any as User
  }

  static async getUserById(id: string): Promise<User | null> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const users = db.collection("users")
    
    try {
      const user = await users.findOne({ _id: new ObjectId(id) })
      
      if (!user) return null
      
      return {
        ...user,
        _id: user._id.toString(),
      } as any as User
    } catch (error) {
      return null
    }
  }

  static async getUserLikedPosts(userId: string): Promise<string[]> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const likes = db.collection("likes")
    
    const result = await likes
      .find({ userId: new ObjectId(userId) })
      .toArray()
    
    return result.map(like => like.postId.toString())
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
    const client = await clientPromise
    const db = client.db("supplie-tracker")
    const users = db.collection("users")
    
    try {
      const result = await users.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...userData, 
            updatedAt: new Date() 
          } 
        }
      )
      
      return result.modifiedCount > 0
    } catch (error) {
      return false
    }
  }
}