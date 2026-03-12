-- ============================================================
-- Delfin Law Advocates — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PRACTICE AREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL DEFAULT 'Briefcase',
  short_description TEXT NOT NULL DEFAULT '',
  long_description TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ATTORNEYS
-- ============================================================
CREATE TABLE IF NOT EXISTS attorneys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  education TEXT DEFAULT '',
  bar_admissions TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  case_type TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  author_id UUID REFERENCES attorneys(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CASE STUDIES
-- ============================================================
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  practice_area_id UUID REFERENCES practice_areas(id) ON DELETE SET NULL,
  challenge TEXT DEFAULT '',
  approach TEXT DEFAULT '',
  outcome TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. INQUIRIES (from contact form)
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  practice_area_id UUID REFERENCES practice_areas(id) ON DELETE SET NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CUSTOM PAGES (CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  show_in_nav BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. PAGE SECTIONS (building blocks for custom pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'text', 'image_text', 'card_grid', 'cta_banner', 'gallery')),
  content JSONB NOT NULL DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. SITE SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  group_name TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. HOMEPAGE SECTIONS (visibility & ordering controls)
-- ============================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all content tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'practice_areas', 'attorneys', 'testimonials', 'blog_posts',
      'case_studies', 'faqs', 'inquiries', 'pages', 'page_sections',
      'site_settings', 'homepage_sections'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Anyone can read active/published content
CREATE POLICY "Public read active practice_areas" ON practice_areas FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active attorneys" ON attorneys FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published blog_posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read active case_studies" ON case_studies FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read visible page_sections" ON page_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read homepage_sections" ON homepage_sections FOR SELECT USING (true);

-- PUBLIC INSERT: Anyone can submit inquiries
CREATE POLICY "Public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);

-- ADMIN FULL ACCESS: Authenticated users can do everything
CREATE POLICY "Admin full access practice_areas" ON practice_areas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access attorneys" ON attorneys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access case_studies" ON case_studies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access inquiries" ON inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access page_sections" ON page_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access homepage_sections" ON homepage_sections FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA
-- ============================================================

-- Homepage section controls
INSERT INTO homepage_sections (section_key, label, is_visible, display_order) VALUES
  ('hero', 'Hero Banner', true, 1),
  ('practice_areas', 'Practice Areas', true, 2),
  ('testimonials', 'Testimonials', true, 3),
  ('attorneys', 'Our Team', true, 4),
  ('case_studies', 'Case Studies', false, 5),
  ('faqs', 'FAQs', false, 6),
  ('blog', 'Blog & News', true, 7),
  ('contact', 'Contact Form', true, 8);

-- Default site settings
INSERT INTO site_settings (key, value, group_name) VALUES
  ('firm_name', 'Delfin Law Advocates', 'general'),
  ('firm_tagline', 'Expert Legal Counsel for Modern Challenges', 'general'),
  ('firm_description', 'Delfin Law Advocates provides top-tier legal services across a range of practice areas, combining experience with a client-focused approach.', 'general'),
  ('address_line1', '123 Legal Ave, Suite 400', 'contact'),
  ('address_line2', 'Justice City, ST 54321', 'contact'),
  ('phone', '(123) 456-7890', 'contact'),
  ('email', 'contact@delfinlaw.com', 'contact'),
  ('twitter_url', '', 'social'),
  ('linkedin_url', '', 'social'),
  ('facebook_url', '', 'social'),
  ('instagram_url', '', 'social');

-- Seed practice areas
INSERT INTO practice_areas (name, slug, icon_name, short_description, display_order) VALUES
  ('Family Law', 'family-law', 'Users', 'Expert guidance on divorce, custody, and all family-related legal matters.', 1),
  ('Corporate Law', 'corporate-law', 'Building2', 'Comprehensive legal solutions for businesses, from startups to established corporations.', 2),
  ('Real Estate Law', 'real-estate-law', 'Home', 'Navigating residential and commercial property transactions with precision.', 3),
  ('Personal Injury', 'personal-injury', 'HeartHandshake', 'Fighting for your rights and fair compensation after an accident or injury.', 4),
  ('Criminal Defense', 'criminal-defense', 'Gavel', 'Vigorous defense for individuals facing criminal charges.', 5),
  ('Employment Law', 'employment-law', 'Briefcase', 'Protecting the rights of employees and employers in the workplace.', 6),
  ('Estate Planning', 'estate-planning', 'NotebookText', 'Secure your legacy with strategic wills, trusts, and estate planning.', 7);

-- Seed attorneys
INSERT INTO attorneys (name, title, slug, bio, specialties, display_order) VALUES
  ('Eleonora Delfin', 'Managing Partner', 'eleonora-delfin',
   'With over 20 years of experience, Eleonora Delfin has built a reputation for her sharp legal mind and unwavering dedication to her clients. She founded Delfin Law to create a firm that prioritizes both results and relationships.',
   ARRAY['Corporate Law', 'Real Estate Law'], 1),
  ('Marcus Thorne', 'Senior Partner, Criminal Defense', 'marcus-thorne',
   'Marcus is a formidable presence in the courtroom. His strategic approach to criminal defense has led to numerous successful outcomes for his clients, making him one of the most respected litigators in the state.',
   ARRAY['Criminal Defense', 'Personal Injury'], 2),
  ('Isabella Rossi', 'Associate Attorney, Family Law', 'isabella-rossi',
   'Isabella combines empathy with legal expertise to guide her clients through challenging family law matters. She is committed to finding compassionate solutions that protect her clients'' interests and well-being.',
   ARRAY['Family Law', 'Estate Planning'], 3),
  ('Julian Chen', 'Associate Attorney, Employment Law', 'julian-chen',
   'Julian is a dedicated advocate for workplace fairness. He represents both employees and employers, offering a balanced perspective that helps resolve disputes efficiently and effectively.',
   ARRAY['Employment Law', 'Corporate Law'], 4);

-- Seed testimonials
INSERT INTO testimonials (client_name, case_type, quote, rating, is_featured) VALUES
  ('J. Doe', 'Corporate Law', 'Delfin Law Advocates handled my case with the utmost professionalism and care. I felt supported and informed every step of the way. Their expertise was evident, and the outcome exceeded my expectations.', 5, true),
  ('M. Smith', 'Criminal Defense', 'Facing a difficult legal battle, I turned to Marcus Thorne. His confidence and strategic thinking were reassuring, and his performance in court was nothing short of brilliant. I couldn''t have asked for a better advocate.', 5, true),
  ('A. Williams', 'Family Law', 'Isabella Rossi was a beacon of hope for my family during a trying time. Her compassionate approach and deep knowledge of family law made all the difference. I am forever grateful for her guidance.', 5, true),
  ('B. Taylor', 'Real Estate Law', 'The team at Delfin Law provided exceptional service for our real estate transaction. They were meticulous, responsive, and ensured everything went smoothly from start to finish. Highly recommended.', 5, true);

-- Seed blog posts
INSERT INTO blog_posts (title, slug, category, excerpt, status, is_featured, published_at) VALUES
  ('Navigating Corporate Mergers: 5 Key Legal Considerations', 'navigating-corporate-mergers', 'Corporate Law',
   'A successful merger requires careful legal planning. Here are five crucial aspects to consider before, during, and after the deal is done.',
   'published', true, '2024-07-15T00:00:00Z'),
  ('Understanding Easements: What Every Property Owner Should Know', 'understanding-easements-in-real-estate', 'Real Estate Law',
   'Easements can significantly impact your property rights. We break down the different types of easements and what they mean for you.',
   'published', false, '2024-06-28T00:00:00Z'),
  ('The Rise of Digital Privacy Laws and What They Mean for Your Business', 'the-rise-of-digital-privacy-laws', 'Employment Law',
   'With new data privacy regulations emerging globally, is your business compliant? Learn about the key requirements and potential pitfalls.',
   'published', false, '2024-06-10T00:00:00Z');

-- Seed FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
  ('What should I bring to my initial consultation?', 'Please bring any relevant documents related to your legal matter, such as contracts, correspondence, court documents, and identification. The more information you provide, the better we can assess your situation.', 'General', 1),
  ('How much does a consultation cost?', 'We offer a free initial consultation for most practice areas. During this meeting, we will discuss your case, outline potential strategies, and provide you with a clear understanding of our fee structure.', 'General', 2),
  ('How long will my case take?', 'The timeline varies significantly depending on the type and complexity of your case. During your consultation, we will provide an estimated timeline based on the specifics of your situation.', 'General', 3),
  ('Do you offer payment plans?', 'Yes, we understand that legal fees can be a concern. We offer flexible payment plans to make our services accessible. Please discuss your needs with us during your consultation.', 'Billing', 4),
  ('What areas of law do you practice?', 'We offer a wide range of legal services including Family Law, Corporate Law, Real Estate Law, Personal Injury, Criminal Defense, Employment Law, and Estate Planning.', 'General', 5);
