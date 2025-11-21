# 📸 PixSweep

A modern, browser-based photo management tool that helps you quickly review and clean up large photo collections. Built with React and TypeScript, PixSweep runs entirely in your browser with no server required.

## ✨ Features

### 🚀 Core Features

- **Fast Photo Review**: Swipe through photos with keyboard shortcuts
- **Smart Duplicate Detection**: Automatically detects similar/duplicate photos using perceptual hashing (dHash algorithm)
- **HEIC Support**: Automatically converts HEIC images to viewable format
- **File System Access**: Direct file manipulation using modern browser APIs (Chrome, Edge, Opera)
- **Safari Fallback**: Works in Safari with limited file system access
- **Progress Tracking**: See your review progress in real-time
- **Batch Operations**: Keep, trash, or skip multiple photos quickly

### 🎯 User Experience

- **Keyboard-First**: Designed for rapid keyboard-driven workflow
- **Visual Feedback**: Color-coded decisions and smooth animations
- **Duplicate Warnings**: Visual indicators for potentially duplicate photos
- **Review Summary**: Comprehensive overview before finalizing deletions
- **Undo Support**: Navigate backwards to review previous decisions

### 🛠️ Technical Highlights

- **Client-Side Processing**: All operations run in your browser - your photos never leave your device
- **TypeScript**: Fully typed for reliability and maintainability
- **Clean Architecture**: Separation of concerns with services, hooks, and components
- **State Management**: Zustand for lightweight, efficient state management
- **Modern React**: Uses React 19 with hooks and functional components

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern browser (Chrome, Edge, Opera recommended; Safari supported with limitations)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pixsweep.git
cd pixsweep

# Install dependencies
npm install

# Start development server
npm run dev:client
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
# Build the client
npm run build:client

