import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { attorneys } from '@/lib/data';
import allImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';

export default function Attorneys() {
  return (
    <section id="attorneys" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Meet Our Team</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A dedicated team of experienced legal professionals committed to your success.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {attorneys.map((attorney) => {
            const attorneyImage = allImages.placeholderImages.find(img => img.id === attorney.imageUrlId);
            return (
              <Card key={attorney.slug} className="overflow-hidden bg-card border-border/50 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="p-0">
                  {attorneyImage && (
                    <div className="aspect-square relative">
                      <Image
                        src={attorneyImage.imageUrl}
                        alt={`Portrait of ${attorney.name}`}
                        data-ai-hint={attorneyImage.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <CardTitle className="font-headline text-xl font-bold">{attorney.name}</CardTitle>
                  <CardDescription className="text-primary">{attorney.title}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{attorney.bio}</p>
                </CardContent>
                <CardFooter className="p-4 flex flex-col items-start gap-4">
                  <div className="flex flex-wrap gap-2">
                    {attorney.specialties.map(spec => (
                      <Badge key={spec} variant="secondary" className="bg-primary/10 text-primary border-none">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="link" className="p-0 h-auto text-accent">
                    <Link href="#">Read Full Bio &rarr;</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
