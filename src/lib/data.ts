import type { LucideIcon } from 'lucide-react';
import { Users, Building2, Home, HeartHandshake, Briefcase, NotebookText, Gavel } from 'lucide-react';

export const navigationLinks = [
  { name: 'About', href: '/about' },
  { name: 'Practice Areas', href: '#practice-areas' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Our Lawyers', href: '#attorneys' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' },
];

export type PracticeArea = {
  name: string;
  icon: LucideIcon;
  description: string;
  slug: string;
};

export const practiceAreas: PracticeArea[] = [
  {
    name: "Family Law",
    icon: Users,
    description: "Expert guidance on divorce, custody, and all family-related legal matters.",
    slug: "family-law"
  },
  {
    name: "Corporate Law",
    icon: Building2,
    description: "Comprehensive legal solutions for businesses, from startups to established corporations.",
    slug: "corporate-law"
  },
  {
    name: "Real Estate Law",
    icon: Home,
    description: "Navigating residential and commercial property transactions with precision.",
    slug: "real-estate-law"
  },
  {
    name: "Personal Injury",
    icon: HeartHandshake,
    description: "Fighting for your rights and fair compensation after an accident or injury.",
    slug: "personal-injury"
  },
  {
    name: "Criminal Defense",
    icon: Gavel,
    description: "Vigorous defense for individuals facing criminal charges.",
    slug: "criminal-defense"
  },
  {
    name: "Employment Law",
    icon: Briefcase,
    description: "Protecting the rights of employees and employers in the workplace.",
    slug: "employment-law"
  },
  {
    name: "Estate Planning",
    icon: NotebookText,
    description: "Secure your legacy with strategic wills, trusts, and estate planning.",
    slug: "estate-planning"
  },
];


export type Attorney = {
  name: string;
  title: string;
  imageUrlId: string;
  specialties: string[];
  bio: string;
  slug: string;
};

export const attorneys: Attorney[] = [
  {
    name: "Eleonora Delfin",
    title: "Managing Partner",
    imageUrlId: "attorney1",
    specialties: ["Corporate Law", "Real Estate Law"],
    bio: "With over 20 years of experience, Eleonora Delfin has built a reputation for her sharp legal mind and unwavering dedication to her clients. She founded Delfin Law to create a firm that prioritizes both results and relationships.",
    slug: "eleonora-delfin"
  },
  {
    name: "Marcus Thorne",
    title: "Senior Partner, Criminal Defense",
    imageUrlId: "attorney2",
    specialties: ["Criminal Defense", "Personal Injury"],
    bio: "Marcus is a formidable presence in the courtroom. His strategic approach to criminal defense has led to numerous successful outcomes for his clients, making him one of the most respected litigators in the state.",
    slug: "marcus-thorne"
  },
  {
    name: "Isabella Rossi",
    title: "Associate Attorney, Family Law",
    imageUrlId: "attorney3",
    specialties: ["Family Law", "Estate Planning"],
    bio: "Isabella combines empathy with legal expertise to guide her clients through challenging family law matters. She is committed to finding compassionate solutions that protect her clients' interests and well-being.",
    slug: "isabella-rossi"
  },
  {
    name: "Julian Chen",
    title: "Associate Attorney, Employment Law",
    imageUrlId: "attorney4",
    specialties: ["Employment Law", "Corporate Law"],
    bio: "Julian is a dedicated advocate for workplace fairness. He represents both employees and employers, offering a balanced perspective that helps resolve disputes efficiently and effectively.",
    slug: "julian-chen"
  }
];


export type Testimonial = {
  quote: string;
  clientName: string;
  caseType: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Delfin Law Advocates handled my case with the utmost professionalism and care. I felt supported and informed every step of the way. Their expertise was evident, and the outcome exceeded my expectations.",
    clientName: "J. Doe",
    caseType: "Corporate Law"
  },
  {
    quote: "Facing a difficult legal battle, I turned to Marcus Thorne. His confidence and strategic thinking were reassuring, and his performance in court was nothing short of brilliant. I couldn't have asked for a better advocate.",
    clientName: "M. Smith",
    caseType: "Criminal Defense"
  },
  {
    quote: "Isabella Rossi was a beacon of hope for my family during a trying time. Her compassionate approach and deep knowledge of family law made all the difference. I am forever grateful for her guidance.",
    clientName: "A. Williams",
    caseType: "Family Law"
  },
  {
    quote: "The team at Delfin Law provided exceptional service for our real estate transaction. They were meticulous, responsive, and ensured everything went smoothly from start to finish. Highly recommended.",
    clientName: "B. Taylor",
    caseType: "Real Estate Law"
  }
];


export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  imageUrlId: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "navigating-corporate-mergers",
    title: "Navigating Corporate Mergers: 5 Key Legal Considerations",
    category: "Corporate Law",
    date: "2024-07-15",
    excerpt: "A successful merger requires careful legal planning. Here are five crucial aspects to consider before, during, and after the deal is done.",
    imageUrlId: "blog1"
  },
  {
    slug: "understanding-easements-in-real-estate",
    title: "Understanding Easements: What Every Property Owner Should Know",
    category: "Real Estate Law",
    date: "2024-06-28",
    excerpt: "Easements can significantly impact your property rights. We break down the different types of easements and what they mean for you.",
    imageUrlId: "blog2"
  },
  {
    slug: "the-rise-of-digital-privacy-laws",
    title: "The Rise of Digital Privacy Laws and What They Mean for Your Business",
    category: "Employment Law",
    date: "2024-06-10",
    excerpt: "With new data privacy regulations emerging globally, is your business compliant? Learn about the key requirements and potential pitfalls.",
    imageUrlId: "blog3"
  }
];
