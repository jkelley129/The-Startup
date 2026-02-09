# Contributing to PulseAI

Thank you for your interest in contributing to PulseAI! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/The-Startup.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](../SETUP.md)

## Development Workflow

### Code Style
- We use TypeScript for all source code
- Follow the existing code patterns and conventions
- Use Tailwind CSS for styling
- Keep components focused and single-responsibility

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
npm run lint
```

### Database Changes
- Add new models to `prisma/schema.prisma`
- Run `npx prisma db push` for development
- Create proper migrations for production: `npx prisma migrate dev --name description`

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Keep PRs focused and reasonably sized
5. Write clear commit messages

### Commit Message Format
```
type(scope): description

Examples:
feat(analytics): add p99 latency metric
fix(auth): handle expired JWT tokens gracefully
docs(api): update events endpoint documentation
```

## Project Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── (auth)/       # Authentication pages
│   │   └── (dashboard)/  # Dashboard pages
│   ├── lib/              # Shared utilities and business logic
│   └── components/       # Reusable React components
├── prisma/               # Database schema and migrations
└── tests/                # Test files
```

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Questions?

Open an issue or start a discussion in the repository.
