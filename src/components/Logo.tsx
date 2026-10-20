import { useId } from 'react';

/**
 * CleanNova mark, redrawn as SVG from the business card (the "C" ring + "n" + water drop).
 * TODO(brand): swap for the official vector logo when available.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const gid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C2276B" />
          <stop offset="1" stopColor="#8C1650" />
        </linearGradient>
      </defs>
      <path d="M43.5 20.5A20 20 0 1 0 43.5 47.5" fill="none" stroke={`url(#${gid})`} strokeWidth="8.5" strokeLinecap="round" />
      <path
        d="M37 52V34c0-6 4-9.5 9.5-9.5S56 28 56 34v18"
        fill="none"
        stroke="#304E4C"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 6c4.2 5.2 6.5 8.8 6.5 11.8a6.5 6.5 0 0 1-13 0C33.5 14.800 35.800 11.200 40 6z" fill="#13A5B2" />
    </svg>
  );
}

function DropO() {
  return (
    <svg className="logo-drop" viewBox="0 0 24 28" role="img" aria-label="O">
      <path d="M12 1.5C17.500 8 20.500 12.200 20.500 16.500a8.500 8.500 0 0 1-17 0C3.500 12.200 6.500 8 12 1.500z" fill="#13A5B2" />
      <path d="M8.200 17.300a4 4 0 0 0 3 3.500" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.800" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo${light ? ' logo--light' : ''}`}>
      <LogoMark size={38} />
      <span className="logo-word">
        <span className="logo-clean">CLEAN</span>
        <span className="logo-nova">
          N<DropO />VA
        </span>
      </span>
    </span>
  );
}
