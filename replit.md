# Adcoin - Base Mini App

## Overview
Adcoin is a Next.js 16 Base mini app that allows brands to connect with creators through a token-based offer system. Users can explore offers, create Adcoins, and manage their profiles. This app is built as a Base mini app and can be launched from the Base app.

## Tech Stack
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics
- **Base SDK**: @farcaster/miniapp-sdk for mini app integration

## Project Structure
```
app/                                - Next.js App Router pages and layouts
  .well-known/farcaster.json/       - Base mini app manifest
components/                         - React components
  ui/                               - Base UI components (shadcn/ui)
lib/                                - Utility functions
public/                             - Static assets (images, icons)
styles/                             - Global CSS styles
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start`

## Base Mini App Integration
- SDK installed: `@farcaster/miniapp-sdk`
- Ready event called in `app/page.tsx` using `sdk.actions.ready()`
- Manifest hosted at `/.well-known/farcaster.json`
- Embed metadata included in layout metadata with `fc:miniapp` tag
- Configured for deployment on Base app

## Configuration
- Next.js is configured to allow Replit proxy origins for development
- TypeScript build errors are ignored for faster development
- Images are unoptimized for compatibility
- `NEXT_PUBLIC_URL` environment variable can be set for production deployment

## Key Features
- Explore available offers between creators and brands
- Create new Adcoins
- View and manage your Adcoins
- User profile management
- Base mini app integration for sharing and launching from Base app

## Next Steps for Production
1. Set `NEXT_PUBLIC_URL` environment variable to your deployment URL
2. Deploy the app to production
3. Generate account association credentials using Base Build's Account Association tool
4. Add the generated credentials to the manifest file
5. Use Base Build Preview tool to validate your app
6. Share your app URL in the Base app to publish
