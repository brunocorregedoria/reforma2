# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with this residential renovation management system.

## Architecture Overview

This is a modern full-stack residential renovation management system following componentization, TDD, and leaf node organization principles.

### Backend (Node.js/Express + Service Layer)
- **Entry Point**: `backend/src/server.js`
- **Database**: PostgreSQL with Sequelize ORM
- **Architecture**: Controllers → Services → Models pattern
- **Authentication**: JWT-based with role-based access control (admin, gestor, tecnico, visualizador)
- **File Uploads**: Multer with EXIF metadata preservation for photos
- **API Structure**: RESTful endpoints under `/api/` prefix
- **Testing**: Jest + Supertest for comprehensive backend testing

### Frontend (React 19 + Vite + Modern Patterns)
- **Entry Point**: `frontend/src/App.jsx`
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Architecture**: Atomic components + Custom hooks + Service layer
- **PWA**: Progressive Web App with offline capabilities
- **State Management**: Custom hooks (useAuth, useDashboardData) + React Context
- **Routing**: React Router DOM with protected routes
- **Testing**: Vitest + Testing Library for component and hook testing
- **Performance**: React.memo, lazy loading, virtualization, debounce

### Database Models
Core entities with relationships (unchanged from original design):
- **users** → **work_orders** (responsavel_id)
- **projects** → **work_orders** (project_id)
- **work_orders** → **checkpoints**, **material_usages**, **attachments**
- **materials** → **material_usages**
- **logs** (audit trail for all changes)

## Development Commands

### Root Level
```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend in development
npm run dev

# Docker operations
npm run docker:up
npm run docker:down
npm run docker:logs
```

### Backend (from /backend)
```bash
# Development server with hot reload
npm run dev

# Run tests (Jest + Supertest)
npm test
npm run test:watch

# Database operations
npm run migrate
npm run seed
```

### Frontend (from /frontend)
```bash
# Development server (includes performance monitor)
pnpm run dev

# Build for production
pnpm run build

# Run tests (Vitest + Testing Library)
pnpm test
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Lint code
pnpm run lint

# Type checking
pnpm run typecheck
```

## Environment Variables

### Backend Required
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV` (development/production/test)
- `PORT` (default: 3001)

### Frontend Required  
- `VITE_API_URL` (default: http://localhost:3001)

## Modern Architecture Patterns

### Backend Service Layer Architecture
```
Controllers (HTTP handling) → Services (Business logic) → Models (Data layer)
```

**Service Layer Benefits:**
- **BaseService**: Common CRUD operations for all entities
- **ProjectService**: Project-specific business logic
- **AuthService**: Centralized authentication logic
- **Separation of Concerns**: Controllers focus only on HTTP, Services handle business rules

**Example Service Usage:**
```javascript
// In Controller
const projectService = new ProjectService();
const result = await projectService.createProject(projectData, userId);

