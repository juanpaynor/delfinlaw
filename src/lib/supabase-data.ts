import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses the same keys, but used in Server Components)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export type DBPracticeArea = {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  short_description: string;
  display_order: number;
};

export type DBAttorney = {
  id: string;
  name: string;
  title: string;
  slug: string;
  photo_url: string;
  bio: string;
  education: string;
  bar_admissions: string;
  email: string;
  phone: string;
  specialties: string[];
  display_order: number;
};

export type DBTestimonial = {
  id: string;
  client_name: string;
  case_type: string;
  quote: string;
  rating: number;
};

export type DBBlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_id: string | null;
  status: string;
  is_featured: boolean;
  published_at: string;
};

export type DBSiteSetting = {
  key: string;
  value: string;
  group_name: string;
};

export type DBHeroSlide = {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export async function getPracticeAreas(): Promise<DBPracticeArea[]> {
  const { data, error } = await supabase
    .from('practice_areas')
    .select('id, name, slug, icon_name, short_description, display_order')
    .eq('is_active', true)
    .order('display_order');
  if (error) { console.error('Error fetching practice areas:', error); return []; }
  return data ?? [];
}

export async function getAttorneys(): Promise<DBAttorney[]> {
  const { data, error } = await supabase
    .from('attorneys')
    .select('id, name, title, slug, photo_url, bio, education, bar_admissions, email, phone, specialties, display_order')
    .eq('is_active', true)
    .order('display_order');
  if (error) { console.error('Error fetching attorneys:', error); return []; }
  return data ?? [];
}

export async function getTestimonials(): Promise<DBTestimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, client_name, case_type, quote, rating')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching testimonials:', error); return []; }
  return data ?? [];
}

export async function getBlogPosts(): Promise<DBBlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, excerpt, content, cover_image_url, author_id, status, is_featured, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) { console.error('Error fetching blog posts:', error); return []; }
  return data ?? [];
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');
  if (error) { console.error('Error fetching site settings:', error); return {}; }
  const map: Record<string, string> = {};
  (data ?? []).forEach(s => { map[s.key] = s.value; });
  return map;
}

export async function getHeroSlides(): Promise<DBHeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('id, image_url, display_order, is_active')
    .eq('is_active', true)
    .order('display_order');
  if (error) { console.error('Error fetching hero slides:', error); return []; }
  return data ?? [];
}

export async function getAttorneyBySlug(slug: string): Promise<DBAttorney | null> {
  const { data, error } = await supabase
    .from('attorneys')
    .select('id, name, title, slug, photo_url, bio, education, bar_admissions, email, phone, specialties, display_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) { console.error('Error fetching attorney:', error); return null; }
  return data;
}

export async function getBlogPostBySlug(slug: string): Promise<DBBlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, excerpt, content, cover_image_url, author_id, status, is_featured, published_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) { console.error('Error fetching blog post:', error); return null; }
  return data;
}

export type DBPracticeAreaFull = DBPracticeArea & { long_description: string };

export async function getPracticeAreaBySlug(slug: string): Promise<DBPracticeAreaFull | null> {
  const { data, error } = await supabase
    .from('practice_areas')
    .select('id, name, slug, icon_name, short_description, long_description, display_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) { console.error('Error fetching practice area:', error); return null; }
  return data;
}
