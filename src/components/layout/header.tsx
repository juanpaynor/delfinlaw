"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { ContactModal } from '@/components/contact-modal';

export default function Header({ logoUrl, navLinks = [] }: { logoUrl?: string; navLinks?: { name: string; href: string }[] }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-[0_1px_0_0_hsl(var(--border))]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" aria-label="Delfin Law Advocates Home">
          <Logo logoUrl={logoUrl} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <ContactModal>
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg px-5">
              Get in Touch
            </Button>
          </ContactModal>
        </div>

        {/* Mobile */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-background p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <Logo logoUrl={logoUrl} />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-4 flex-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.name}>
                    <Link href={link.href} className="text-lg text-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <SheetClose asChild>
                <ContactModal>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Get in Touch
                  </Button>
                </ContactModal>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
