import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from '@/components/logo';
import { navigationLinks } from '@/lib/data';
import { ContactModal } from '@/components/contact-modal';
import { Button } from '@/components/ui/button';

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const firmName = settings.firm_name || 'Delfin Law Advocates';
  const tagline = settings.firm_tagline || 'Expert legal counsel for modern challenges.';
  const description = settings.firm_description || 'Trusted advocacy you can rely on.';
  const addressLine1 = settings.address_line1 || '';
  const addressLine2 = settings.address_line2 || '';
  const phone = settings.phone || '';
  const email = settings.email || '';
  const logoUrl = settings.logo_url || undefined;

  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo logoUrl={logoUrl} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {tagline} {description}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <address className="not-italic space-y-3 text-sm text-muted-foreground">
              {(addressLine1 || addressLine2) && (
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                  <span>
                    {addressLine1}
                    {addressLine1 && addressLine2 && <br />}
                    {addressLine2}
                  </span>
                </p>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4 text-secondary" />
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 text-secondary" />
                  {email}
                </a>
              )}
            </address>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Need Legal Help?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get in touch with our team for a free initial consultation.
            </p>
            <ContactModal>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg">
                Get in Touch
              </Button>
            </ContactModal>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {firmName}. All Rights Reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            This website does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
