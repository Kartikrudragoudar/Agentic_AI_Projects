import React, { useState } from 'react';
import {
  SpatialCard,
  ActionButton,
  MarketTicker,
  GlassInput,
  Chip,
  PerspectiveChart,
} from '../components';
import './Dashboard.css';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('1d');
  const [watchlist, setWatchlist] = useState([
    { id: 1, symbol: 'AAPL', price: 185.42, change: 2.5, changePercent: 1.37, isProfit: true },
    { id: 2, symbol: 'GOOGL', price: 140.58, change: -1.2, changePercent: -0.85, isProfit: false },
    { id: 3, symbol: 'MSFT', price: 378.91, change: 5.3, changePercent: 1.42, isProfit: true },
    { id: 4, symbol: 'TSLA', price: 242.84, change: -3.2, changePercent: -1.30, isProfit: false },
  ]);

  const portfolioData = [100, 110, 108, 125, 120, 135, 130, 150, 145, 170];
  const gainersData = [50, 65, 55, 75, 70, 90, 85, 110, 100, 130];
  const losersData = [100, 95, 105, 85, 90, 75, 80, 55, 65, 45];

  const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'All'];

  return (
    <div className="dashboard perspective">
      {/* Header */}
      <div className="dashboard__header container">
        <h1 className="h1">Dashboard</h1>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Welcome back! Here's your market overview
        </p>
      </div>

      {/* Stats Cards */}
      <section className="dashboard__stats container">
        <div className="dashboard__stats-grid">
          {[
            { label: 'Portfolio Value', value: '$125,430.50', change: '+$2,340.50', isProfit: true },
            { label: 'Daily Gain/Loss', value: '+$1,230.75', change: '+0.98%', isProfit: true },
            { label: 'Total Return', value: '25.43%', change: 'All Time', isProfit: true },
            { label: 'Holdings', value: '24', change: '12 Active', isProfit: false },
          ].map((stat, idx) => (
            <SpatialCard key={idx}>
              <h3 className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-md)' }}>
                {stat.label}
              </h3>
              <div className="dashboard__stat-value">{stat.value}</div>
              <div className={`dashboard__stat-change ${stat.isProfit ? 'profit' : 'loss'}`}>
                {stat.change}
              </div>
            </SpatialCard>
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard__charts container">
        <h2 className="h2" style={{ marginBottom: 'var(--spacing-xl)' }}>Market Performance</h2>

        {/* Time Range Selector */}
        <div className="dashboard__time-range" style={{ marginBottom: 'var(--spacing-xl)' }}>
          {timeRanges.map((range) => (
            <Chip
              key={range}
              label={range}
              size="sm"
              variant="primary"
              selected={timeRange === range}
              onClick={() => setTimeRange(range)}
            />
          ))}
        </div>

        <div className="dashboard__charts-grid">
          {/* Portfolio Chart */}
          <SpatialCard>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-lg)' }}>Portfolio Trend</h3>
            <PerspectiveChart data={portfolioData} height={250} isProfit={true} />
          </SpatialCard>

          {/* Gainers Chart */}
          <SpatialCard>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-lg)' }}>Top Gainers</h3>
            <PerspectiveChart data={gainersData} height={250} isProfit={true} />
          </SpatialCard>

          {/* Losers Chart */}
          <SpatialCard>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-lg)' }}>Top Losers</h3>
            <PerspectiveChart data={losersData} height={250} isProfit={false} />
          </SpatialCard>

          {/* Market Stats */}
          <SpatialCard>
            <h3 className="h3" style={{ marginBottom: 'var(--spacing-xl)' }}>Market Stats</h3>
            <div className="dashboard__market-stats">
              {[
                { label: 'Market Cap', value: '$95.2T' },
                { label: '24h Volume', value: '$2.4T' },
                { label: 'Bitcoin Dominance', value: '48.5%' },
                { label: 'Fear & Greed', value: '72 (Greed)' },
              ].map((stat, idx) => (
                <div key={idx} className="dashboard__stat-row">
                  <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                    {stat.label}
                  </span>
                  <span className="body-md" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </SpatialCard>
        </div>
      </section>

      {/* Watchlist */}
      <section className="dashboard__watchlist container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h2 className="h2">My Watchlist</h2>
          <ActionButton variant="secondary" size="md">Add to Watchlist</ActionButton>
        </div>

        <div className="dashboard__watchlist-grid">
          {watchlist.map((item) => (
            <SpatialCard key={item.id} interactive>
              <div className="dashboard__watchlist-item">
                <MarketTicker
                  symbol={item.symbol}
                  price={item.price}
                  change={item.change}
                  changePercent={item.changePercent}
                  isProfit={item.isProfit}
                />
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <ActionButton variant="ghost" size="sm">Trade</ActionButton>
                </div>
              </div>
            </SpatialCard>
          ))}
        </div>
      </section>

      {/* Footer Stats */}
      <section className="dashboard__footer container">
        <SpatialCard>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)' }}>
            {[
              { icon: '📈', label: 'Avg Daily Return', value: '0.34%' },
              { icon: '⚡', label: 'Win Rate', value: '64.2%' },
              { icon: '🎯', label: 'Best Trade', value: '+$3,240' },
              { icon: '📊', label: 'Total Trades', value: '247' },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '24px', marginBottom: 'var(--spacing-md)' }}>{item.icon}</div>
                <p className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                  {item.label}
                </p>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </SpatialCard>
      </section>
    </div>
  );
};

export default Dashboard;
