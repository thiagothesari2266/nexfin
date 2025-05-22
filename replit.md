# Finance Manager - Personal & Business Finance Tracker

## Overview

This is a full-stack financial management application built with React, Express, and PostgreSQL. The application allows users to manage both personal and business finances through separate account types, track transactions, manage categories, and handle credit card transactions. The system uses a modern tech stack with TypeScript throughout, Drizzle ORM for database management, and shadcn/ui for the frontend components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for account management, TanStack Query for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API design with Express routes

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Accounts**: Personal or business account types
- **Categories**: Expense/income categorization with icons and colors
- **Transactions**: Financial transactions with business-specific fields
- **Credit Cards**: Credit card management with balances and limits
- **Credit Card Transactions**: Separate tracking for credit card purchases

## Key Components

### Account Management
- Multi-account support (personal/business)
- Account-specific transaction isolation
- Business accounts include additional fields (client name, project, cost center)

### Transaction System
- Income and expense tracking
- Category-based organization
- Date-based filtering and reporting
- Payment method tracking
- Business-specific metadata support

### Credit Card Management
- Multiple credit cards per account
- Balance and limit tracking
- Due date management
- Separate transaction history for credit cards

### Dashboard & Analytics
- Monthly financial overview
- Expense charts and visualizations
- Recent transaction lists
- Account statistics and metrics

## Data Flow

1. **User Authentication**: Account selection system (no traditional auth)
2. **Account Context**: React Context provides current account state globally
3. **Data Fetching**: TanStack Query manages API calls with caching and synchronization
4. **Form Handling**: React Hook Form with Zod validation
5. **Database Operations**: Drizzle ORM handles all database interactions
6. **API Layer**: Express routes provide RESTful endpoints for all operations

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessibility
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date utilities
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with migrations support
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **WebSockets**: ws for Neon database connection

### Development Tools
- **Build**: esbuild for server bundling, Vite for client
- **Type Checking**: TypeScript compiler with strict mode
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Hot Reloading**: Vite dev server with HMR
- **Port Configuration**: Client serves on port 5000

### Production Deployment
- **Platform**: Replit Autoscale deployment target
- **Build Process**: 
  1. Vite builds client assets to `dist/public`
  2. esbuild bundles server code to `dist/index.js`
- **Static Assets**: Express serves built client from `dist/public`
- **Database**: Production PostgreSQL via DATABASE_URL environment variable

### Environment Configuration
- **Development**: NODE_ENV=development with tsx for TypeScript execution
- **Production**: NODE_ENV=production with compiled JavaScript
- **Database Migrations**: Drizzle Kit for schema management
- **Port Mapping**: Internal port 5000 maps to external port 80

The application follows a monorepo structure with shared TypeScript types, ensuring type safety across the full stack. The architecture supports both development and production environments with appropriate tooling for each context.