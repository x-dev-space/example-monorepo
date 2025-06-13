# Example Monorepo - Micro-Frontend E-commerce Platform

A modern micro-frontend e-commerce platform built with React, Module Federation, and Nx monorepo architecture.

## 🏗️ Architecture Overview

This monorepo demonstrates a micro-frontend architecture using Module Federation, where independent applications can be developed, deployed, and scaled separately while working together as a cohesive user experience.

### Applications

#### 🗂️ `apps/appContainer`
**Host Application - Shopping Cart Interface**
- **Purpose**: Main container application that orchestrates all micro-frontends
- **Technology**: React 18, TypeScript, Rspack, Tailwind CSS
- **Features**:
  - Shopping cart with product management
  - Quantity controls and item removal
  - Order summary calculations
  - Payment method selection
  - Responsive design
- **Module Federation**: Host application that consumes `header` and `couponCode` remotes
- **Deployment**: Serves as the main entry point for the application

#### 🧭 `apps/header`
**Navigation Micro-Frontend**
- **Purpose**: Reusable header component with navigation and branding
- **Technology**: React 18, TypeScript, Rspack, Tailwind CSS
- **Features**:
  - Company branding with logo
  - Navigation menu
  - Shopping cart and search icons
  - User dashboard button
  - Responsive design
- **Module Federation**: Exposes `./Module` for consumption by other applications
- **Reusability**: Can be used across multiple applications in the ecosystem

#### 🎫 `apps/couponCode`
**Coupon Management Micro-Frontend**
- **Purpose**: Standalone coupon code input and validation component
- **Technology**: React 18, TypeScript, Rspack, Tailwind CSS
- **Features**:
  - Coupon code input field
  - Apply coupon functionality
  - Form validation and state management
- **Module Federation**: Exposes `./Module` for consumption by other applications
- **Integration**: Seamlessly integrates into checkout flows

### End-to-End Testing

Each application includes comprehensive E2E testing:
- `apps/header-e2e` - Tests for header component functionality
- `apps/couponCode-e2e` - Tests for coupon code workflows
- `apps/appContainer-e2e` - Tests for complete shopping cart experience

## 🛠️ Technology Stack

### Core Framework
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5.6.2** - Type-safe JavaScript development
- **Nx 20.3.3** - Monorepo tooling and workspace management

### Build & Bundling
- **Rspack 1.1.5** - Fast Rust-based bundler (Webpack alternative)
- **Module Federation Enhanced 0.8.8** - Micro-frontend architecture
- **SWC** - Fast JavaScript/TypeScript compilation

### Styling & UI
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **PostCSS 8.4.38** - CSS processing and optimization
- **Lucide React 0.513.0** - Beautiful & consistent icons

### Testing
- **Jest 29.7.0** - JavaScript testing framework
- **React Testing Library 15.0.6** - React component testing utilities
- **Playwright 1.36.0** - End-to-end testing framework

### Code Quality
- **ESLint 9.8.0** - JavaScript/TypeScript linting
- **Prettier 2.6.2** - Code formatting
- **TypeScript ESLint 8.13.0** - TypeScript-specific linting rules

### Package Management
- **PNPM 9.15.3** - Fast, disk space efficient package manager
- **Node.js v22.13.0** - JavaScript runtime

## 🔄 Development Workflow

### Git Hooks & Quality Assurance

#### Husky Configuration (`.husky/`)
- **`pre-commit`**: Runs `pnpm nx affected -t lint test typecheck` on affected projects
- **`prepare-commit-msg`**: Ensures proper commit message formatting
- **`post-checkout`**: Performs cleanup and setup tasks after branch switching

#### Commit Standards
- **Commitizen Integration**: Uses `@digitalroute/cz-conventional-changelog-for-jira`
- **Conventional Commits**: Standardized commit message format
- **Jira Integration**: Links commits to Jira tickets automatically

### CI/CD Pipeline (`.github/`)

#### Workflows
1. **`build-and-quality-check.yml`**
   - Triggers on pull requests to `main`
   - Runs comprehensive quality checks
   - Uses custom GitHub Actions for setup and validation

