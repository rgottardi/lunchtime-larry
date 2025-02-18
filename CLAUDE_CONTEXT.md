# Claude Context for Lunchtime Larry Development

## Project Overview
Lunchtime Larry is a cross-platform application that helps groups decide where to eat lunch. The app uses a randomized selection algorithm that takes into account dietary restrictions, price preferences, and location to suggest restaurants.

## Technical Stack
- Frontend: React Native (mobile) and Next.js (web)
- Backend: Firebase (Auth, Firestore, Functions)
- Shared: TypeScript monorepo with shared UI and business logic
- State Management: Zustand and React Context
- UI Libraries: Custom components with Tailwind CSS for web

## Repository Structure
```
lunchtime-larry/
├── apps/
│   ├── mobile/        # React Native app
│   └── web/          # Next.js web app
├── packages/
│   ├── core/         # Shared business logic
│   └── ui/           # Shared UI components
└── functions/        # Firebase Cloud Functions
```

## Core Features
1. Random Restaurant Selection
   - Location-based search
   - Dietary restriction filtering
   - Price range filtering
   - Weighted randomization algorithm

2. Group Management
   - Create and join groups
   - Member invitations
   - Group history tracking
   - Role-based permissions

3. User Preferences
   - Dietary restrictions
   - Favorite cuisines
   - Price range preferences
   - Search radius settings

## Data Models
Key data models are defined in `packages/core/src/models/index.ts`:
- User (preferences, groups)
- Group (members, history)
- Restaurant (details, hours)
- Invitation (group invites)

## Firebase Structure
Collections:
- users/{userId}
  - groups/{groupId}
- groups/{groupId}
  - members/{memberId}
  - history/{historyId}
- restaurants/{restaurantId}
- invitations/{invitationId}

## UI Components
Shared components in `packages/ui/src/components/`:
- Button
- Card
- Input
- Text
- RestaurantCard
- SpinWheel

## Mobile Screens
Implemented in `apps/mobile/src/screens/`:
- HomeScreen (restaurant selection)
- GroupsScreen (group management)
- CreateGroupScreen
- GroupDetailsScreen
- ProfileScreen
- RestaurantDetailsScreen

## Web Pages (In Progress)
Planned in `apps/web/src/pages/`:
- Authentication pages
- Dashboard
- Group management
- Restaurant details
- Profile settings

## Important Implementation Details
1. Restaurant Selection Algorithm
   - Located in `packages/core/src/services/restaurantSelection.ts`
   - Uses weighted scoring based on multiple factors
   - Considers group history for variety

2. Authentication Flow
   - Firebase Authentication with email and Google
   - Custom hooks in `packages/core/src/hooks/useAuth.ts`
   - Protected routes and middleware

3. Group Management
   - Role-based access control
   - Real-time updates with Firestore
   - Batch operations for consistency

## Development Guidelines
1. Styling
   - Mobile: React Native StyleSheet
   - Web: Tailwind CSS
   - Shared components handle platform differences

2. Type Safety
   - Strict TypeScript configuration
   - Zod for runtime validation
   - Shared type definitions

3. Error Handling
   - Consistent error boundaries
   - User-friendly error messages
   - Proper error logging

4. Testing
   - Jest for unit tests
   - React Native Testing Library
   - Integration tests with Firebase emulator

## Next Implementation Steps
1. Web App Components
   - Layout structure
   - Authentication pages
   - Dashboard interface
   - Group management
   - Restaurant details

2. Firebase Functions
   - Notification system
   - Group invitations
   - Restaurant data updates

3. Mobile Features
   - Push notifications
   - Offline support
   - Location tracking
   - Share functionality

## Notes for Claude
- When implementing new features, check existing patterns in similar components
- Use shared UI components from `packages/ui` when possible
- Maintain consistent error handling and loading states
- Follow existing type definitions and extend as needed
- Remember platform-specific considerations (web vs mobile)
- Keep Firebase security rules in mind when accessing data
- Implement proper data validation using Zod schemas
- Use existing hooks and utilities from packages/core

## Current Working Branch
main