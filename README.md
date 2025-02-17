# Lunchtime Larry

A React Native + Firebase app for random restaurant selection and group lunch coordination.

## Project Structure

This is a monorepo containing the following packages:

- `/apps/mobile` - React Native mobile app (Expo)
- `/apps/web` - Web dashboard (Next.js)
- `/packages/core` - Shared business logic and types
- `/packages/ui` - Shared UI components
- `/functions` - Firebase Cloud Functions

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Firebase CLI
- Expo CLI

### Development

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
pnpm dev
```

## Architecture

- React Native (Expo) for mobile app
- Next.js for web dashboard
- Firebase for backend services
- TypeScript for type safety
- pnpm workspaces for monorepo management

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.