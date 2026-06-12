interface Props {
  tier: number
  size?: number
}

export function TierBadge({ tier, size = 16 }: Props) {
  if (tier === 2) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tier 2"
      >
        <title>Tier 2 — Full member</title>
        <circle cx="16" cy="16" r="16" fill="#0f0f0f"/>
        <g transform="translate(4,8)">
          <polygon points="0,16 4,0 8,10 12,0 16,16 13,16 12,6 8,16 4,6 3,16" fill="white"/>
          <polygon points="0,16 1.5,16 5,4 4,0" fill="#1C69D4"/>
          <polygon points="5,4 7,10 9,4 8,0 4,0" fill="#00005B"/>
          <polygon points="9,4 11,10 15,0 12,0 9,4" fill="#C8102E"/>
        </g>
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tier 1"
    >
      <title>Tier 1 — Pending approval</title>
      <circle cx="16" cy="16" r="15" fill="white" stroke="#1C69D4" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="11" fill="white" stroke="#1C69D4" strokeWidth="0.5"/>
      <path d="M16 5 A11 11 0 0 0 5 16 L16 16 Z" fill="#1C69D4"/>
      <path d="M16 27 A11 11 0 0 0 27 16 L16 16 Z" fill="#1C69D4"/>
      <path d="M16 5 A11 11 0 0 1 27 16 L16 16 Z" fill="white"/>
      <path d="M16 27 A11 11 0 0 1 5 16 L16 16 Z" fill="white"/>
      <text x="16" y="10" textAnchor="middle" fontSize="3.5" fontWeight="700" fill="#1C69D4" fontFamily="sans-serif">BMW</text>
    </svg>
  )
}
