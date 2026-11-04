import React from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedLayeredBackground
 * Renders 6 tactile rounded shapes in clay, sage, and teal that drift slowly.
 * Strictly aria-hidden and pointer-events: none.
 * Only displayed on landing, login, and register pages.
 */
export default function AnimatedBackground() {
  return (
    <div className="animated-bg-container" aria-hidden="true">
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-shape bg-shape-3" />
      <div className="bg-shape bg-shape-4" />
      <div className="bg-shape bg-shape-5" />
      <div className="bg-shape bg-shape-6" />
    </div>
  );
}
