import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Valid profile slug pattern: lowercase letters, numbers, and hyphens only
const VALID_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

// Known app routes that should not trigger profile lookups
const APP_ROUTES = new Set(['dashboard', 'login', 'auth', 'pricing', 'features', 'privacy', 'terms', 'about', 'contact', 'help', 'faq', 'blog', 'careers', 'press', 'api', 'objects']);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Dynamic OG tags for profile pages - only for valid profile slugs
  app.get("/:slug", async (req, res, next) => {
    const { slug } = req.params;
    
    // Quick checks - skip if not a valid profile slug pattern
    if (!VALID_SLUG_PATTERN.test(slug) || slug.length < 2 || slug.length > 50) {
      return next();
    }
    
    // Skip known app routes
    if (APP_ROUTES.has(slug)) {
      return next();
    }

    try {
      // Check if this is a valid profile slug
      const profile = await storage.getProfileBySlug(slug);
      
      if (!profile) {
        return next();
      }

      // Read the index.html template
      let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");

      // Build base URL - use linknow.live for production sharing
      const host = req.get('host') || 'linknow.live';
      const protocol = req.protocol || 'https';
      const baseUrl = host.includes('localhost') || host.includes('replit') 
        ? 'https://linknow.live' 
        : `${protocol}://${host}`;

      // Build dynamic meta content
      const ogTitle = escapeHtml(profile.fullName);
      const ogDescription = escapeHtml(profile.bio || `${profile.fullName} - Real Estate Agent in Dubai`);
      
      // Determine image URL - prefer cover photo, fallback to avatar
      let ogImage = "";
      if (profile.coverPhotoUrl) {
        ogImage = profile.coverPhotoUrl.startsWith('http') 
          ? profile.coverPhotoUrl 
          : `${baseUrl}/objects/${profile.coverPhotoUrl}`;
      } else if (profile.avatarUrl) {
        ogImage = profile.avatarUrl.startsWith('http') 
          ? profile.avatarUrl 
          : `${baseUrl}/objects/${profile.avatarUrl}`;
      }
      
      const ogUrl = `${baseUrl}/${slug}`;

      // Build dynamic OG tags
      const dynamicMetaTags = `<!-- DYNAMIC_OG_TAGS_START -->
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:type" content="profile" />
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
    <meta name="twitter:site" content="@replit" />
    <!-- DYNAMIC_OG_TAGS_END -->`;

      // Replace the OG tags block using the placeholder markers
      const ogTagsRegex = /<!-- DYNAMIC_OG_TAGS_START -->[\s\S]*?<!-- DYNAMIC_OG_TAGS_END -->/;
      if (ogTagsRegex.test(html)) {
        html = html.replace(ogTagsRegex, dynamicMetaTags);
      }

      res.send(html);
    } catch (error) {
      console.error("Error serving profile page:", error);
      next();
    }
  });

  // SPA fallback: serve index.html for non-API routes
  app.get(/^\/(?!api|objects).*$/, (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
