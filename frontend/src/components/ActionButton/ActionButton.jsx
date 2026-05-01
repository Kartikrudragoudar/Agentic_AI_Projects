import React from 'react';
import './ActionButton.css';

const ActionButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`action-button action-button--${variant} action-button--${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="action-button__content">{children}</span>
    </button>
  );
};

export default ActionButton;
