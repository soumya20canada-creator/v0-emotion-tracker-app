"use client"

export function AppLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bhava lotus logo"
    >
      <defs>
        <linearGradient id="gold-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5D77E" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <filter id="glow-logo">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-logo)">
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(135 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(225 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="30" rx="8" ry="22" fill="url(#gold-logo)" opacity="0.9" transform="rotate(315 50 50)" />
        <circle cx="50" cy="50" r="10" fill="url(#gold-logo)" />
        <circle cx="50" cy="50" r="5" fill="#FFF8E7" opacity="0.85" />
      </g>
    </svg>
  )
}
