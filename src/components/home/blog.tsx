"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { SectionHeading, ScrollReveal } from '@/components/ui/scroll-animations';
import type { DBBlogPost } from '@/lib/supabase-data';

export default function Blog({ items }: { items: DBBlogPost[] }) {
  if (items.length === 0) return null;

  return (
    <section id="blog" className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          subtitle="Insights"
          title="Legal Insights & News"
          description="Stay informed with our latest articles and analyses."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post, i) => (
            <ScrollReveal key={post.id} effect="fade-up" delay={i * 0.06}>
              <div className="h-full bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
                {post.cover_image_url ? (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.cover_image_url}
                      alt={`Image for ${post.title}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-3xl text-muted-foreground/20 font-bold">{post.category}</span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <Badge variant="outline" className="text-secondary border-secondary/30 rounded-md text-xs">{post.category}</Badge>
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline text-lg font-bold leading-snug group-hover:text-secondary transition-colors">
                    <Link href="#">{post.title}</Link>
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm flex-grow line-clamp-3">{post.excerpt}</p>
                  <Link href="#" className="flex items-center gap-1.5 text-secondary text-sm font-medium mt-4 hover:gap-2.5 transition-all">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
