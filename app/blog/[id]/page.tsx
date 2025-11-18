import BlogPostPage from "./BlogPostPage"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params   

  return <BlogPostPage id={id} />
}
