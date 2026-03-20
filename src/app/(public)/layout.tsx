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

  return (
    <>
      <Header logoUrl={settings.logo_url || undefined} />
      <main>{children}</main>
      <Footer settings={settings} />
      <Toaster />
    </>
  );
}
