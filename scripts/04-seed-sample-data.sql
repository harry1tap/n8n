-- Insert sample projects (these will be visible once you have users)
INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'E-commerce SEO Strategy Guide',
  'TechCorp Inc.',
  'blog',
  'in_progress',
  '2024-02-15',
  ARRAY['e-commerce', 'SEO', 'strategy'],
  'Comprehensive guide on e-commerce SEO best practices',
  id
FROM profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'Homepage Content Optimization',
  'StartupXYZ',
  'website',
  'completed',
  '2024-01-10',
  ARRAY['homepage', 'conversion', 'optimization'],
  'Optimize homepage content for better conversions',
  id
FROM profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO projects (title, client_name, type, status, due_date, keywords, description, created_by) 
SELECT 
  'Local SEO Best Practices',
  'Local Business Co.',
  'blog',
  'pending_review',
  '2024-02-20',
  ARRAY['local SEO', 'Google My Business', 'citations'],
  'Complete guide to local SEO optimization',
  id
FROM profiles WHERE role = 'admin' LIMIT 1;

-- Insert sample content requests
INSERT INTO content_requests (article_title, target_audience, seo_keywords, article_type, client_name, creative_brief, submitted_by)
SELECT 
  'AI-Powered Content Creation Guide',
  'Digital marketers and content creators',
  'AI content, automation, marketing',
  'blog',
  'SKYWIDE Internal',
  'Create a comprehensive guide on how AI can revolutionize content creation workflows',
  id
FROM profiles WHERE role = 'admin' LIMIT 1;
