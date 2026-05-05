// Premium NEXUS Logo SVG Component
export function NexusLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="nexBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9050" />
          <stop offset="100%" stopColor="#cc2e00" />
        </linearGradient>
        <linearGradient id="nexShine" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background rounded rect */}
      <rect width="40" height="40" rx="11" fill="url(#nexBg)" />

      {/* Shine overlay */}
      <rect width="40" height="40" rx="11" fill="url(#nexShine)" />

      {/* Stylized N letterform — clean geometric */}
      {/* Left vertical pillar */}
      <rect x="8" y="10" width="5" height="20" rx="2" fill="white" />

      {/* Diagonal connecting bar (top-left to bottom-right) */}
      <polygon
        points="13,10 18,10 27,30 22,30"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Right vertical pillar */}
      <rect x="22" y="10" width="5" height="20" rx="2" fill="white" />

      {/* Small accent dot — top right */}
      <circle cx="32.5" cy="9.5" r="3" fill="white" fillOpacity="0.3" />
      <circle cx="32.5" cy="9.5" r="1.8" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

export function NexusWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-[-0.04em] ${className}`}>
      NEX<span className="text-[#ff8040]">US</span>
    </span>
  );
}
