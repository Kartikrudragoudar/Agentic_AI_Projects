# Stock & Crypto Morning Brief - Frontend

A premium 3D React frontend for the Stock & Crypto Morning Brief system.

## Features

- **3D Interactive Hero Section** - Particle field background with 3D candlestick charts
- **Custom Cursor** - Premium cursor with ring effect and interactive scaling
- **Smooth Scrolling** - Lenis-powered inertia scrolling for fluid navigation
- **Watchlist Cards** - Real-time ticker cards with price animations
- **Sentiment Analysis** - AI-powered bullish/bearish badges with confidence scores
- **Alerts Dashboard** - Live alerts with sliding animations
- **Morning Brief Section** - Horizontal scroll experience showing market indices and top picks
- **How It Works** - 3D Docker container visualization
- **Responsive Design** - Fully mobile-responsive with Tailwind CSS
- **Dark Theme** - Emerald on void black color palette

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Three.js + @react-three/fiber** - 3D graphics
- **GSAP** - Animations
- **Lenis** - Smooth scrolling
- **Axios** - API calls
- **Lucide React** - Icons

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Runs the app on http://localhost:3000

## Build

```bash
npm run build
```

Generates optimized production build in `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Color Palette

- **Void Black**: #0A0A0A (Background)
- **Surface Black**: #141414 (Cards, panels)
- **Emerald Green**: #10B981 (Accents, CTAs)
- **Silver**: #C0C0C0 (Text)
- **Charcoal**: #1E1E1E (Borders)
- **Red**: #EF4444 (Down prices, alerts)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CustomCursor.jsx
│   │   ├── HeroSection.jsx
│   │   ├── WatchlistSection.jsx
│   │   ├── TickerCard.jsx
│   │   ├── Badges.jsx
│   │   ├── AlertsSection.jsx
│   │   ├── MorningBriefSection.jsx
│   │   └── HowItWorksSection.jsx
│   ├── three/
│   │   ├── ParticleField.jsx
│   │   ├── CandlestickScene.jsx
│   │   └── FloatingCoins.jsx
│   ├── hooks/
│   │   └── useCustomHooks.js
│   ├── api/
│   │   └── marketAPI.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## API Integration

The frontend is designed to work with the FastAPI backend. Configure the API base URL:

```javascript
// src/api/marketAPI.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
```

### Available Endpoints

- `GET /api/brief/today` - Get today's morning brief
- `GET /api/watchlist/scores` - Get ticker scores
- `GET /api/watchlist/sentiment` - Get sentiment analysis
- `GET /api/watchlist/prices` - Get live prices
- `GET /api/alerts` - Get active alerts
- `GET /api/health` - Health check

## Animations

- **Page Load**: Text reveal with word stagger
- **Scroll**: Cards fade in and translate up
- **Hover**: Card borders glow, slight scale increase
- **Price Counter**: GSAP counter animation on scroll
- **Custom Cursor**: Ring scaling and color transitions
- **Lenis**: Smooth inertia scrolling with custom easing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading for 3D components
- Optimized particle count for smooth 60fps
- CSS containment for animations
- Tree-shaking and code splitting with Vite

## License

MIT

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── SpatialCard/         # Base glassmorphism card component
│   │   ├── ActionButton/        # 3D interactive buttons
│   │   ├── MarketTicker/        # Real-time market ticker display
│   │   ├── GlassInput/          # Minimalist input fields
│   │   ├── Chip/               # Interactive filter chips
│   │   └── PerspectiveChart/    # 3D ribbon chart visualization
│   ├── pages/                   # Full-page components
│   │   ├── Home.jsx             # Landing/hero page
│   │   └── Dashboard.jsx        # Trading dashboard
│   ├── design-system/           # Design tokens and global styles
│   │   ├── colors.css           # Color variables
│   │   ├── typography.css       # Font definitions
│   │   ├── spacing.css          # Layout utilities
│   │   └── index.css            # Global styles
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App layout styles
│   └── main.jsx                 # React entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js              # Build configuration
└── README.md                    # Documentation
```

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens http://localhost:3000 in your browser with hot reload enabled.

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

## 🎯 Core Components

### SpatialCard
Glassmorphic card with 3D tilt effects on hover
```jsx
<SpatialCard interactive>
  Content here
</SpatialCard>
```

### ActionButton
3D pressed button with ripple effect
```jsx
<ActionButton variant="primary" size="lg">
  Click Me
</ActionButton>
```

### MarketTicker
Real-time market data display with profit/loss color coding
```jsx
<MarketTicker 
  symbol="AAPL"
  price={185.42}
  change={2.5}
  changePercent={1.37}
  isProfit={true}
/>
```

### GlassInput
Minimalist input with bottom border glow on focus
```jsx
<GlassInput 
  placeholder="Search..."
  label="Quick Search"
  value={searchValue}
  onChange={handleChange}
/>
```

### Chip
Interactive filter chips with selection states
```jsx
<Chip 
  label="Stocks"
  variant="primary"
  selected={isSelected}
  onClick={handleSelect}
/>
```

### PerspectiveChart
Canvas-based chart with gradient ribbon effect
```jsx
<PerspectiveChart 
  data={[100, 120, 115, 140, ...]}
  height={300}
  isProfit={true}
/>
```

## 🎨 Design Tokens

### Colors
- **Primary**: #bcc2ff (Purple)
- **Groww Purple**: #5367ff
- **Profit Green**: #00b386
- **Loss Red**: #ef5350
- **Background**: #10131d

### Typography
- **Headlines**: Space Grotesk (Bold)
- **Body**: Be Vietnam Pro (Regular)
- **Data**: JetBrains Mono (for tickers)

### Spacing
- Base Unit: 8px
- Gutter: 24px
- Edge Margin: 32px

## 📱 Responsive Design

All components are fully responsive with breakpoints at:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## ✨ Features

- ✅ 3D Spatial Glassmorphism UI
- ✅ Real-time Market Data Display
- ✅ Interactive Charts with Canvas API
- ✅ Dark Mode Optimized
- ✅ Fully Responsive
- ✅ Performance Optimized
- ✅ Accessibility Compliant
- ✅ Component Library Ready

## 🛠️ Technologies

- **React 18**: UI framework
- **Vite**: Build tool & dev server
- **CSS3**: Glassmorphism, 3D transforms, gradients
- **Canvas API**: Chart visualization
- **JavaScript (ES6+)**: Modern syntax

## 📊 Pages

### Home
- Hero section with CTAs
- Search functionality
- Category filters
- Top gainers display
- Market performance chart
- Feature highlights
- Call-to-action section

### Dashboard
- Portfolio value metrics
- Multi-chart visualization
- Time range selector
- Watchlist management
- Market statistics
- Trading performance stats

## 🎭 Design Philosophy

The design system merges **Spatial FinTech** aesthetics with:
- High-trust reliability of modern brokerages
- Cutting-edge 3D immersive interfaces
- Visionary, precise, and energetic brand personality
- Physical depth using Z-axis translations
- Frosted glass textures with purple ambient glows
- Interactive depth states responding to user movement

## 📝 License

MIT

## 👤 Author

Created for MarketPulse 3D Project

---

Built with ❤️ using React & Vite
