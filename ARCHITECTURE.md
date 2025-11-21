# PixSweep Architecture

## Overview

PixSweep follows clean architecture principles with clear separation of concerns, loose coupling, and high cohesion. The application is built with React and TypeScript, leveraging modern web APIs for file system access and image processing.

## Architecture Principles

### 1. **Separation of Concerns**

- **Components**: UI rendering and user interactions
- **Hooks**: Reusable stateful logic
- **Services**: Business logic and external API interactions
- **State**: Global state management
- **Types**: TypeScript definitions

### 2. **Loose Coupling**

- Components depend on interfaces, not implementations
- Services are independent and can be tested in isolation
- File system providers are interchangeable (FSA vs DirectoryInput)
- Navigation logic separated from UI

### 3. **High Cohesion**

- Related functionality grouped together (e.g., imageSimilarity service)
- Each module has a single, well-defined responsibility
- Constants and configurations centralized

### 4. **SOLID Principles**

#### Single Responsibility

- Each service handles one concern:
  - `NavigationService`: Photo navigation logic
  - `ReviewService`: Review statistics
  - `SimilarityService`: Duplicate detection
  - `FileSystemService`: File operations

#### Open/Closed

- Services are open for extension, closed for modification
- Strategy pattern for file system providers
- Configurable duplicate detection parameters

#### Liskov Substitution

- File system providers (FSA, DirectoryInput) are interchangeable
- Components work with any valid Photo type

#### Interface Segregation

- Small, focused interfaces (e.g., `UseKeyboardControlsOptions`)
- Components only depend on what they need

#### Dependency Inversion

- Components depend on abstractions (types), not concrete implementations
- Services injected through hooks

## Folder Structure

```
client/src/
├── components/         # Presentational components
│   ├── CircularProgress.tsx
│   ├── DecisionBadge/
│   ├── PhotoGrid/
│   ├── PhotoViewer/
│   └── KeyboardInstructions/
│
├── constants/          # Application constants
│   └── index.ts        # Colors, animations, configurations
│
├── features/           # Feature modules
│   └── review/         # Photo review feature
│       ├── ReviewPage.tsx
│       ├── FinalizeDeletePage.tsx
│       ├── Welcome.tsx
│       ├── finalizeDelete.ts
│       └── deleteScripts.ts
│
├── hooks/              # Custom React hooks
│   ├── useKeyboardControls.ts
│   ├── usePhotoReview.ts
│   └── useImageSimilarity.ts
│
├── services/           # Business logic
│   ├── fs/             # File system operations
│   │   ├── FSAProvider.ts
│   │   ├── DirectoryInputProvider.ts
│   │   ├── convertHeic.ts
│   │   └── fileSystemService.ts
│   ├── imageSimilarity/
│   │   ├── perceptualHash.ts
│   │   ├── duplicateDetection.ts
│   │   └── similarityService.ts
│   └── review/
│       ├── navigationService.ts
│       └── reviewService.ts
│
├── state/              # Global state
│   └── usePhotosStore.ts
│
├── styles/             # Shared styles
│   └── commonStyles.ts
│
├── types/              # TypeScript types
│   ├── photo.ts
│   ├── decision.ts
│   ├── animation.ts
│   └── fileSystem.ts
│
└── utils/              # Utility functions
    └── errorHandler.ts
```

## Data Flow

```
┌─────────────┐
│   User      │
│  Actions    │
└─────┬───────┘
      │
      v
┌─────────────┐
│ Components  │ ◄──────┐
│   & Hooks   │        │
└─────┬───────┘        │
      │                │
      v                │
┌─────────────┐        │
│   Store     │        │
│  (Zustand)  │        │
└─────┬───────┘        │
      │                │
      v                │
┌─────────────┐        │
│  Services   │        │
│ (Business   │        │
│   Logic)    │        │
└─────┬───────┘        │
      │                │
      v                │
┌─────────────┐        │
│  External   │        │
│    APIs     │────────┘
│ (File System,
│  Canvas API)│
└─────────────┘
```

## State Management

### Zustand Store (`usePhotosStore`)

- Single source of truth for application state
- Selector-based subscriptions
- Minimal re-renders through granular selectors
- Computed values cached with React `useMemo`

### State Structure

```typescript
{
  fs?: FsContext;                      // File system context
  photos: Photo[];                      // All loaded photos
  index: number;                        // Current photo index
  decisions: Decisions;                 // User decisions
  tourCompleted: boolean;               // First tour complete?
  readyToFinalize: boolean;             // Ready to delete?
  duplicateMap: Record<string, string[]>; // Duplicate relationships
}
```

