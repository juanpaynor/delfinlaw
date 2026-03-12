import Link from 'next/link';
import { Mail, MapPin, Phone, Twitter, Linkedin, Facebook } from 'lucide-react';
import Logo from '@/components/logo';
import { navigationLinks } from '@/lib/data';

export default function Footer() {
  const socialLinks = [
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' },
    { icon: Facebook, href: '#', name: 'Facebook' },
  ];

  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="mb-4 inline-block">
              <Logo />
            </Link>
            <p className="text-muted-foreground text-sm">
              Expert Legal Counsel for Modern Challenges.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline text-lg font-bold text-foreground">Contact Us</h4>
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>123 Legal Ave, Suite 400<br/>Justice City, ST 54321</span>
              </p>
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>(123) 456-7890</span>
              </a>
              <a href="mailto:contact@delfinlaw.com" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@delfinlaw.com</span>
              </a>
            </address>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline text-lg font-bold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline text-lg font-bold text-foreground">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link key={social.name} href={social.href} aria-label={social.name} className="text-muted-foreground hover:text-accent">
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Delfin Law Advocates. All Rights Reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
            Disclaimer: The information on this website is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by viewing this website or contacting the firm.
          </p>
        </div>
      </div>
    </footer>
  );
}
