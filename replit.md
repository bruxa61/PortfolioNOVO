# Overview

This is a portfolio website for Rafaela Botelho, a full-stack developer student. The application showcases her projects, skills, and provides a contact form for potential collaborators or employers. The site is built as a single-page application with modern React components and a clean, responsive design featuring a pink accent theme.

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
- **API Design**: RESTful endpoints for projects and contact form submission
- **Data Storage**: In-memory storage with file-based project data (JSON)
- **Schema Validation**: Zod schemas for type-safe data validation
- **Development**: Hot module replacement with Vite integration

## Data Storage Solutions
- **Primary Storage**: MemStorage class for in-memory data management
- **Project Data**: Static JSON file (`server/data/projects.json`)
- **Contact Storage**: In-memory Map structure with UUID-based IDs
- **Database Schema**: Drizzle ORM schemas defined for future PostgreSQL integration
- **File Structure**: Shared schema definitions between client and server

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