# Preview production build
npm --prefix client run preview
```

## 🎮 Usage

### Getting Started

1. Click "Select Folder" to choose a folder containing photos
2. Wait for duplicate detection (automatic)
3. Review each photo using keyboard shortcuts
4. Finalize and delete unwanted photos

### Keyboard Shortcuts

| Key               | Action                                    |
| ----------------- | ----------------------------------------- |
| `→` (Right Arrow) | Keep photo and move to next               |
| `←` (Left Arrow)  | Mark for deletion and move to next        |
| `Space`           | Skip photo (no decision) and move to next |
| `⌫` (Backspace)   | Go back to previous photo                 |

### Duplicate Detection

- Runs automatically when you select a folder
- Uses dHash (Difference Hash) perceptual hashing algorithm
- Detects photos with 90% or higher similarity
- Groups duplicate photos together for easier review
- Shows visual warning badges on duplicate photos

### Finalizing Deletions

1. After reviewing all photos, you'll see a summary page
2. Review your decisions in different tabs (Keep, Trash, All)
3. Click "Delete" to permanently remove marked photos
4. **Safari users**: Download the file list and use terminal commands for deletion

## 🏗️ Project Structure

```
PixSweep/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CircularProgress.tsx
│   │   │   ├── DecisionBadge/
│   │   │   ├── PhotoGrid/
│   │   │   ├── PhotoViewer/
│   │   │   └── KeyboardInstructions/
│   │   ├── constants/          # Application constants
│   │   │   └── index.ts        # Colors, animations, configs
│   │   ├── features/           # Feature-specific components
│   │   │   └── review/         # Photo review feature
│   │   │       ├── ReviewPage.tsx
│   │   │       ├── FinalizeDeletePage.tsx
│   │   │       ├── Welcome.tsx
│   │   │       ├── finalizeDelete.ts
│   │   │       └── deleteScripts.ts
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useKeyboardControls.ts
│   │   │   ├── usePhotoReview.ts
│   │   │   └── useImageSimilarity.ts
│   │   ├── services/           # Business logic services
│   │   │   ├── fs/             # File system operations
│   │   │   │   ├── FSAProvider.ts
│   │   │   │   ├── DirectoryInputProvider.ts
│   │   │   │   ├── convertHeic.ts
│   │   │   │   └── fileSystemService.ts
│   │   │   ├── imageSimilarity/  # Duplicate detection
│   │   │   │   ├── perceptualHash.ts
│   │   │   │   ├── duplicateDetection.ts
│   │   │   │   ├── similarityService.ts
│   │   │   │   └── README.md
│   │   │   └── review/         # Review logic
│   │   │       ├── navigationService.ts
│   │   │       └── reviewService.ts
│   │   ├── state/              # Global state management
│   │   │   └── usePhotosStore.ts
│   │   ├── styles/             # Shared styles
│   │   │   └── commonStyles.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── photo.ts
│   │   │   ├── decision.ts
│   │   │   ├── animation.ts
│   │   │   └── fileSystem.ts
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
├── package.json                # Workspace root
└── README.md                   # This file
```

## 🔧 Architecture & Design Principles

### Clean Architecture

- **Separation of Concerns**: Services, hooks, components, and state are clearly separated
- **Loose Coupling**: Components depend on interfaces, not implementations
- **High Cohesion**: Related functionality is grouped together

### Design Patterns Used

- **Service Layer Pattern**: Business logic isolated in services
- **Custom Hooks Pattern**: Reusable stateful logic
- **Observer Pattern**: Zustand for reactive state management
- **Strategy Pattern**: Different file system providers (FSA vs DirectoryInput)
- **Factory Pattern**: Photo and decision object creation

### Code Quality

- **TypeScript**: Full type safety across the codebase
- **Constants**: Centralized configuration and magic numbers
- **Documentation**: JSDoc comments for services and hooks
- **DRY Principle**: Shared styles and utility functions
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion

## 🧪 Technical Details

### Duplicate Detection Algorithm

PixSweep uses **dHash (Difference Hash)**, a perceptual hashing algorithm:

1. Resize image to 9×8 pixels
2. Convert to grayscale
3. Compare each pixel with its right neighbor
4. Generate a 72-bit hash
5. Calculate Hamming distance between hashes
6. Photos with distance ≤ 7 bits (90% similarity) are considered duplicates

**Advantages**:

- Fast computation (~50-200ms per photo)
- No external dependencies or ML models
- Works entirely client-side
- Robust to minor edits and compression

### File System Access

- **Primary Method**: File System Access API (Chrome, Edge, Opera)
  - Direct read/write access to local files
  - Can permanently delete files
- **Fallback Method**: DirectoryInput (Safari, Firefox)
  - Read-only access via file input
  - Cannot delete files (provides scripts instead)

### State Management

Uses Zustand for minimal, performant state management:

- Single store for photos, decisions, and navigation
- Selector-based subscriptions for efficient re-renders
- Computed values cached with React useMemo

### Performance Optimizations

- Lazy loading of photo previews
- URL revoking to prevent memory leaks
- Memoized computations for stats and derived state
- Virtual scrolling for large photo grids (PhotoGrid component)

## 🌐 Browser Compatibility

| Browser    | File System Access       | HEIC Conversion | Duplicate Detection |
| ---------- | ------------------------ | --------------- | ------------------- |
| Chrome 86+ | ✅ Full Support          | ✅              | ✅                  |
| Edge 86+   | ✅ Full Support          | ✅              | ✅                  |
| Opera 72+  | ✅ Full Support          | ✅              | ✅                  |
| Safari 14+ | ⚠️ Limited (no deletion) | ✅              | ✅                  |
| Firefox    | ⚠️ Limited (no deletion) | ✅              | ✅                  |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow code style**: Use TypeScript, add JSDoc comments
4. **Write clean code**: Follow SOLID principles and project patterns
5. **Test your changes**: Ensure no regressions
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript with strict mode
- Follow existing patterns (services, hooks, components)
- Add JSDoc comments for public APIs
- Use constants instead of magic numbers
- Extract reusable logic into hooks or services
- Keep components small and focused (<200 lines)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **heic2any**: HEIC to JPEG conversion library
- **zustand**: Lightweight state management
- **React**: UI framework
- **Vite**: Build tool and dev server

## 📧 Contact

Emirhan Çakır - [@emirhancakir](https://github.com/emirhancakir)

Project Link: [https://github.com/emirhancakir/pixsweep](https://github.com/emirhancakir/pixsweep)

---

**Made with ❤️ for photographers who have too many photos**
