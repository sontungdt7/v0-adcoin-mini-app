# Adcoin - Connect Brands with Creators

## Overview
Adcoin is a Next.js 16 web application that allows brands to connect with creators through a token-based offer system. Users can explore offers, create Adcoins, and manage their profiles.

## Tech Stack
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

## Project Structure
```
app/           - Next.js App Router pages and layouts
components/    - React components
  ui/          - Base UI components (shadcn/ui)
lib/           - Utility functions
public/        - Static assets (images, icons)
styles/        - Global CSS styles
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start`

## Configuration
- Next.js is configured to allow Replit proxy origins for development
- TypeScript build errors are ignored for faster development
- Images are unoptimized for compatibility

## Key Features
- Explore available offers between creators and brands
- Create new Adcoins
- View and manage your Adcoins
- User profile management
