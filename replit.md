# Overview

This is a portfolio website for Rafaela Botelho, a full-stack developer student. The application showcases her projects, skills, achievements, and provides a contact form for potential collaborators or employers. The site includes an administrative area for content management, visitor authentication for interactions (likes, comments), and LinkedIn sharing capabilities. The site is built as a single-page application with modern React components and a clean, responsive design featuring a pink accent theme.

## Recent Changes (Aug 19, 2025)
- Successfully migrated from Replit Agent to standard Replit environment
- Updated database configuration from Neon serverless to PostgreSQL
- Fixed Node.js module imports for pg driver compatibility
- Added SESSION_SECRET environment variable for secure session management
- All database schemas pushed and application running successfully on port 5000
- Added comprehensive admin area for content management (projects, achievements)
- Implemented visitor authentication system with likes/comments functionality
- Added LinkedIn sharing capabilities with custom previews
- Updated profile image to circular format with new provided image (bottons (4)_1755629531814.png)
- Removed certificates section, keeping only achievements section
- Implemented comprehensive admin dashboard with tabs for projects, achievements, and contacts management
- Added complete CRUD functionality for both projects and achievements with proper form validation
- Extended database schema with achievements, experiences, notifications tables
- Implemented complete CRUD operations for achievements and experiences
- Added likes/comments functionality for achievements similar to projects
- Created API routes for all new content management features
- Storage layer now supports both DatabaseStorage and MemStorage for all entities

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Animations**: Custom scroll animations and CSS transitions

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for projects, achievements, experiences, and contact form
- **Authentication**: Replit OAuth integration with admin role management
- **Data Storage**: PostgreSQL database with Drizzle ORM, fallback to in-memory storage
- **Schema Validation**: Zod schemas for type-safe data validation
- **Development**: Hot module replacement with Vite integration

## Data Storage Solutions
- **Primary Storage**: DatabaseStorage class using PostgreSQL with Drizzle ORM
- **Fallback Storage**: MemStorage class for in-memory data management when DATABASE_URL unavailable
- **Database Tables**: projects, achievements, experiences, users, likes, comments, notifications, sessions
- **Authentication**: Session-based authentication with PostgreSQL session store
- **Admin Management**: Email-based admin role assignment (rafaelaolbo@gmail.com)
- **File Structure**: Shared schema definitions between client and server with full type safety

## Design Patterns
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories
- **Component Architecture**: Reusable UI components with consistent styling patterns
- **Custom Hooks**: Scroll animations and mobile detection utilities
- **Error Handling**: Centralized error boundaries and toast notifications
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

# External Dependencies

## UI and Styling
- **Radix UI**: Accessible component primitives for dialogs, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets (specifically Simple Icons for tech logos)

## Data and State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with performance optimization
- **Zod**: Runtime type validation and schema definition
- **Drizzle ORM**: Type-safe database toolkit (configured for PostgreSQL)

## Development and Build Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **TypeScript**: Static type checking with strict configuration
- **ESBuild**: Fast bundling for production builds
- **Wouter**: Lightweight routing library

## Database and Deployment
- **Neon Database**: Serverless PostgreSQL (via @neondatabase/serverless)
- **Railway**: Deployment platform with Nixpacks builder
- **Connect PG Simple**: PostgreSQL session store for future session management

## Utilities and Libraries
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Utility for component variant management
- **CLSX**: Conditional class name utility
- **Nanoid**: URL-safe unique ID generation