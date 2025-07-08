# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zanos is a Next.js-based digital nomad platform that combines travel AI assistance, Web3 wallet integration, and e-sim services. The application serves as a comprehensive tool for digital nomads seeking regulatory guidance, travel planning, and connectivity solutions.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Environment Setup
- Requires `ANTHROPIC_API_KEY` environment variable for TravelAI functionality
- Requires `NEXT_PUBLIC_PROJECT_ID` for Reown/WalletConnect integration

## Architecture Overview

### Core Components Structure
- **App Router**: Uses Next.js 15 App Router with TypeScript
- **State Management**: Wagmi for Web3 state, TanStack Query for data fetching
- **Styling**: Tailwind CSS with custom dark theme
- **AI Integration**: Claude AI with specialized agent routing

### Key Application Layers

1. **Frontend Layer** (`src/app/`)
   - `layout.tsx` - Root layout with ContextProvider wrapper
   - `page.tsx` - Main landing page with service sections
   - `context/index.tsx` - Web3 context provider with Wagmi and AppKit

2. **Component Layer** (`src/components/`)
   - `TravelAI.tsx` - Chat interface for AI travel assistance

3. **API Layer** (`src/app/api/`)
   - `agent/route.ts` - AI agent routing and Claude AI integration

4. **Configuration Layer** (`src/app/config/`)
   - Web3 configuration with Wagmi adapter and network setup

### TravelAI Agent System

The AI system uses a multi-agent approach:
- **Classification Layer**: Routes queries to appropriate specialist agents
- **Specialist Agents**:
  - Information Agent: Visa, tax, and regulatory guidance
  - Transport Agent: Travel arrangements and accommodation
  - Dining Agent: Food recommendations and dietary considerations

### Web3 Integration

- **Wallet Provider**: Reown AppKit with Wagmi adapter
- **Supported Networks**: Mainnet and Arbitrum
- **Features**: Social login, email authentication, network switching
- **Storage**: Cookie-based session persistence for SSR

### UI/UX Patterns

- **Color Scheme**: Dark theme with gray-900 background
- **Component Structure**: Card-based layout with rounded corners and borders
- **Responsive Design**: Mobile-first approach with grid layouts
- **Interactive Elements**: Hover states and transition animations

## File Structure Conventions

- Components use PascalCase (e.g., `TravelAI.tsx`)
- API routes follow Next.js conventions (`route.ts`)
- Configuration files use lowercase with extensions (e.g., `index.tsx`)
- Absolute imports configured with `@/*` path mapping

## Development Patterns

### TypeScript Usage
- Strict mode enabled with comprehensive type checking
- Interface definitions for API responses and component props
- Proper typing for Web3 hooks and Claude AI responses

### Error Handling
- Try-catch blocks for API calls and async operations
- Graceful fallbacks for AI agent failures
- User-friendly error messages in UI components

### Environment Variables
- Anthropic API key for AI functionality
- Reown project ID for Web3 integration
- Proper validation for required environment variables

## Testing and Quality

- ESLint configured with Next.js and TypeScript rules
- No testing framework currently configured
- Manual testing through development server recommended

## Config

- keep "apiVersion:" at "2025-06-30.basil"