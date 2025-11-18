"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CartoonCard } from "./components";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/login");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec]">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] to-[#fce4ec] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📝 My Blog</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold">{session.user?.name}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Navigation Cards */}
          <CartoonCard title="📖 Read Blog">
            <div className="text-center">
              <Link href="/blog" className="block">
                <p className="text-3xl mb-4">📚</p>
                <p className="text-gray-600 mb-4">Explore our blog posts</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Browse Posts
                </button>
              </Link>
            </div>
          </CartoonCard>

          <CartoonCard title="✍️ Write New Post">
            <div className="text-center">
              <Link href="/blog/new" className="block">
                <p className="text-3xl mb-4">✏️</p>
                <p className="text-gray-600 mb-4">Share your thoughts</p>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Create Post
                </button>
              </Link>
            </div>
          </CartoonCard>

          <CartoonCard title="👤 My Profile">
            <div className="text-center">
              <p className="text-3xl mb-4">👤</p>
              <p className="text-gray-600 mb-2">Manage your account</p>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
            </div>
          </CartoonCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <CartoonCard title="Quick Actions">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/blog" className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-center block">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium">Browse Posts</div>
              </Link>
              
              <Link href="/blog/new" className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-center block">
                <div className="text-2xl mb-2">✍️</div>
                <div className="text-sm font-medium">Write Post</div>
              </Link>
              
              <button className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">❤️</div>
                <div className="text-sm font-medium">Liked Posts</div>
              </button>
              
              <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium">Settings</div>
              </button>
            </div>
          </CartoonCard>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <CartoonCard title="Welcome to Your Blog!">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Start writing and sharing your ideas with the world.
              </p>
              <Link 
                href="/blog/new" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
              >
                Write Your First Post
              </Link>
            </div>
          </CartoonCard>
        </div>
      </div>
    </div>
  );
}