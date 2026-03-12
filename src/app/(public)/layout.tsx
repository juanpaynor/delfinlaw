import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getSiteSettings } from '@/lib/supabase-data';

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const logoUrl = settings.logo_url || undefined;

  return (
    <>
      <Header logoUrl={logoUrl} />
      <main>{children}</main>
      <Footer logoUrl={logoUrl} />
      <Toaster />
    </>
  );
}
