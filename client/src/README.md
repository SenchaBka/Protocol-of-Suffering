# Client Project Structure

This project follows Atomic Design methodology and modern React/TypeScript best practices.

## 📁 Folder Structure

```
src/
├── components/           # Atomic Design Components
│   ├── atoms/           # Basic building blocks (Button, Input, Icon)
│   ├── molecules/       # Simple combinations (SearchBar, Card, Modal)
│   ├── organisms/       # Complex UI sections (Header, Sidebar, GameBoard)
│   ├── templates/       # Page layouts (GameLayout, AuthLayout)
│   └── pages/           # Full page components (HomePage, GamePage)
│
├── store/               # Global State Management
│   ├── contexts/        # React Context providers
│   ├── slices/          # State slices (Redux Toolkit or Zustand)
│   └── hooks/           # Custom state hooks
│
├── hooks/               # Custom React Hooks
│   ├── useGameState.ts
│   ├── useWebSocket.ts
│   └── useLocalStorage.ts
│
├── utils/               # Utility Functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── types/               # TypeScript Type Definitions
│   ├── api.ts
│   ├── game.ts
│   └── common.ts
│
├── constants/           # Application Constants
│   ├── api.ts
│   ├── game.ts
│   └── ui.ts
│
├── services/            # External Services
│   ├── api/             # API calls
│   └── websocket/       # WebSocket connections
│
├── layouts/             # Layout Components
│   ├── MainLayout.tsx
│   └── GameLayout.tsx
│
├── pages/               # Page Components
│   ├── HomePage.tsx
│   └── GamePage.tsx
│
├── assets/              # Static Assets
│   ├── images/          # Images
│   └── icons/           # Icon files
│
└── styles/              # Styling
    └── variables.css    # CSS Variables & Global Styles
```

## 🎯 Atomic Design Principles

### Atoms

- **Purpose**: Basic building blocks
- **Examples**: Button, Input, Icon, Label
- **Rules**: No dependencies on other components

### Molecules

- **Purpose**: Simple combinations of atoms
- **Examples**: SearchBar, Card, Modal, FormField
- **Rules**: Can use atoms, but not other molecules/organisms

### Organisms

- **Purpose**: Complex UI sections
- **Examples**: Header, Sidebar, GameBoard, PlayerList
- **Rules**: Can use atoms and molecules

### Templates

- **Purpose**: Page layouts without content
- **Examples**: GameLayout, AuthLayout, DashboardLayout
- **Rules**: Define structure, not specific content

### Pages

- **Purpose**: Full page components with content
- **Examples**: HomePage, GamePage, LoginPage
- **Rules**: Use templates and fill with content

## 🔧 Best Practices

1. **Component Organization**: Each component gets its own folder with:

   - `ComponentName.tsx` - Main component
   - `ComponentName.test.tsx` - Tests
   - `ComponentName.stories.tsx` - Storybook stories
   - `index.ts` - Export file

2. **State Management**: Use appropriate tool for the job:

   - Local state: `useState`, `useReducer`
   - Global state: Context API, Zustand, or Redux Toolkit
   - Server state: React Query or SWR

3. **Type Safety**: Always define proper TypeScript types
4. **Reusability**: Create reusable components in atoms/molecules
5. **Performance**: Use React.memo, useMemo, useCallback when needed
6. **Testing**: Write tests for all components and utilities

## 🚀 Getting Started

1. Create components in appropriate atomic level
2. Export from index files for clean imports
3. Use TypeScript for all new files
4. Follow naming conventions (PascalCase for components)
5. Keep components focused and single-purpose