## Key Services

### 1. **NavigationService**

- **Responsibility**: Calculate next/previous photo indices
- **Strategy**: Two-phase review (sequential → jump to undecided)
- **Stateless**: Operates on provided state, no side effects

### 2. **SimilarityService**

- **Responsibility**: Detect similar/duplicate photos
- **Algorithm**: dHash (Difference Hash) perceptual hashing
- **Performance**: ~50-200ms per photo, client-side only

### 3. **FileSystemService**

- **Responsibility**: Abstract file system operations
- **Providers**: FSA (full access) or DirectoryInput (read-only)
- **Strategy Pattern**: Interchangeable implementations

### 4. **ReviewService**

- **Responsibility**: Calculate review statistics
- **Pure Functions**: No side effects, easily testable

## Component Patterns

### 1. **Smart vs Presentational Components**

- **Smart**: Connect to store, handle logic (`ReviewPage`)
- **Presentational**: Display data, emit events (`PhotoViewer`, `CircularProgress`)

### 2. **Custom Hooks**

- Encapsulate reusable stateful logic
- Examples: `usePhotoReview`, `useKeyboardControls`, `useImageSimilarity`

### 3. **Composition**

- Small, focused components
- Compose complex UIs from simple parts
- Example: `PhotoGrid` composed of `PhotoGridItem`

## Performance Optimizations

### 1. **Memoization**

- `useMemo` for expensive computations
- Derived state calculated once per dependency change

### 2. **Lazy Loading**

- Photos loaded on-demand
- Preview URLs generated as needed

### 3. **Memory Management**

- URL revoking after component unmount
- Cleanup functions in `useEffect`

### 4. **Virtual Scrolling**

- PhotoGrid renders visible items only
- Efficient for large collections

## Error Handling

### Centralized Error Handler

```typescript
// utils/errorHandler.ts
- AppError class with type information
- User-friendly error messages
- Consistent error logging
- Error wrapping for async functions
```

### Error Types

- `FILE_SYSTEM_ACCESS`: Permission denied, API unavailable
- `IMAGE_LOADING`: Failed to load image
- `DUPLICATE_DETECTION`: Hash computation failed
- `DELETION_FAILED`: Could not delete file
- `HEIC_CONVERSION`: Conversion error
- `UNKNOWN`: Unexpected errors

## Testing Strategy

### Unit Tests

- Services (pure functions, easy to test)
- Utility functions
- Navigation logic

### Integration Tests

- Custom hooks
- Store actions and selectors

### E2E Tests

- Complete user flows
- Keyboard navigation
- File operations (mocked)

## Browser Compatibility

### File System Access API

- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ⚠️ Safari (fallback mode)
- ⚠️ Firefox (fallback mode)

### Canvas API (for hashing)

- ✅ All modern browsers
- Used for image processing and duplicate detection

## Security Considerations

### 1. **Privacy**

- All processing happens client-side
- Photos never uploaded to server
- No external analytics or tracking

### 2. **File Access**

- Explicit user permission required
- Limited to selected folder
- File System Access API permissions

### 3. **Data Sanitization**

- File paths validated
- Image formats checked
- Error messages sanitized

## Future Improvements

### Potential Enhancements

1. **Cloud Integration**: Optional cloud backup/sync
2. **Advanced Filters**: Date, size, resolution filters
3. **Batch Edit**: Apply edits to kept photos
4. **Export Options**: Export decisions as JSON
5. **Undo/Redo Stack**: Multi-level undo
6. **Keyboard Customization**: User-defined shortcuts
7. **Themes**: Light/dark mode support
8. **i18n**: Multi-language support

### Architecture Evolution

1. **Micro-frontends**: Split into modules
2. **Web Workers**: Offload hash computation
3. **IndexedDB**: Cache decisions locally
4. **Service Worker**: Offline support
5. **WebAssembly**: Faster image processing

## Conclusion

PixSweep's architecture prioritizes:

- **Maintainability**: Clear structure, consistent patterns
- **Testability**: Pure functions, dependency injection
- **Scalability**: Modular design, loose coupling
- **Performance**: Optimized rendering, lazy loading
- **User Experience**: Fast, responsive, intuitive

The architecture follows industry best practices and SOLID principles, making it easy to understand, extend, and maintain.
