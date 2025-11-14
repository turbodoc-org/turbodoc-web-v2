# Turbodoc Web

A modern, responsive web application for managing bookmarks, notes, code snippets, and visual diagrams. Built with TanStack Start and React 19, the web app provides a seamless experience for saving, organizing, and accessing your content with real-time synchronization across all your devices.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- Supabase project (for authentication and data storage)
- Cloudflare account (for deployment)

### Installation

```bash
pnpm install
```

### Environment Setup

1. Create your environment file:

   ```bash
   touch .env
   ```

2. Configure your environment variables:

   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_API_URL=https://api.turbodoc.ai
   ```

   The Supabase values can be found in your [Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Architecture

### Tech Stack

- **Framework**: TanStack Start (React framework with file-based routing)
- **Runtime**: React 19 with modern concurrent features
- **Build Tool**: Vite for blazing-fast builds and HMR
- **Language**: TypeScript with strict mode
- **Authentication**: Supabase Auth with SSR support
- **Database**: Supabase (PostgreSQL) via REST API
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: TanStack Query for server state + React hooks
- **Routing**: TanStack Router with file-based routing
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode switching
- **Code Editor**: CodeMirror 6 with multi-language support
- **Markdown Editor**: MDXEditor for rich text editing
- **Diagram Canvas**: HTML Canvas API with drag-and-drop

### Project Structure

```txt
turbodoc-web-v2/
├── src/
│   ├── routes/                      # File-based routing
│   │   ├── __root.tsx              # Root layout
│   │   ├── index.tsx               # Landing page
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login.tsx
│   │   │   ├── sign-up.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── confirm.tsx
│   │   │   └── error.tsx
│   │   ├── bookmarks/              # Bookmark management
│   │   │   ├── index.tsx
│   │   │   └── $id.tsx
│   │   ├── notes/                  # Note management
│   │   │   ├── index.tsx
│   │   │   └── $id.tsx
│   │   ├── code/                   # Code snippet management
│   │   │   ├── index.tsx
│   │   │   └── $id.tsx
│   │   └── diagrams/               # Visual diagram editor
│   │       ├── index.tsx
│   │       └── $id.tsx
│   ├── components/                  # React components
│   │   ├── ui/                     # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── shared/                 # Shared app components
│   │   │   ├── app-header.tsx
│   │   │   ├── logo.tsx
│   │   │   └── theme-switcher.tsx
│   │   ├── bookmark/               # Bookmark components
│   │   │   ├── bookmark-card.tsx
│   │   │   └── bookmark-grid.tsx
│   │   ├── note/                   # Note components
│   │   │   ├── note-card.tsx
│   │   │   ├── note-editor.tsx
│   │   │   └── note-grid.tsx
│   │   ├── code/                   # Code snippet components
│   │   │   ├── code-card.tsx
│   │   │   ├── code-editor.tsx
│   │   │   └── code-grid.tsx
│   │   └── diagram/                # Diagram components
│   │       ├── diagram-canvas.tsx
│   │       ├── diagram-card.tsx
│   │       └── diagram-grid.tsx
│   ├── lib/                        # Utilities and configurations
│   │   ├── auth/                   # Authentication utilities
│   │   │   ├── context.tsx
│   │   │   └── provider.tsx
│   │   ├── clients/                # External clients
│   │   │   └── supabase/
│   │   │       ├── client.ts       # Browser client
│   │   │       └── server.ts       # Server client
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── api.ts                  # API integration layer
│   │   ├── types.ts                # TypeScript type definitions
│   │   └── utils.ts                # Utility functions
│   ├── router.tsx                  # Router configuration
│   ├── routeTree.gen.ts           # Generated route tree
│   └── styles.css                  # Global styles
├── public/                         # Static assets
├── wrangler.jsonc                  # Cloudflare Pages configuration
└── vite.config.ts                  # Vite configuration
```

### Key Features

#### Content Management

- **Smart Bookmarks**: Save, organize, and search bookmarks with tags and status tracking (read/unread/archived)
- **Markdown Notes**: Rich text editing with MDXEditor, full Markdown support, and instant preview
- **Code Snippets**: Multi-language syntax highlighting with CodeMirror 6, one-click copy, and syntax validation
- **Visual Diagrams**: Drag-and-drop canvas editor for flowcharts and diagrams with export to PNG/PDF

#### Authentication System

- **Email/Password**: Secure authentication with Supabase Auth
- **Server-Side Rendering**: Full SSR support with cookie-based sessions
- **Automatic Redirects**: Protected routes with middleware
- **Password Reset**: Email-based password recovery
- **Session Management**: Automatic token refresh and persistence

#### User Interface

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: System-aware theme switching with smooth transitions
- **Accessible**: WCAG 2.1 compliant components
- **Modern Design**: Clean, minimal interface with smooth animations
- **Loading States**: Proper loading indicators and skeleton screens
- **Real-time Sync**: Changes synchronized across all devices instantly

## 🎨 UI Components

### Design System

Built on **shadcn/ui** with fully customized components:

- **Button**: Various styles and sizes with loading states
- **Card**: Container component for content display
- **Dialog**: Modal overlays for forms and confirmations
- **Form**: Validated forms with error handling
- **Input**: Text inputs with validation states
- **Badge**: Tag display with different variants
- **Tooltip**: Contextual help and information
- **Dropdown**: Action menus and selectors

### Custom Components

- **BookmarkCard**: Individual bookmark with metadata and actions
- **BookmarkGrid**: Responsive grid layout for bookmarks
- **NoteCard**: Note preview with title and excerpt
- **NoteEditor**: Full-featured Markdown editor with toolbar
- **CodeEditor**: Syntax-highlighted code editor with language selection
- **DiagramCanvas**: Interactive canvas for creating visual diagrams
- **ThemeSwitcher**: Toggle between light and dark modes
- **AppHeader**: Responsive navigation with authentication state

## 🔐 Authentication Flow

### SSR Authentication

The app uses Supabase Auth with Server-Side Rendering:

1. **Router Integration**: Authentication state managed through TanStack Router
2. **Context Provider**: Global auth state accessible throughout the app
3. **Protected Routes**: Automatic redirects for unauthenticated users
4. **Cookie Management**: Secure HTTP-only cookies for sessions

### Protected Routes

- `/bookmarks/*`: Requires authenticated user
- `/notes/*`: Requires authenticated user
- `/code/*`: Requires authenticated user
- `/diagrams/*`: Requires authenticated user
- Automatic redirects to `/auth/login` for unauthenticated users
- Post-login redirects back to intended destination

### Authentication Pages

- **Sign In** (`/auth/login`): Email and password authentication
- **Sign Up** (`/auth/sign-up`): User registration with email verification
- **Forgot Password** (`/auth/forgot-password`): Password reset flow
- **Confirmation** (`/auth/confirm`): Email verification landing
- **Error** (`/auth/error`): Authentication error handling

## 🌐 API Integration

### Backend Communication

The web app communicates with the Turbodoc API:

- **REST Endpoints**: Full CRUD operations for all content types
- **Authentication**: JWT bearer tokens for API access
- **Error Handling**: Consistent error responses and user feedback
- **Type Safety**: Shared TypeScript types with API
- **Real-time Updates**: Optimistic updates with error rollback

### Data Management

- **TanStack Query**: Efficient server state management with caching
- **Route Loaders**: Pre-fetch data before route navigation
- **Optimistic Updates**: Instant UI feedback with background sync
- **Cache Invalidation**: Smart cache updates on mutations
- **Error Recovery**: Automatic retry and error boundaries

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm serve` | Preview production build locally |
| `pnpm preview` | Build and preview with Wrangler |
| `pnpm format` | Format code with Biome |
| `pnpm lint` | Run Biome linting |
| `pnpm check` | Run Biome checks (lint + format) |

### Deployment Commands

| Command | Description |
|---------|-------------|
| `pnpm deploy` | Build and deploy to Cloudflare Pages |
| `pnpm cf-typegen` | Generate Cloudflare Worker types |

## 🚀 Deployment

### Cloudflare Pages

1. **Build the application**:

   ```bash
   pnpm build
   ```

2. **Deploy to Cloudflare Pages**:

   ```bash
   pnpm deploy
   ```

3. **Configure environment variables** in Cloudflare Pages dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_API_URL`

### Automatic Deployment

Connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. **Build command**: `pnpm build`
2. **Build output directory**: `dist`
3. **Environment variables**: Configure in Cloudflare dashboard

## 🔄 Integration

### Cross-Platform Synchronization

- **Shared Database**: Same Supabase backend as iOS and Android apps
- **Real-time Updates**: Changes sync across all platforms instantly
- **Consistent API**: Uses Turbodoc REST API for all operations
- **Authentication**: Shared user accounts across all platforms

### Browser Extensions

- **Chrome Extension**: Save content directly from your browser
- **Firefox Extension**: Full feature parity with Chrome version
- **Context Menu**: Right-click to save links, text, and images
- **One-Click Sync**: Instant synchronization with web app

### Mobile Apps (Coming Soon)

- **iOS App**: Native SwiftUI app with share extension and offline mode
- **Android App**: Material Design 3 app with widget support

### Third-Party Services

- **Supabase**: Authentication, database, and real-time subscriptions
- **Cloudflare**: CDN, edge computing, and DNS management
- **Turbodoc API**: Centralized API for all CRUD operations

## ⚡ Performance

### Optimization Strategies

- **TanStack Start**: Fast SSR with optimal code splitting
- **Vite**: Lightning-fast development builds and HMR
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Unpic for optimal image loading
- **Lazy Loading**: Components loaded on demand
- **Edge Computing**: Cloudflare Pages for global CDN

### Monitoring

- **Core Web Vitals**: Monitor user experience metrics
- **Cloudflare Analytics**: Edge performance insights
- **React DevTools**: Component performance profiling

## 🎨 Styling

### Tailwind CSS 4

- **Utility Classes**: Rapid styling with utility-first approach
- **Custom Design System**: Consistent spacing, colors, and typography
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: Built-in dark mode with CSS variables
- **Vite Integration**: Instant CSS updates during development

### Component System

- **shadcn/ui**: High-quality, accessible base components
- **Custom Variants**: Extended components for specific use cases
- **Consistent Styling**: Design system with CSS variables
- **Animation**: Smooth transitions with tw-animate-css

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile-First Approach

- Progressive enhancement from mobile base styles
- Touch-friendly interface elements
- Optimized navigation for small screens
- Fast loading on mobile networks

## 🔍 SEO & Accessibility

### SEO Optimization

- **Meta Tags**: Dynamic meta tags for each page
- **Performance**: Fast loading for better search rankings
- **Sitemap**: Automatic sitemap generation
- **Semantic HTML**: Proper document structure

### Accessibility

- **WCAG 2.1**: AA compliance level
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Clear focus indicators

## 📚 Learn More

### Documentation

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Turbodoc Ecosystem

- [Turbodoc API Documentation](../turbodoc-api/README.md)
- [Turbodoc Browser Extensions](../turbodoc-extensions/README.md)
- [Turbodoc iOS App](../turbodoc-ios/README.md)
- [Project Overview](../README.md)

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Biome**: Follow configured linting and formatting rules
- **Components**: Reusable, well-documented components
- **Accessibility**: Maintain WCAG compliance
- **Performance**: Consider bundle size and runtime performance

## 🔒 Security

### Security Measures

- **HTTPS Only**: All communications encrypted
- **CSP Headers**: Content Security Policy implemented
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Built-in protection with secure cookies
- **Environment Variables**: Secure configuration management

### Best Practices

- **No Secrets in Client**: Environment variables properly scoped
- **Secure Headers**: Security headers configured in Cloudflare
- **Input Validation**: All user inputs validated with Zod
- **Error Handling**: Secure error messages without sensitive data

---

**Turbodoc Web** - Your digital workspace for everything you save. Built with TanStack Start for modern performance and developer experience.
