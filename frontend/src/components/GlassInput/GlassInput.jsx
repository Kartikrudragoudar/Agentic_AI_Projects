import React, { useState } from 'react';
import './GlassInput.css';

const GlassInput = ({
  placeholder = '',
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  label,
  error,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="glass-input-wrapper">
      {label && <label className="glass-input__label label-caps">{label}</label>}
      <div className={`glass-input ${isFocused ? 'glass-input--focused' : ''} ${error ? 'glass-input--error' : ''}`}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="glass-input__input"
          {...props}
        />
      </div>
      {error && <span className="glass-input__error">{error}</span>}
    </div>
  );
};

export default GlassInput;
