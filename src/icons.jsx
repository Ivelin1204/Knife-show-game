// ─── ICONS ──────────────────────────────────────────────────────────────────
// Small stroke-based SVG icons replacing the emoji used for nav tabs, the
// coin balance, map tiles, and crate tiles. All inherit color via
// currentColor so they automatically match whatever text color surrounds
// them (e.g. active/inactive nav tabs), unlike emoji which render in their
// own fixed native color.

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        {...rest}>
      {children}
    </svg>
  );
}

// ── Nav tabs ──
export function IconTarget(props) {
  return <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.8" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </Svg>;
}
export function IconMap(props) {
  return <Svg {...props}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>;
}
export function IconDagger(props) {
  return <Svg {...props}>
    <path d="M12 2.2 13.7 9h-3.4L12 2.2Z" />
    <path d="M12 9v6.8" />
    <path d="M8.6 14.8h6.8l-1 2.6h-4.8l-1-2.6Z" />
    <rect x="10.6" y="17.6" width="2.8" height="4.2" rx="1" />
  </Svg>;
}
export function IconCart(props) {
  return <Svg {...props}>
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6.2" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
  </Svg>;
}
export function IconGift(props) {
  return <Svg {...props}>
    <rect x="3.5" y="8.5" width="17" height="12" rx="1" />
    <path d="M3.5 12.5h17" />
    <path d="M12 8.5v12" />
    <path d="M12 8.5c-1.6-4-6.4-4-6.4-1.2 0 1.4 1.8 1.5 3.2 1.2H12Z" />
    <path d="M12 8.5c1.6-4 6.4-4 6.4-1.2 0 1.4-1.8 1.5-3.2 1.2H12Z" />
  </Svg>;
}
export function IconTrophy(props) {
  return <Svg {...props}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5.2H4.5v1.6a4 4 0 0 0 3.7 4" />
    <path d="M16 5.2h3.5v1.6a4 4 0 0 1-3.7 4" />
    <path d="M12 13v3" />
    <path d="M9 20h6" />
    <path d="M10 16h4l1 4H9l1-4Z" />
  </Svg>;
}
export function IconChart(props) {
  return <Svg {...props}>
    <rect x="4" y="13" width="4" height="7" />
    <rect x="10" y="8.5" width="4" height="11.5" />
    <rect x="16" y="4.5" width="4" height="15.5" />
  </Svg>;
}
export function IconGear(props) {
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315];
  return <Svg {...props}>
    <circle cx="12" cy="12" r="3.2" />
    {ticks.map(deg => (
      <line key={deg} x1="12" y1="2.6" x2="12" y2="5.6" transform={`rotate(${deg} 12 12)`} />
    ))}
  </Svg>;
}

// ── Currency ──
export function IconCoin(props) {
  return <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="6.2" />
    <path d="M9.6 9.9c0-1 1-1.7 2.4-1.7s2.4.6 2.4 1.5-1 1.3-2.4 1.5c-1.4.2-2.4.7-2.4 1.6s1 1.6 2.4 1.6 2.4-.7 2.4-1.6" />
    <path d="M12 7.2v1M12 15.7v1" />
  </Svg>;
}

// ── Maps ──
export function IconLog(props) {
  return <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5.2" />
    <circle cx="12" cy="12" r="2" />
  </Svg>;
}
export function IconColumns(props) {
  return <Svg {...props}>
    <path d="M4 20.5h16" />
    <path d="M4 9 12 4l8 5" />
    <path d="M6 9v9.5M9.6 9v9.5M14.4 9v9.5M18 9v9.5" />
  </Svg>;
}
export function IconSkyline(props) {
  return <Svg {...props}>
    <rect x="3" y="13" width="3" height="8" />
    <rect x="7.4" y="7.5" width="3" height="13.5" />
    <rect x="11.8" y="10.5" width="3" height="10.5" />
    <rect x="16.2" y="4.5" width="3" height="16.5" />
  </Svg>;
}
export function IconVolcano(props) {
  return <Svg {...props}>
    <path d="M3 20.5h18L14.2 8l-2.4 4-1.6-2.6L3 20.5Z" />
    <path d="M12 2.6c-.7 1-.7 2.2 0 3.2.7-1 .7-2.2 0-3.2Z" fill="currentColor" stroke="none" />
  </Svg>;
}
export function IconGalaxy(props) {
  return <Svg {...props}>
    <path d="M12 3.2 13.7 9l5.5 1.6L13.7 12.2 12 18l-1.7-5.8L4.8 10.6 10.3 9 12 3.2Z" />
    <circle cx="18.5" cy="6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="6" cy="17" r="0.9" fill="currentColor" stroke="none" />
  </Svg>;
}

// ── Crates ──
export function IconBox(props) {
  return <Svg {...props}>
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v9l9 5 9-5V8" />
    <path d="M12 13v9" />
  </Svg>;
}
export function IconCrate(props) {
  return <Svg {...props}>
    <rect x="4" y="6" width="16" height="14" rx="1" />
    <path d="M4 11h16" />
    <path d="M12 6v14" />
    <path d="M4 6l8 5 8-5" />
  </Svg>;
}
export function IconOrb(props) {
  return <Svg {...props}>
    <path d="M12 3 18 7l-2.3 8.6H8.3L6 7l6-4Z" />
    <path d="M6 7h12M9 7l1.2 8.6M15 7l-1.2 8.6M12 3v4" />
  </Svg>;
}

// ── Misc ──
export function IconLock(props) {
  return <Svg {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    <path d="M12 16.3v1.6" />
  </Svg>;
}
