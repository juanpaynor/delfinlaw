import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { practiceAreas } from '@/lib/data';

export default function PracticeAreas() {
  return (
    <section id="practice-areas" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Our Practice Areas</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide comprehensive legal services across a wide range of practice areas, ensuring expert guidance for all your legal needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practiceAreas.map((area) => (
            <Card key={area.name} className="bg-card border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <area.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-xl font-bold group-hover:text-primary transition-colors">
                  {area.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