2. **`deploy-prod.yml`**
   - Production deployment pipeline
   - Automated deployment to production environment

3. **`create_branch_from_jira.yml`**
   - Automates branch creation from Jira tickets
   - Maintains consistency between project management and development

#### Custom GitHub Actions
- **`setup-e2e-dependencies`**: Configures end-to-end testing environment
- **`quality-checks`**: Comprehensive code quality validation

## 🚀 Getting Started

### Prerequisites
- Node.js v22.13.0
- PNPM 9.15.3

### Installation
```bash
# Install dependencies
pnpm install

# Install exact PNPM version
pnpm run update-pnpm
```

### Development Commands
```bash
# Start all applications in development mode
pnpm nx run-many -t serve

# Start specific application
pnpm nx serve appContainer
pnpm nx serve header
pnpm nx serve couponCode

# Run tests for affected projects
pnpm nx affected -t test

# Run E2E tests
pnpm nx affected -t e2e

# Lint affected projects
pnpm nx affected -t lint

# Type check affected projects
pnpm nx affected -t typecheck

# Build for production
pnpm nx affected -t build
```

### Module Federation Development
```bash
# Start header micro-frontend
pnpm nx serve header

# Start couponCode micro-frontend  
pnpm nx serve couponCode

# Start host application (will consume the above remotes)
pnpm nx serve appContainer
```

## 📁 Project Structure

```
├── apps/
│   ├── appContainer/          # Host application - shopping cart
│   ├── appContainer-e2e/      # E2E tests for main app
│   ├── header/                # Header micro-frontend
│   ├── header-e2e/            # E2E tests for header
│   ├── couponCode/            # Coupon micro-frontend
│   └── couponCode-e2e/        # E2E tests for coupon code
├── .github/
│   ├── workflows/             # CI/CD workflows
│   ├── actions/               # Custom GitHub Actions
│   └── scripts/               # Automation scripts
├── .husky/                    # Git hooks configuration
├── nx.json                    # Nx workspace configuration
├── package.json               # Root package configuration
├── pnpm-workspace.yaml        # PNPM workspace setup
└── tsconfig.base.json         # Base TypeScript configuration
```

## 🔧 Configuration Files

### Module Federation
Each micro-frontend includes:
- `module-federation.config.ts` - Defines exposed modules and remote consumption
- `rspack.config.ts` - Rspack bundler configuration
- `rspack.config.prod.ts` - Production-specific build settings

### Quality Assurance
- `eslint.config.cjs` - ESLint configuration
- `jest.config.ts` - Jest testing configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.*.json` - TypeScript configurations

## 🌟 Key Features

### Micro-Frontend Benefits
- **Independent Development**: Teams can work on different parts simultaneously
- **Technology Flexibility**: Each micro-frontend can use different tech stacks
- **Scalable Deployment**: Applications can be deployed independently
- **Code Sharing**: Common components and utilities can be shared across apps

### Developer Experience
- **Fast Development**: Rspack provides near-instant builds
- **Type Safety**: Full TypeScript support across all applications
- **Automated Testing**: Comprehensive test coverage with Jest and Playwright
- **Code Quality**: Automated linting, formatting, and type checking
- **Git Integration**: Automated workflows with Husky and Commitizen

### Performance Optimizations
- **Code Splitting**: Automatic code splitting with Module Federation
- **Caching**: Nx computation caching for faster builds
- **Tree Shaking**: Dead code elimination for smaller bundles
- **Hot Module Replacement**: Fast development feedback loops

## 📈 Scalability Considerations

This architecture supports:
- **Horizontal Scaling**: Add new micro-frontends easily
- **Team Autonomy**: Independent development and deployment cycles
- **Technology Evolution**: Gradual migration to new technologies
- **Performance Monitoring**: Individual application monitoring and optimization

## 🤝 Contributing

1. Follow conventional commit standards
2. Ensure all quality checks pass before submitting PRs
3. Write comprehensive tests for new features
4. Update documentation for architectural changes
5. Use the provided GitHub Actions for consistent CI/CD

---

**Built with ❤️ using Nx, React, and Module Federation**
