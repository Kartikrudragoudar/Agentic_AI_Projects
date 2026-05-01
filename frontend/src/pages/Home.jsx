import React, { useState } from 'react';
import {
  SpatialCard,
  ActionButton,
  MarketTicker,
  GlassInput,
  Chip,
  PerspectiveChart,
} from '../components';
import './Home.css';

const Home = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ['Stocks', 'Crypto', 'Forex', 'Commodities', 'ETFs'];
  const mockTickers = [
    { symbol: 'AAPL', price: 185.42, change: 2.5, changePercent: 1.37, isProfit: true },
    { symbol: 'GOOGL', price: 140.58, change: -1.2, changePercent: -0.85, isProfit: false },
    { symbol: 'MSFT', price: 378.91, change: 5.3, changePercent: 1.42, isProfit: true },
  ];

  const chartData = [100, 120, 115, 140, 135, 160, 155, 180, 175, 200];

  return (
    <div className="home perspective">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="container">
          <h1 className="h1">MarketPulse 3D</h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--spacing-lg)' }}>
            Experience the future of market data with spatial depth and immersive design
          </p>
          <div className="home__hero-buttons" style={{ marginTop: 'var(--spacing-2xl)' }}>
            <ActionButton variant="primary" size="lg">Get Started</ActionButton>
            <ActionButton variant="secondary" size="lg">Learn More</ActionButton>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="home__search container" style={{ marginTop: 'var(--spacing-3xl)' }}>
        <GlassInput
          placeholder="Search stocks, crypto, commodities..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          label="Quick Search"
        />
      </section>

      {/* Categories */}
      <section className="home__categories container" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-lg)' }}>Explore Categories</h2>
        <div className="home__chips-grid">
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              variant="primary"
              selected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
      </section>

      {/* Market Tickers */}
      <section className="home__tickers container" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-lg)' }}>Top Gainers</h2>
        <div className="home__tickers-grid">
          {mockTickers.map((ticker) => (
            <SpatialCard key={ticker.symbol} interactive>
              <MarketTicker
                symbol={ticker.symbol}
                price={ticker.price}
                change={ticker.change}
                changePercent={ticker.changePercent}
                isProfit={ticker.isProfit}
              />
            </SpatialCard>
          ))}
        </div>
      </section>

      {/* Chart Section */}
      <section className="home__chart container" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-lg)' }}>Performance Chart</h2>
        <SpatialCard className="home__chart-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <h3 className="h3" style={{ marginBottom: 'var(--spacing-md)' }}>Market Trend</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Last 10 trading days
              </p>
            </div>
            <PerspectiveChart data={chartData} height={300} isProfit={true} />
          </div>
        </SpatialCard>
      </section>

      {/* Features Section */}
      <section className="home__features container" style={{ marginTop: 'var(--spacing-3xl)' }}>
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-2xl)' }}>Why MarketPulse?</h2>
        <div className="home__features-grid">
          {[
            { title: 'Spatial Design', desc: 'Immersive 3D UI with glassmorphism effects' },
            { title: 'Real-time Data', desc: 'Live market updates with precision accuracy' },
            { title: 'Dark Mode', desc: 'Eye-friendly interface optimized for traders' },
            { title: 'Performance', desc: 'Lightning-fast data visualization and interaction' },
          ].map((feature) => (
            <SpatialCard key={feature.title}>
              <h3 className="h3">{feature.title}</h3>
              <p className="body-md" style={{ marginTop: 'var(--spacing-md)', color: 'var(--on-surface-variant)' }}>
                {feature.desc}
              </p>
            </SpatialCard>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="home__cta container" style={{ marginTop: 'var(--spacing-3xl)', marginBottom: 'var(--spacing-3xl)' }}>
        <SpatialCard className="home__cta-card">
          <div style={{ textAlign: 'center' }}>
            <h2 className="h2">Ready to Transform Your Trading?</h2>
            <p className="body-lg" style={{ marginTop: 'var(--spacing-lg)', color: 'var(--on-surface-variant)' }}>
              Join thousands of traders using MarketPulse
            </p>
            <ActionButton variant="primary" size="lg" style={{ marginTop: 'var(--spacing-xl)' }}>
              Start Trading Now
            </ActionButton>
          </div>
        </SpatialCard>
      </section>
    </div>
  );
};

export default Home;
