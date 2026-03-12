import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/data';
import allImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Blog() {
  return (
    <section id="blog" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Legal Insights & News</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest articles, analyses, and firm news.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => {
            const postImage = allImages.placeholderImages.find(img => img.id === post.imageUrlId);
            return (
              <Card key={post.slug} className="overflow-hidden bg-background border-border/50 hover:shadow-xl transition-shadow duration-300 flex flex-col group">
                {postImage && (
                  <CardHeader className="p-0">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={postImage.imageUrl}
                        alt={`Image for ${post.title}`}
                        data-ai-hint={postImage.imageHint}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CardHeader>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-primary border-primary/50">{post.category}</Badge>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4"/>
                            <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                  <CardTitle className="font-headline text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                    <Link href="#">{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="mt-3 text-muted-foreground flex-1">{post.excerpt}</CardDescription>
                  <Button asChild variant="link" className="p-0 h-auto mt-4 self-start text-accent">
                    <Link href="#">Read More <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
