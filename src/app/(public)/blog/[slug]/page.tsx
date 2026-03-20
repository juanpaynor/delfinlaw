import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts, getAttorneys } from '@/lib/supabase-data';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, attorneys] = await Promise.all([
    getBlogPostBySlug(slug),
    getAttorneys(),
  ]);

  if (!post) return notFound();

  const author = attorneys.find(a => a.id === post.author_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Back */}
      <div className="container mx-auto px-4 md:px-6 pt-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/#blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
      </div>

      <article className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <Badge variant="outline" className="text-secondary border-secondary/30">{post.category}</Badge>
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {author.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed text-justify">{post.excerpt}</p>
        )}

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mt-8">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-10 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-a:text-secondary text-justify">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-muted-foreground italic">Full article coming soon.</p>
          )}
        </div>

        {/* Author card */}
        {author && (
          <div className="mt-16 pt-8 border-t border-border">
            <Link href={`/attorneys/${author.slug}`} className="flex items-center gap-4 group">
              {author.photo_url ? (
                <Image
                  src={author.photo_url}
                  alt={author.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover w-14 h-14"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                  {author.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div>
                <p className="font-semibold group-hover:text-secondary transition-colors">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.title}</p>
              </div>
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
