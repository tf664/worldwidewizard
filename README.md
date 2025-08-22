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

- **Responsive design** that works on desktop and mobile devices
- **Interactive gameplay** with drag-and-drop card playing
- **Real-time scoring** and round management
- **Automated game flow** with bidding, playing, and scoring phases

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

# Development regarding card ressources
```bash
node scripts/optimize-images.js 
```


### Project Structure

```
worldwidewizard/
├── e2e/
│   └── demo.test.ts                # Not yet used: End-to-end tests (Playwright)
├── scripts/
│   └── optimize-images.js          # Image optimization script (Sharp)
├── socket-server/
│   ├── index.js                    # WebSocket server
│   └── package.json                # Server dependencies
├── src/
│   ├── app.css                     # Global styles
│   ├── app.d.ts                    # TypeScript declarations
│   ├── app.html                    # HTML template
│   ├── lib/
│   │   ├── index.ts                # Library entry point
│   │   ├── components/
│   │   │   ├── CardImage.svelte        # Card image component
│   │   │   ├── GameImagePreloader.svelte # Preloads card images
│   │   │   └── Popup.svelte            # Popup/modal component
│   │   ├── stores/
│   │   │   ├── lobby.ts                # Lobby state
│   │   │   ├── socket.ts               # Socket state
│   │   │   └── user.ts                 # User state
│   │   └── utils/
│   │       └── cardImagePreloader.ts   # Card image preloading logic
│   ├── routes/
│   │   ├── +layout.svelte              # Root layout
│   │   ├── +page.svelte                # Home page
│   │   ├── Menu.svelte                 # Main menu
│   │   ├── about/
│   │   │   ├── +layout.svelte
│   │   │   └── +page.svelte
│   │   ├── cards/
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   ├── CardImage.svelte
│   │   │   └── specificCard/
│   │   ├── game/
│   │   │   ├── +page.svelte
│   │   │   ├── components/
│   │   │   ├── logic/
│   │   │   └── types/
│   │   ├── howtoplay/
│   │   │   ├── +layout.svelte
│   │   │   └── +page.svelte
│   │   ├── lobby/
│   │   │   └── [code]/
│   │   ├── onlinegame/
│   │   │   ├── [code]/
│   │   │   └── components/
│   │   ├── onlinesetup/
│   │   │   └── +page.svelte
│   │   └── setup/
│   │       └── +page.svelte
├── static/
│   ├── favicon.svg                  # App favicon
│   ├── faviconSvelte.svg            # Svelte favicon
│   └── rcs/
│       ├── cards/                   # Original card images (JPG/PNG)
│       └── cards-optimized/         # Optimized card images (WebP)
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Project dependencies and scripts
├── playwright.config.ts             # Playwright test config
├── README.md                        # Project documentation
├── svelte.config.js                 # Svelte config
├── tsconfig.json                    # TypeScript config
└── vite.config.ts                   # Vite config
```

## Deployment

Vercel


## Card Assets

AMIGO 


## Acknowledgments

@TebbeTom
AMIGO

## Roadmap

- [ ] **Online multiplayer** support with WebSockets
- [ ] **AI opponents** for single-player mode  
- [ ] **Tournament mode** with multiple games
- [ ] **Statistics tracking** and player profiles
- [ ] **Mobile app** versions (iOS/Android)
- [ ] **Additional card themes** and customizations
- [ ] **Spectator mode** for watching games
