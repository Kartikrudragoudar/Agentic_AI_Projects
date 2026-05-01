import React from 'react';
import './MarketTicker.css';

const MarketTicker = ({
  symbol,
  price,
  change,
  changePercent,
  isProfit = true,
}) => {
  return (
    <div className={`market-ticker ${isProfit ? 'market-ticker--profit' : 'market-ticker--loss'}`}>
      <div className="market-ticker__symbol data-table">{symbol}</div>
      <div className="market-ticker__price data-display">${price.toFixed(2)}</div>
      <div className={`market-ticker__change data-table ${isProfit ? 'profit' : 'loss'}`}>
        <span className="market-ticker__arrow">{isProfit ? '↑' : '↓'}</span>
        {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
      </div>
    </div>
  );
};

export default MarketTicker;
