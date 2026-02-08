# Linknow - Real Estate Link in Bio

## Overview

Linknow is a WhatsApp-first "link in bio" platform designed for real estate agents. It allows agents to create professional digital business cards that showcase their listings, bio, and contact information in a single shareable link. The app emphasizes quick setup (30 seconds) and direct WhatsApp integration for property inquiries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Build Tool**: Vite with custom plugins for Replit integration
- **Typography**: Outfit (display) and Plus Jakarta Sans (body) fonts

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Migrations**: Drizzle Kit with `db:push` command
- **Tables**: 
  - `users` and `sessions` (Replit Auth)
  - `profiles` (agent profiles with slug, contact info, bio)
  - `properties` (listings with images, pricing, location)

### Authentication
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Implementation**: Passport.js with custom Replit OIDC strategy
- **Protected Routes**: `isAuthenticated` middleware for API endpoints

### File Storage
- **Service**: Google Cloud Storage via Replit Object Storage integration
- **Upload Pattern**: Presigned URL flow - client requests URL, uploads directly to storage
- **Client Library**: Uppy with AWS S3 plugin for upload management

### Key Routes
- `/` - Landing page with onboarding wizard
- `/dashboard` - Authenticated agent dashboard for profile/property management
- `/:slug` - Public profile page for sharing

## External Dependencies

### Third-Party Services
- **Replit Auth**: OpenID Connect authentication via Replit
- **Replit Object Storage**: File uploads via Google Cloud Storage sidecar
- **WhatsApp**: Deep linking for property inquiries (no API integration)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `@uppy/core` / `@uppy/aws-s3`: File upload handling
- `passport` / `openid-client`: Authentication
- `framer-motion`: Animations for onboarding wizard
- `react-hook-form` / `zod`: Form handling and validation

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Replit environment identifier