// In Service
class ProjectService extends BaseService {
  async createProject(data, userId) {
    // Business logic validation
    // Data transformation
    // Database operations
    return await this.create(data);
  }
}
```

### Frontend Component Architecture

#### Atomic Components (Reusable Building Blocks)
- **StatCard** (`/components/dashboard/StatCard.jsx`): Statistics display with memoization
- **ActivityItem** (`/components/dashboard/ActivityItem.jsx`): Activity feed items
- **FormField** (`/components/form/FormField.jsx`): Form input with validation
- **SubmitButton** (`/components/form/SubmitButton.jsx`): Button with loading states
- **AuthLayout** (`/components/auth/AuthLayout.jsx`): Authentication page layout

#### Custom Hooks (Business Logic Separation)
- **useAuth** (`/hooks/useAuth.js`): Complete authentication management
- **useDashboardData** (`/hooks/useDashboardData.js`): Dashboard data fetching and caching
- **useForm** (`/hooks/useForm.js`): Form state and validation management
- **useLocalStorage** (`/hooks/useLocalStorage.js`): Reactive localStorage persistence
- **useDebounce** (`/hooks/useDebounce.js`): Performance optimization for inputs

#### Performance Optimization Components
- **LazyImage** (`/components/ui/LazyImage.jsx`): Intersection Observer based lazy loading
- **VirtualList** (`/components/ui/VirtualList.jsx`): Large list virtualization
- **SearchInput** (`/components/ui/SearchInput.jsx`): Debounced search with clear button
- **PerformanceMonitor** (`/components/dev/PerformanceMonitor.jsx`): Development performance tracking

### Component Usage Patterns

#### Dashboard Implementation
```javascript
// Before: 220+ lines monolithic component
// After: Clean, atomic composition
const Dashboard = () => {
  const { statsCards, projectStats, recentActivities, loading, error, refreshData } = useDashboardData();
  
  return (
    <div>
      {statsCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
      {recentActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
      <ProjectStatusCard stats={projectStats} />
    </div>
  );
};
```

#### Form Implementation
```javascript
// Using custom form hook with validation
const Login = () => {
  const { values, errors, loading, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (formData) => {
      const result = await login(formData);
      if (result.success) navigate('/');
      return result;
    }
  );

  return (
    <AuthLayout title="Login" description="Enter credentials">
      <form onSubmit={(e) => handleSubmit(e, validationRules)}>
        <FormField
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>
    </AuthLayout>
  );
};
```

## File Structure (Updated)

### Frontend Organization
```
frontend/src/
├── components/
│   ├── ui/                    # Base UI components + optimizations
│   │   ├── LazyImage.jsx     # Lazy loading images
│   │   ├── VirtualList.jsx   # Large list virtualization
│   │   └── SearchInput.jsx   # Debounced search input
│   ├── form/                 # Reusable form components
│   │   ├── FormField.jsx     # Input with validation
│   │   └── SubmitButton.jsx  # Button with loading state
│   ├── dashboard/            # Dashboard-specific components
│   │   ├── StatCard.jsx      # Statistics card (memoized)
│   │   ├── ActivityItem.jsx  # Activity feed item
│   │   └── ProjectStatusCard.jsx
│   ├── auth/                 # Authentication layouts
│   │   └── AuthLayout.jsx    # Common auth page layout
│   └── dev/                  # Development tools
│       └── PerformanceMonitor.jsx
├── hooks/                    # Custom business logic hooks
│   ├── useAuth.js           # Authentication management
│   ├── useDashboardData.js  # Dashboard data fetching
│   ├── useForm.js           # Form state and validation
│   ├── useLocalStorage.js   # Reactive localStorage
│   ├── useDebounce.js       # Input debouncing
│   └── useThrottle.js       # Function throttling
├── pages/                   # Main application pages
│   ├── Dashboard.jsx        # Refactored dashboard (clean)
│   ├── Login.jsx           # Refactored with form hooks
│   └── Register.jsx        # New registration page
├── utils/                   # Performance and utility functions
│   └── performance.js       # Performance optimization utilities
└── test/                    # Test utilities and setup
    ├── setup.js            # Test environment configuration
    └── utils.jsx           # Test helper functions
```

### Backend Organization  
```
backend/src/
├── services/               # Business logic layer (NEW)
│   ├── BaseService.js     # Common CRUD operations
│   ├── ProjectService.js  # Project business logic
│   └── AuthService.js     # Authentication logic
├── controllers/           # HTTP request handlers (simplified)
├── models/               # Sequelize models
├── routes/               # API route definitions
├── middleware/           # Authentication, logging, validation
└── tests/                # Jest + Supertest tests
```

## Testing Strategy

### Frontend Testing (Vitest + Testing Library)
```bash
# Component tests
frontend/src/components/**/__tests__/*.test.jsx

# Hook tests  
frontend/src/hooks/__tests__/*.test.js

# Page integration tests
frontend/src/pages/__tests__/*.test.jsx

# Test utilities
frontend/src/test/setup.js
frontend/src/test/utils.jsx
```

**Testing Patterns:**
- **Component Testing**: Behavior-focused testing with user interactions
- **Hook Testing**: Isolated testing of custom hooks with renderHook
- **Integration Testing**: Full page flows with mocked dependencies
- **Performance Testing**: Render count and optimization validation

### Backend Testing (Jest + Supertest)
```bash
# Service layer tests
backend/src/tests/services/*.test.js

# API integration tests  
backend/src/tests/api/*.test.js

# Model tests
backend/src/tests/models/*.test.js
```

## Performance Optimization Guide

### Implemented Optimizations

#### Component Level
- **React.memo**: All atomic components memoized to prevent unnecessary re-renders
- **useMemo/useCallback**: Expensive calculations and event handlers memoized
- **Lazy Loading**: Images loaded only when visible (Intersection Observer)

#### List Rendering
- **VirtualList**: Large datasets rendered with virtualization
- **Progressive Rendering**: Large lists loaded in chunks
- **Debounced Search**: Search inputs optimized with 300ms debounce

#### Development Monitoring
- **PerformanceMonitor**: Real-time FPS, memory, and render tracking
- **Component Render Tracking**: Development-only render count monitoring

### Performance Monitoring
The PerformanceMonitor component (visible only in development) tracks:
- **FPS**: Frame rate performance
- **Memory Usage**: JavaScript heap usage
- **Render Count**: Component re-render frequency
- **Performance Timeline**: Historical performance data

## API Structure (Enhanced)

Base URL: `/api`

### Enhanced Endpoints
- `/auth` - Authentication with service layer (login, register, profile)
- `/projects` - Project management with ProjectService business logic
- `/work_orders` - Work order CRUD with enhanced statistics
- `/materials` - Material catalog with stock management
- `/checkpoints` - Quality control checklists with templates
- `/attachments` - File upload/download with metadata
- `/vendors` - Supplier management

### Service Layer Integration
Controllers now delegate business logic to services:
```javascript
// Controller (simplified)
const createProject = async (req, res) => {
  const result = await projectService.createProject(req.body, req.user.id);
  res.status(201).json(result);
};

// Service (business logic)
class ProjectService extends BaseService {
  async createProject(data, userId) {
    // Validation, business rules, data transformation
    return await this.create({ ...data, created_by: userId });
  }
}
```

## Development Workflow

### Adding New Features

#### Frontend Component
1. Create atomic component in appropriate directory
2. Add React.memo for performance
3. Write comprehensive tests
4. Create custom hook if business logic required
5. Export from index.js

#### Backend Feature
1. Create/update service in `/services/`
2. Update controller to use service
3. Add route definitions
4. Write service and API tests
5. Update API documentation

### Testing Workflow
```bash
# Frontend - watch mode during development
cd frontend && pnpm run test:watch

# Backend - watch mode during development  
cd backend && npm run test:watch

# Full test suite before commits
npm run test:all
```

### Code Quality Checklist
- [ ] Components memoized with React.memo
- [ ] Business logic extracted to custom hooks
- [ ] Form validation with error handling
- [ ] Loading and error states implemented
- [ ] Tests written for components and hooks
- [ ] Performance optimizations applied
- [ ] Accessibility attributes added
- [ ] TypeScript/PropTypes for type safety

## Architecture Benefits

### Maintainability
- **Atomic Components**: Small, focused, single-responsibility components
- **Custom Hooks**: Reusable business logic separated from UI
- **Service Layer**: Business logic centralized and testable
- **Clear Separation**: UI, logic, and data layers clearly separated

### Performance
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Reduces initial bundle size and load time
- **Virtualization**: Handles large datasets efficiently
- **Debouncing**: Optimizes API calls and user interactions

### Developer Experience
- **Performance Monitor**: Real-time development feedback
- **Comprehensive Testing**: High confidence in code changes
- **Type Safety**: PropTypes and validation throughout
- **Clear Structure**: Intuitive file organization and naming

### Scalability
- **Component Reusability**: Easy to extend and modify
- **Service Architecture**: Business logic isolated and testable
- **Hook Patterns**: State management scales with complexity
- **Test Coverage**: Confident refactoring and feature additions

This architecture provides a solid foundation for continued development while maintaining high performance, excellent developer experience, and robust testing coverage.