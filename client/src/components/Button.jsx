import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Reusable Tactile Button Component
 * Supports primary, secondary, and danger variants with 12px radius,
 * 4px solid bottom edge, lift on hover, pressed translation on active,
 * visible focus ring, and inline loading indicator.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  to,
  href,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const classes = [
    'app-btn',
    `app-btn-${variant}`,
    size !== 'md' ? `app-btn-${size}` : '',
    block ? 'app-btn-block' : '',
    loading ? 'app-btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading && (
        <svg
          className="btn-spinner"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray="31.4 31.4"
          />
        </svg>
      )}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        onClick={(e) => {
          if (disabled || loading) {
            e.preventDefault();
            return;
          }
          if (onClick) onClick(e);
        }}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        onClick={(e) => {
          if (disabled || loading) {
            e.preventDefault();
            return;
          }
          if (onClick) onClick(e);
        }}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}
