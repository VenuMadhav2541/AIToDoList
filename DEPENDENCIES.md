# Dependencies List

## Core Framework Dependencies

### Backend (Express.js + TypeScript)
- `express` - Web framework for Node.js
- `typescript` - TypeScript language support
- `tsx` - TypeScript execution environment
- `@types/express` - Express TypeScript definitions
- `@types/node` - Node.js TypeScript definitions

### Database & ORM
- `drizzle-orm` - Type-safe ORM for PostgreSQL
- `drizzle-kit` - Schema management and migrations
- `postgres` - PostgreSQL client for Node.js
- `@neondatabase/serverless` - Serverless PostgreSQL client
- `drizzle-zod` - Zod schema integration with Drizzle

### AI Integration
- `openai` - OpenAI API client for GPT-4o integration

### Session Management
- `express-session` - Session middleware for Express
- `connect-pg-simple` - PostgreSQL session store
- `@types/express-session` - Session TypeScript definitions

## Frontend Dependencies

### React Framework
- `react` - React library
- `react-dom` - React DOM rendering
- `@types/react` - React TypeScript definitions
- `@types/react-dom` - React DOM TypeScript definitions

### Build Tools & Development
- `vite` - Fast build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite
- `esbuild` - Fast JavaScript bundler

### Routing & State Management
- `wouter` - Minimalist client-side routing
- `@tanstack/react-query` - Server state management

### UI Components & Styling
- `tailwindcss` - Utility-first CSS framework
- `@tailwindcss/typography` - Typography plugin for Tailwind
- `@tailwindcss/vite` - Vite plugin for Tailwind
- `postcss` - CSS post-processor
- `autoprefixer` - CSS vendor prefixing

### Radix UI Components
- `@radix-ui/react-accordion` - Accessible accordion component
- `@radix-ui/react-alert-dialog` - Alert dialog component
- `@radix-ui/react-avatar` - Avatar component
- `@radix-ui/react-checkbox` - Checkbox component
- `@radix-ui/react-dialog` - Dialog component
- `@radix-ui/react-dropdown-menu` - Dropdown menu component
- `@radix-ui/react-label` - Label component
- `@radix-ui/react-popover` - Popover component
- `@radix-ui/react-select` - Select component
- `@radix-ui/react-separator` - Separator component
- `@radix-ui/react-slot` - Slot component
- `@radix-ui/react-tabs` - Tabs component
- `@radix-ui/react-toast` - Toast notification component
- `@radix-ui/react-tooltip` - Tooltip component

### Icons & Utilities
- `lucide-react` - Beautiful icon library
- `class-variance-authority` - Class variance utility
- `clsx` - Conditional className utility
- `tailwind-merge` - Tailwind class merging utility

### Form Handling & Validation
- `react-hook-form` - Performant forms with easy validation
- `@hookform/resolvers` - Validation resolvers for react-hook-form
- `zod` - TypeScript-first schema validation

### Animation & Interaction
- `framer-motion` - Production-ready motion library
- `embla-carousel-react` - Carousel component

### Date & Utility Libraries
- `date-fns` - Date utility library
- `nanoid` - Tiny URL-safe unique string ID generator

### Development & Theme
- `next-themes` - Theme switching utility
- `tailwindcss-animate` - Animation utilities for Tailwind

## Development Dependencies

### TypeScript Support
- `@types/connect-pg-simple` - Session store TypeScript definitions
- `@types/passport` - Passport TypeScript definitions
- `@types/passport-local` - Passport local strategy definitions
- `@types/ws` - WebSocket TypeScript definitions

### Build & Bundle Analysis
- `@jridgewell/trace-mapping` - Source map utilities
- `@replit/vite-plugin-cartographer` - Replit-specific Vite plugin
- `@replit/vite-plugin-runtime-error-modal` - Runtime error modal plugin

## Total Package Count
- **Production Dependencies**: ~50 packages
- **Development Dependencies**: ~15 packages
- **Total**: ~65 packages

All dependencies are carefully selected for:
- Type safety with TypeScript
- Modern React patterns
- Accessible UI components
- High performance
- Developer experience