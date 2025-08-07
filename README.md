# World Wide Wizard

**World Wide Wizard** is a digital implementation of the classic card game "Wizard" by Amigo. This web-based version allows players to enjoy the game online without needing physical cards or being in the same location.

## About the Game

Wizard is a trick-taking card game where players must predict exactly how many tricks they will win each round. The game features:

- **60 unique cards**: 4 suits (Red, Blue, Green, Yellow) with 13 cards each, plus 4 Wizard cards and 4 Fool cards
- **Strategic bidding**: Players must predict their tricks before each round begins  
- **Variable rounds**: The number of cards dealt increases each round
- **Scoring system**: Exact predictions earn bonus points, while wrong predictions cost points
- **Multiple players**: Supports 3-6 players (currently configured for 3+ players)

---

## Current Features

- **Beautiful card graphics** with custom artwork for all 60 cards
- **Responsive design** that works on desktop and mobile devices
- **Interactive gameplay** with drag-and-drop card playing
- **Real-time scoring** and round management
- **Game state persistence** using localStorage
- **Automated game flow** with bidding, playing, and scoring phases
- **Winner celebration** with final leaderboard

## How to Play

1. **Setup**: Enter player names on the setup screen
2. **Bidding Phase**: Each player predicts how many tricks they will win
3. **Playing Phase**: Players take turns playing cards, with the highest card winning the trick

4. **Bedienen is missing**

5. **Scoring**: Points are awarded based on prediction accuracy
   - **Correct prediction**: 20 + number of tricks won
   - **Wrong prediction**: -10 points per trick difference
6. **Next Round**: The number of cards increases, and the process repeats

### Card Hierarchy
- **Wizard cards**: Always win tricks (highest)
- **Fool cards**: Always lose tricks (lowest)  
- **Numbered cards**: 1-13 in each suit, with 13 being highest
- **Trump suit**: Changes each round, trump cards beat non-trump cards

---

## Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tf664/worldwidewizard.git
   cd worldwidewizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or open automatically in browser
   npm run dev -- --open
   ```

4. **Open your browser** and navigate to your localhost


## Development

### Tech Stack

**Framework & Build Tools:**
- [Svelte 5](https://svelte.dev/) - Modern reactive framework
- [SvelteKit](https://kit.svelte.dev/) - Full-stack Svelte framework  
- [Vite](https://vitejs.dev/) - Fast build tool and dev server
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

**Styling:**
- [Tailwind CSS 4.0](https://tailwindcss.com/) - Utility-first CSS framework
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) - Beautiful typography defaults
- Custom card graphics and game table design

**Code Quality:**
- [ESLint](https://eslint.org/) - JavaScript/TypeScript linting
- [Prettier](https://prettier.io/) - Code formatting
- [eslint-plugin-svelte](https://svelte.dev/docs/eslint) - Svelte-specific linting

**Testing:**
- [Playwright](https://playwright.dev/) - End-to-end testing

**Image Processing:**
- [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev -- --open  # Start dev server and open browser

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality  
npm run format       # Format code with Prettier
npm run lint         # Lint code with ESLint
npm run check        # Type-check with Svelte compiler
npm run check:watch  # Type-check in watch mode

# Testing
npm run test         # Run end-to-end tests
npm run test:e2e     # Run Playwright tests
```

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── CardImage.svelte    # Reusable card component
│   └── stores/
│       └── user.ts             # User state management
├── routes/
│   ├── +layout.svelte          # Root layout
│   ├── +page.svelte            # Home page
│   ├── about/                  # About page
│   ├── cards/                  # Card gallery
│   ├── game/                   # Main game logic and UI
│   │   ├── components/         # Game-specific components
│   │   ├── logic/              # Game state management
│   │   └── types/              # TypeScript definitions
│   ├── howtoplay/              # Game rules and instructions
│   ├── profile/                # Player profiles
│   └── setup/                  # Game setup
static/
├── rcs/
│   ├── cards/                  # Original card images (JPG)
│   └── cards-optimized/        # Optimized card images (WebP)
└── favicon.svg
```

## 🎨 Card Assets

The game includes 60 beautifully designed cards:
- **4 suits**: Red, Blue, Green, Yellow (13 cards each: 1-13)
- **Special cards**: 4 Wizard cards, 4 Fool cards  
- **Optimized formats**: Both original JPG and optimized WebP versions
- **Responsive images**: Automatically served based on browser support

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built application will be in the `build/` directory and can be deployed to any static hosting service.

### Deployment Options

- **Vercel**: Automatic deployment with SvelteKit adapter
- **Netlify**: Static site hosting with build optimization
- **GitHub Pages**: Free hosting for open source projects
- **Self-hosted**: Deploy to your own server or VPS

> **Note**: You may need to install a [SvelteKit adapter](https://kit.svelte.dev/docs/adapters) specific to your deployment target.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (Prettier/ESLint configs)
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Wizard Card Game**: Originally designed by Ken Fisher
- **Card Artwork**: Custom illustrations created for this digital version
- **Svelte Community**: For the excellent framework and ecosystem
- **Contributors**: Thanks to all who have contributed to this project

## 🐛 Issues & Support

If you encounter any bugs or have feature requests:

1. Check existing [Issues](https://github.com/tf664/worldwidewizard/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce bugs
4. Suggest enhancements with clear use cases

## 📈 Roadmap

- [ ] **Online multiplayer** support with WebSockets
- [ ] **AI opponents** for single-player mode  
- [ ] **Tournament mode** with multiple games
- [ ] **Statistics tracking** and player profiles
- [ ] **Mobile app** versions (iOS/Android)
- [ ] **Additional card themes** and customizations
- [ ] **Spectator mode** for watching games

---

**Enjoy playing World Wide Wizard! 🧙‍♂️✨**
