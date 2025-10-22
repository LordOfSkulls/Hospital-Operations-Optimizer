import React from 'react';

export const HospitalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Band-aid 1: rotated -45 degrees */}
    <g transform="rotate(-45 32 32)">
      {/* Outline */}
      <rect x="14" y="25" width="36" height="14" rx="2" />
      {/* Center patch */}
      <rect x="29" y="22" width="6" height="20" />
      {/* Dots left */}
      <path d="M19 29h.01 M24 29h.01 M19 35h.01 M24 35h.01" />
      {/* Dots right */}
      <path d="M40 29h.01 M45 29h.01 M40 35h.01 M45 35h.01" />
      {/* Lines on patch */}
      <path d="M32 22v-2 M32 42v2" />
    </g>
    {/* Band-aid 2: rotated 45 degrees */}
    <g transform="rotate(45 32 32)">
      {/* Outline */}
      <rect x="14" y="25" width="36" height="14" rx="2" />
      {/* Center patch */}
      <rect x="29" y="22" width="6" height="20" />
      {/* Dots left */}
      <path d="M19 29h.01 M24 29h.01 M19 35h.01 M24 35h.01" />
      {/* Dots right */}
      <path d="M40 29h.01 M45 29h.01 M40 35h.01 M45 35h.01" />
      {/* Lines on patch */}
      <path d="M32 22v-2 M32 42v2" />
    </g>
  </svg>
);