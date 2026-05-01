import React from 'react';
import './Chip.css';

const Chip = ({
  label,
  icon,
  variant = 'default',
  size = 'md',
  onClick,
  selected = false,
  removable = false,
  onRemove,
}) => {
  return (
    <div
      className={`chip chip--${variant} chip--${size} ${selected ? 'chip--selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <span className="chip__icon">{icon}</span>}
      <span className="chip__label">{label}</span>
      {removable && (
        <button
          className="chip__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Chip;
