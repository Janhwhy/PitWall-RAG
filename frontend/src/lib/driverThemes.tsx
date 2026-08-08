import type { CSSProperties, ReactNode } from 'react';

// F1 Official CDN URL helper
// Pattern: https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026/{team}/{driverID}/{year}{team}{driverID}right.webp
// Verified 2026 CDN base — suffix is always '01' (not car number), team names have no hyphens
const F1_CDN = 'https://media.formula1.com/image/upload/c_fill,w_720/q_auto/v1740000001/common/f1/2026';

function f1Photo(team: string, driverID: string): string {
  return `${F1_CDN}/${team}/${driverID}/2026${team}${driverID}right.webp`;
}

export interface DriverTheme {
  code: string;
  fullName: string;
  team: string;
  teamFull: string;
  gradientClass: string;
  gradientStyle: CSSProperties;
  accentColor: string;
  logoSvg: ReactNode;
  portraitUrl: string;
}

// Ferrari Prancing Horse Logo SVG
const FerrariLogo = () => (
  <svg viewBox="0 0 100 120" className="w-full h-full">
    <path
      d="M 50,5 L 90,20 L 85,90 L 50,115 L 15,90 L 10,20 Z"
      fill="#ffeb3b"
      stroke="#ffffff"
      strokeWidth="3"
    />
    <path
      d="M 35,90 C 35,70 45,55 52,35 C 54,45 60,50 68,55 C 60,60 55,70 55,88 Z"
      fill="#111111"
    />
    <rect x="25" y="15" width="50" height="6" fill="#009246" />
    <rect x="25" y="21" width="50" height="6" fill="#ffffff" />
    <rect x="25" y="27" width="50" height="6" fill="#ce2b37" />
  </svg>
);

// Mercedes Three-Pointed Star Logo SVG
const MercedesLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#00a19c" strokeWidth="6" />
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 50,10 L 50,50 M 50,50 L 16,74 M 50,50 L 84,74" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// McLaren Speedmark Logo SVG
const McLarenLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path
      d="M 20,65 C 45,30 85,35 90,70 C 65,50 35,55 20,65 Z"
      fill="#ff8000"
    />
  </svg>
);

// Red Bull Racing Emblem Logo SVG
const RedBullLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="35" fill="#f59e0b" />
    <path d="M 25,55 C 40,35 60,35 75,55 C 65,48 45,48 25,55 Z" fill="#dc2626" />
  </svg>
);

// Williams W Logo SVG
const WilliamsLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 15,25 L 35,75 L 50,40 L 65,75 L 85,25" fill="none" stroke="#005aff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 15,25 L 35,75 L 50,40 L 65,75 L 85,25" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Alpine Logo
const AlpineLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 50,10 L 90,80 L 10,80 Z" fill="none" stroke="#0090ff" strokeWidth="7" strokeLinejoin="round" />
    <path d="M 50,30 L 75,72 L 25,72 Z" fill="#0090ff" />
  </svg>
);

// Aston Martin Logo
const AstonMartinLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <ellipse cx="50" cy="50" rx="44" ry="30" fill="none" stroke="#00665e" strokeWidth="6" />
    <path d="M 20,50 C 25,35 45,28 50,50 C 55,28 75,35 80,50" fill="none" stroke="#00665e" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// Haas Logo
const HaasLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="10" y="20" width="80" height="60" rx="4" fill="none" stroke="#e8002d" strokeWidth="6" />
    <path d="M 10,50 L 90,50" stroke="#e8002d" strokeWidth="5" />
    <path d="M 50,20 L 50,80" stroke="#e8002d" strokeWidth="5" />
  </svg>
);

// RB/Visa CashApp Racing logo
const RBLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="6" />
    <text x="50" y="57" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="sans-serif">RB</text>
  </svg>
);

// Audi/Cadillac (Kick Sauber becoming Audi in 2026)
const AudiLogo = () => (
  <svg viewBox="0 0 100 40" className="w-full h-full">
    {[15, 35, 55, 75].map((cx, i) => (
      <circle key={i} cx={cx} cy="20" r="12" fill="none" stroke="#bb0000" strokeWidth="4" />
    ))}
  </svg>
);

// ==== DRIVER THEMES MAP ====
// URL source: media.formula1.com confirmed 2026 CDN pattern
export const DRIVER_THEMES: Record<string, DriverTheme> = {

  // ─── FERRARI ──────────────────────────────────────────────────────────────
  HAM: {
    code: 'HAM', fullName: 'Lewis Hamilton', team: 'Ferrari', teamFull: 'Scuderia Ferrari HP',
    gradientClass: 'from-[#e10600] via-[#900000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #d00000 0%, #900000 30%, #300000 65%, #121214 95%)' },
    accentColor: '#e10600', logoSvg: <FerrariLogo />,
    portraitUrl: f1Photo('ferrari', 'lewham01'),
  },
  'LEWIS HAMILTON': {
    code: 'HAM', fullName: 'Lewis Hamilton', team: 'Ferrari', teamFull: 'Scuderia Ferrari HP',
    gradientClass: 'from-[#e10600] via-[#900000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #d00000 0%, #900000 30%, #300000 65%, #121214 95%)' },
    accentColor: '#e10600', logoSvg: <FerrariLogo />,
    portraitUrl: f1Photo('ferrari', 'lewham01'),
  },
  LEC: {
    code: 'LEC', fullName: 'Charles Leclerc', team: 'Ferrari', teamFull: 'Scuderia Ferrari HP',
    gradientClass: 'from-[#e10600] via-[#900000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #d00000 0%, #900000 30%, #300000 65%, #121214 95%)' },
    accentColor: '#e10600', logoSvg: <FerrariLogo />,
    portraitUrl: f1Photo('ferrari', 'chalec01'),
  },
  'CHARLES LECLERC': {
    code: 'LEC', fullName: 'Charles Leclerc', team: 'Ferrari', teamFull: 'Scuderia Ferrari HP',
    gradientClass: 'from-[#e10600] via-[#900000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #d00000 0%, #900000 30%, #300000 65%, #121214 95%)' },
    accentColor: '#e10600', logoSvg: <FerrariLogo />,
    portraitUrl: f1Photo('ferrari', 'chalec01'),
  },

  // ─── MERCEDES ─────────────────────────────────────────────────────────────
  ANT: {
    code: 'ANT', fullName: 'Andrea Kimi Antonelli', team: 'Mercedes', teamFull: 'Mercedes-AMG Petronas F1 Team',
    gradientClass: 'from-[#00a19c] via-[#111827] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #008f8a 0%, #00524e 35%, #0f1c24 65%, #121214 95%)' },
    accentColor: '#00a19c', logoSvg: <MercedesLogo />,
    portraitUrl: f1Photo('mercedes', 'andant01'),
  },
  'ANDREA KIMI ANTONELLI': {
    code: 'ANT', fullName: 'Andrea Kimi Antonelli', team: 'Mercedes', teamFull: 'Mercedes-AMG Petronas F1 Team',
    gradientClass: 'from-[#00a19c] via-[#111827] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #008f8a 0%, #00524e 35%, #0f1c24 65%, #121214 95%)' },
    accentColor: '#00a19c', logoSvg: <MercedesLogo />,
    portraitUrl: f1Photo('mercedes', 'andant01'),
  },
  RUS: {
    code: 'RUS', fullName: 'George Russell', team: 'Mercedes', teamFull: 'Mercedes-AMG Petronas F1 Team',
    gradientClass: 'from-[#00a19c] via-[#1f2937] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #008f8a 0%, #00524e 35%, #0f1c24 65%, #121214 95%)' },
    accentColor: '#00a19c', logoSvg: <MercedesLogo />,
    portraitUrl: f1Photo('mercedes', 'georus01'),
  },
  'GEORGE RUSSELL': {
    code: 'RUS', fullName: 'George Russell', team: 'Mercedes', teamFull: 'Mercedes-AMG Petronas F1 Team',
    gradientClass: 'from-[#00a19c] via-[#1f2937] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #008f8a 0%, #00524e 35%, #0f1c24 65%, #121214 95%)' },
    accentColor: '#00a19c', logoSvg: <MercedesLogo />,
    portraitUrl: f1Photo('mercedes', 'georus01'),
  },

  // ─── MCLAREN ──────────────────────────────────────────────────────────────
  NOR: {
    code: 'NOR', fullName: 'Lando Norris', team: 'McLaren', teamFull: 'McLaren F1 Team',
    gradientClass: 'from-[#ff8000] via-[#c2410c] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #f97316 0%, #c2410c 35%, #31150a 65%, #121214 95%)' },
    accentColor: '#ff8000', logoSvg: <McLarenLogo />,
    portraitUrl: f1Photo('mclaren', 'lannor01'),
  },
  'LANDO NORRIS': {
    code: 'NOR', fullName: 'Lando Norris', team: 'McLaren', teamFull: 'McLaren F1 Team',
    gradientClass: 'from-[#ff8000] via-[#c2410c] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #f97316 0%, #c2410c 35%, #31150a 65%, #121214 95%)' },
    accentColor: '#ff8000', logoSvg: <McLarenLogo />,
    portraitUrl: f1Photo('mclaren', 'lannor01'),
  },
  PIA: {
    code: 'PIA', fullName: 'Oscar Piastri', team: 'McLaren', teamFull: 'McLaren F1 Team',
    gradientClass: 'from-[#ff8000] via-[#c2410c] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #f97316 0%, #c2410c 35%, #31150a 65%, #121214 95%)' },
    accentColor: '#ff8000', logoSvg: <McLarenLogo />,
    portraitUrl: f1Photo('mclaren', 'oscpia01'),
  },
  'OSCAR PIASTRI': {
    code: 'PIA', fullName: 'Oscar Piastri', team: 'McLaren', teamFull: 'McLaren F1 Team',
    gradientClass: 'from-[#ff8000] via-[#c2410c] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #f97316 0%, #c2410c 35%, #31150a 65%, #121214 95%)' },
    accentColor: '#ff8000', logoSvg: <McLarenLogo />,
    portraitUrl: f1Photo('mclaren', 'oscpia01'),
  },

  // ─── RED BULL ─────────────────────────────────────────────────────────────
  VER: {
    code: 'VER', fullName: 'Max Verstappen', team: 'Red Bull', teamFull: 'Oracle Red Bull Racing',
    gradientClass: 'from-[#1e3a8a] via-[#1e1b4b] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #1d4ed8 0%, #1e1b4b 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#3b82f6', logoSvg: <RedBullLogo />,
    portraitUrl: f1Photo('redbullracing', 'maxver01'),
  },
  'MAX VERSTAPPEN': {
    code: 'VER', fullName: 'Max Verstappen', team: 'Red Bull', teamFull: 'Oracle Red Bull Racing',
    gradientClass: 'from-[#1e3a8a] via-[#1e1b4b] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #1d4ed8 0%, #1e1b4b 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#3b82f6', logoSvg: <RedBullLogo />,
    portraitUrl: f1Photo('redbullracing', 'maxver01'),
  },
  HAD: {
    code: 'HAD', fullName: 'Isack Hadjar', team: 'Red Bull', teamFull: 'Oracle Red Bull Racing',
    gradientClass: 'from-[#1e3a8a] via-[#1e1b4b] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #1d4ed8 0%, #1e1b4b 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#3b82f6', logoSvg: <RedBullLogo />,
    portraitUrl: f1Photo('redbullracing', 'isahad01'),
  },
  'ISACK HADJAR': {
    code: 'HAD', fullName: 'Isack Hadjar', team: 'Red Bull', teamFull: 'Oracle Red Bull Racing',
    gradientClass: 'from-[#1e3a8a] via-[#1e1b4b] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #1d4ed8 0%, #1e1b4b 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#3b82f6', logoSvg: <RedBullLogo />,
    portraitUrl: f1Photo('redbullracing', 'isahad01'),
  },

  // ─── WILLIAMS ─────────────────────────────────────────────────────────────
  SAI: {
    code: 'SAI', fullName: 'Carlos Sainz', team: 'Williams', teamFull: 'Williams Racing',
    gradientClass: 'from-[#005aff] via-[#1e3a8a] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #005aff 0%, #1e3a8a 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#005aff', logoSvg: <WilliamsLogo />,
    portraitUrl: f1Photo('williams', 'carsai01'),
  },
  'CARLOS SAINZ': {
    code: 'SAI', fullName: 'Carlos Sainz', team: 'Williams', teamFull: 'Williams Racing',
    gradientClass: 'from-[#005aff] via-[#1e3a8a] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #005aff 0%, #1e3a8a 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#005aff', logoSvg: <WilliamsLogo />,
    portraitUrl: f1Photo('williams', 'carsai01'),
  },
  ALB: {
    code: 'ALB', fullName: 'Alexander Albon', team: 'Williams', teamFull: 'Williams Racing',
    gradientClass: 'from-[#005aff] via-[#1e3a8a] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #005aff 0%, #1e3a8a 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#005aff', logoSvg: <WilliamsLogo />,
    portraitUrl: f1Photo('williams', 'alealb01'),
  },
  'ALEXANDER ALBON': {
    code: 'ALB', fullName: 'Alexander Albon', team: 'Williams', teamFull: 'Williams Racing',
    gradientClass: 'from-[#005aff] via-[#1e3a8a] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #005aff 0%, #1e3a8a 35%, #0d111d 65%, #121214 95%)' },
    accentColor: '#005aff', logoSvg: <WilliamsLogo />,
    portraitUrl: f1Photo('williams', 'alealb01'),
  },

  // ─── ALPINE ───────────────────────────────────────────────────────────────
  GAS: {
    code: 'GAS', fullName: 'Pierre Gasly', team: 'Alpine', teamFull: 'BWT Alpine F1 Team',
    gradientClass: 'from-[#0090ff] via-[#0050aa] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #0090ff 0%, #0050aa 35%, #0d1a2e 65%, #121214 95%)' },
    accentColor: '#0090ff', logoSvg: <AlpineLogo />,
    portraitUrl: f1Photo('alpine', 'piegas01'),
  },
  'PIERRE GASLY': {
    code: 'GAS', fullName: 'Pierre Gasly', team: 'Alpine', teamFull: 'BWT Alpine F1 Team',
    gradientClass: 'from-[#0090ff] via-[#0050aa] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #0090ff 0%, #0050aa 35%, #0d1a2e 65%, #121214 95%)' },
    accentColor: '#0090ff', logoSvg: <AlpineLogo />,
    portraitUrl: f1Photo('alpine', 'piegas01'),
  },
  COL: {
    code: 'COL', fullName: 'Franco Colapinto', team: 'Alpine', teamFull: 'BWT Alpine F1 Team',
    gradientClass: 'from-[#0090ff] via-[#0050aa] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #0090ff 0%, #0050aa 35%, #0d1a2e 65%, #121214 95%)' },
    accentColor: '#0090ff', logoSvg: <AlpineLogo />,
    portraitUrl: f1Photo('alpine', 'fracol01'),
  },
  'FRANCO COLAPINTO': {
    code: 'COL', fullName: 'Franco Colapinto', team: 'Alpine', teamFull: 'BWT Alpine F1 Team',
    gradientClass: 'from-[#0090ff] via-[#0050aa] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #0090ff 0%, #0050aa 35%, #0d1a2e 65%, #121214 95%)' },
    accentColor: '#0090ff', logoSvg: <AlpineLogo />,
    portraitUrl: f1Photo('alpine', 'fracol01'),
  },

  // ─── HAAS ─────────────────────────────────────────────────────────────────
  OCO: {
    code: 'OCO', fullName: 'Esteban Ocon', team: 'Haas', teamFull: 'MoneyGram Haas F1 Team',
    gradientClass: 'from-[#b5beca] via-[#3d4657] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #9ca3af 0%, #4b5563 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#e8002d', logoSvg: <HaasLogo />,
    portraitUrl: f1Photo('haas', 'estoco01'),
  },
  'ESTEBAN OCON': {
    code: 'OCO', fullName: 'Esteban Ocon', team: 'Haas', teamFull: 'MoneyGram Haas F1 Team',
    gradientClass: 'from-[#b5beca] via-[#3d4657] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #9ca3af 0%, #4b5563 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#e8002d', logoSvg: <HaasLogo />,
    portraitUrl: f1Photo('haas', 'estoco01'),
  },
  BEA: {
    code: 'BEA', fullName: 'Oliver Bearman', team: 'Haas', teamFull: 'MoneyGram Haas F1 Team',
    gradientClass: 'from-[#b5beca] via-[#3d4657] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #9ca3af 0%, #4b5563 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#e8002d', logoSvg: <HaasLogo />,
    portraitUrl: f1Photo('haas', 'olibea01'),
  },
  'OLIVER BEARMAN': {
    code: 'BEA', fullName: 'Oliver Bearman', team: 'Haas', teamFull: 'MoneyGram Haas F1 Team',
    gradientClass: 'from-[#b5beca] via-[#3d4657] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #9ca3af 0%, #4b5563 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#e8002d', logoSvg: <HaasLogo />,
    portraitUrl: f1Photo('haas', 'olibea01'),
  },

  // ─── RB (VISA CASH APP RACING) ────────────────────────────────────────────
  LAW: {
    code: 'LAW', fullName: 'Liam Lawson', team: 'RB', teamFull: 'Visa Cash App RB F1 Team',
    gradientClass: 'from-[#6366f1] via-[#3730a3] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6366f1 0%, #3730a3 35%, #1e1b4b 65%, #121214 95%)' },
    accentColor: '#6366f1', logoSvg: <RBLogo />,
    portraitUrl: f1Photo('racingbulls', 'lialaw01'),
  },
  'LIAM LAWSON': {
    code: 'LAW', fullName: 'Liam Lawson', team: 'RB', teamFull: 'Visa Cash App RB F1 Team',
    gradientClass: 'from-[#6366f1] via-[#3730a3] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6366f1 0%, #3730a3 35%, #1e1b4b 65%, #121214 95%)' },
    accentColor: '#6366f1', logoSvg: <RBLogo />,
    portraitUrl: f1Photo('racingbulls', 'lialaw01'),
  },
  LIN: {
    code: 'LIN', fullName: 'Arvid Lindblad', team: 'RB', teamFull: 'Visa Cash App RB F1 Team',
    gradientClass: 'from-[#6366f1] via-[#3730a3] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6366f1 0%, #3730a3 35%, #1e1b4b 65%, #121214 95%)' },
    accentColor: '#6366f1', logoSvg: <RBLogo />,
    portraitUrl: f1Photo('racingbulls', 'arvlin01'),
  },
  'ARVID LINDBLAD': {
    code: 'LIN', fullName: 'Arvid Lindblad', team: 'RB', teamFull: 'Visa Cash App RB F1 Team',
    gradientClass: 'from-[#6366f1] via-[#3730a3] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6366f1 0%, #3730a3 35%, #1e1b4b 65%, #121214 95%)' },
    accentColor: '#6366f1', logoSvg: <RBLogo />,
    portraitUrl: f1Photo('racingbulls', 'arvlin01'),
  },

  // ─── ASTON MARTIN ─────────────────────────────────────────────────────────
  ALO: {
    code: 'ALO', fullName: 'Fernando Alonso', team: 'Aston Martin', teamFull: 'Aston Martin Aramco F1 Team',
    gradientClass: 'from-[#00665e] via-[#004d46] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #00665e 0%, #004d46 35%, #001a18 65%, #121214 95%)' },
    accentColor: '#00665e', logoSvg: <AstonMartinLogo />,
    portraitUrl: f1Photo('astonmartin', 'feralo01'),
  },
  'FERNANDO ALONSO': {
    code: 'ALO', fullName: 'Fernando Alonso', team: 'Aston Martin', teamFull: 'Aston Martin Aramco F1 Team',
    gradientClass: 'from-[#00665e] via-[#004d46] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #00665e 0%, #004d46 35%, #001a18 65%, #121214 95%)' },
    accentColor: '#00665e', logoSvg: <AstonMartinLogo />,
    portraitUrl: f1Photo('astonmartin', 'feralo01'),
  },
  STR: {
    code: 'STR', fullName: 'Lance Stroll', team: 'Aston Martin', teamFull: 'Aston Martin Aramco F1 Team',
    gradientClass: 'from-[#00665e] via-[#004d46] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #00665e 0%, #004d46 35%, #001a18 65%, #121214 95%)' },
    accentColor: '#00665e', logoSvg: <AstonMartinLogo />,
    portraitUrl: f1Photo('astonmartin', 'lanstr01'),
  },
  'LANCE STROLL': {
    code: 'STR', fullName: 'Lance Stroll', team: 'Aston Martin', teamFull: 'Aston Martin Aramco F1 Team',
    gradientClass: 'from-[#00665e] via-[#004d46] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #00665e 0%, #004d46 35%, #001a18 65%, #121214 95%)' },
    accentColor: '#00665e', logoSvg: <AstonMartinLogo />,
    portraitUrl: f1Photo('astonmartin', 'lanstr01'),
  },

  // ─── AUDI (formerly Kick Sauber) ──────────────────────────────────────────
  HUL: {
    code: 'HUL', fullName: 'Nico Hülkenberg', team: 'Audi', teamFull: 'Audi F1 Team',
    gradientClass: 'from-[#bb0000] via-[#7a0000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #bb0000 0%, #7a0000 35%, #300000 65%, #121214 95%)' },
    accentColor: '#bb0000', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('audi', 'nichul01'),
  },
  'NICO HÜLKENBERG': {
    code: 'HUL', fullName: 'Nico Hülkenberg', team: 'Audi', teamFull: 'Audi F1 Team',
    gradientClass: 'from-[#bb0000] via-[#7a0000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #bb0000 0%, #7a0000 35%, #300000 65%, #121214 95%)' },
    accentColor: '#bb0000', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('audi', 'nichul01'),
  },
  BOR: {
    code: 'BOR', fullName: 'Gabriel Bortoleto', team: 'Audi', teamFull: 'Audi F1 Team',
    gradientClass: 'from-[#bb0000] via-[#7a0000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #bb0000 0%, #7a0000 35%, #300000 65%, #121214 95%)' },
    accentColor: '#bb0000', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('audi', 'gabbor01'),
  },
  'GABRIEL BORTOLETO': {
    code: 'BOR', fullName: 'Gabriel Bortoleto', team: 'Audi', teamFull: 'Audi F1 Team',
    gradientClass: 'from-[#bb0000] via-[#7a0000] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #bb0000 0%, #7a0000 35%, #300000 65%, #121214 95%)' },
    accentColor: '#bb0000', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('audi', 'gabbor01'),
  },

  // ─── CADILLAC (Andretti Global) ───────────────────────────────────────────
  BOT: {
    code: 'BOT', fullName: 'Valtteri Bottas', team: 'Cadillac', teamFull: 'Cadillac F1 Team',
    gradientClass: 'from-[#6b7280] via-[#374151] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6b7280 0%, #374151 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#6b7280', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('cadillac', 'valbot77'),
  },
  'VALTTERI BOTTAS': {
    code: 'BOT', fullName: 'Valtteri Bottas', team: 'Cadillac', teamFull: 'Cadillac F1 Team',
    gradientClass: 'from-[#6b7280] via-[#374151] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6b7280 0%, #374151 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#6b7280', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('cadillac', 'valbot77'),
  },
  PER: {
    code: 'PER', fullName: 'Sergio Pérez', team: 'Cadillac', teamFull: 'Cadillac F1 Team',
    gradientClass: 'from-[#6b7280] via-[#374151] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6b7280 0%, #374151 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#6b7280', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('cadillac', 'serper11'),
  },
  'SERGIO PÉREZ': {
    code: 'PER', fullName: 'Sergio Pérez', team: 'Cadillac', teamFull: 'Cadillac F1 Team',
    gradientClass: 'from-[#6b7280] via-[#374151] to-[#131314]',
    gradientStyle: { background: 'linear-gradient(110deg, #6b7280 0%, #374151 35%, #1f2937 65%, #121214 95%)' },
    accentColor: '#6b7280', logoSvg: <AudiLogo />,
    portraitUrl: f1Photo('cadillac', 'serper11'),
  },
};

export function getNationalityCode(nationality: string = ''): string {
  const nat = nationality.toLowerCase().trim();
  if (nat.includes('ita')) return 'ITA';
  if (nat.includes('brit') || nat.includes('eng') || nat.includes('gbr') || nat.includes('uk')) return 'GBR';
  if (nat.includes('mon') || nat.includes('mone')) return 'MON';
  if (nat.includes('dutch') || nat.includes('neth') || nat.includes('ned')) return 'NED';
  if (nat.includes('span') || nat.includes('esp')) return 'ESP';
  if (nat.includes('austr') || nat.includes('aus')) return 'AUS';
  if (nat.includes('fren') || nat.includes('fra')) return 'FRA';
  if (nat.includes('zeal') || nat.includes('nzl')) return 'NZL';
  if (nat.includes('arg')) return 'ARG';
  if (nat.includes('braz') || nat.includes('bra')) return 'BRA';
  if (nat.includes('germ') || nat.includes('ger')) return 'GER';
  if (nat.includes('can')) return 'CAN';
  if (nat.includes('mex')) return 'MEX';
  if (nat.includes('fin')) return 'FIN';
  if (nat.includes('swed') || nat.includes('swe')) return 'SWE';
  if (nat.includes('jap') || nat.includes('jpn')) return 'JPN';
  if (nat.includes('thai') || nat.includes('tha')) return 'THA';
  if (nat.includes('chin') || nat.includes('chn')) return 'CHN';
  if (nat.includes('usa') || nat.includes('amer')) return 'USA';
  return nationality.substring(0, 3).toUpperCase() || 'F1';
}

// Fallback resolver by team or driver code
export function getDriverTheme(driverCodeOrName: string, teamName?: string): DriverTheme {
  const key = driverCodeOrName.toUpperCase().trim();
  if (DRIVER_THEMES[key]) {
    return DRIVER_THEMES[key];
  }

  // Resolve by team name if driver not explicitly registered
  const team = (teamName || '').toLowerCase();

  const makeTheme = (
    teamShort: string,
    teamFull: string,
    gradient: string,
    accent: string,
    logo: ReactNode,
    driverID: string,
    teamCDN: string,
  ): DriverTheme => ({
    code: key.substring(0, 3),
    fullName: driverCodeOrName,
    team: teamShort,
    teamFull,
    gradientClass: '',
    gradientStyle: { background: gradient },
    accentColor: accent,
    logoSvg: logo,
    portraitUrl: f1Photo(teamCDN, driverID),
  });

  if (team.includes('ferrari')) return makeTheme('Ferrari', 'Scuderia Ferrari HP', 'linear-gradient(110deg, #d00000 0%, #900000 30%, #300000 65%, #121214 95%)', '#e10600', <FerrariLogo />, 'lewham01', 'ferrari');
  if (team.includes('mercedes')) return makeTheme('Mercedes', 'Mercedes-AMG Petronas', 'linear-gradient(110deg, #008f8a 0%, #00524e 35%, #0f1c24 65%, #121214 95%)', '#00a19c', <MercedesLogo />, 'andant01', 'mercedes');
  if (team.includes('mclaren')) return makeTheme('McLaren', 'McLaren F1 Team', 'linear-gradient(110deg, #f97316 0%, #c2410c 35%, #31150a 65%, #121214 95%)', '#ff8000', <McLarenLogo />, 'lannor01', 'mclaren');
  if (team.includes('red bull')) return makeTheme('Red Bull', 'Oracle Red Bull Racing', 'linear-gradient(110deg, #1d4ed8 0%, #1e1b4b 35%, #0d111d 65%, #121214 95%)', '#3b82f6', <RedBullLogo />, 'maxver33', 'red-bull-racing');
  if (team.includes('williams')) return makeTheme('Williams', 'Williams Racing', 'linear-gradient(110deg, #005aff 0%, #1e3a8a 35%, #0d111d 65%, #121214 95%)', '#005aff', <WilliamsLogo />, 'carsai55', 'williams');
  if (team.includes('alpine')) return makeTheme('Alpine', 'BWT Alpine F1 Team', 'linear-gradient(110deg, #0090ff 0%, #0050aa 35%, #0d1a2e 65%, #121214 95%)', '#0090ff', <AlpineLogo />, 'piegas10', 'alpine');
  if (team.includes('haas')) return makeTheme('Haas', 'MoneyGram Haas F1 Team', 'linear-gradient(110deg, #9ca3af 0%, #4b5563 35%, #1f2937 65%, #121214 95%)', '#e8002d', <HaasLogo />, 'estoco31', 'haas');
  if (team.includes(' rb') || team.includes('rb f1') || team.includes('visa')) return makeTheme('RB', 'Visa Cash App RB F1 Team', 'linear-gradient(110deg, #6366f1 0%, #3730a3 35%, #1e1b4b 65%, #121214 95%)', '#6366f1', <RBLogo />, 'lialaw30', 'rb');
  if (team.includes('aston')) return makeTheme('Aston Martin', 'Aston Martin Aramco F1 Team', 'linear-gradient(110deg, #00665e 0%, #004d46 35%, #001a18 65%, #121214 95%)', '#00665e', <AstonMartinLogo />, 'feralo14', 'aston-martin');
  if (team.includes('audi') || team.includes('sauber') || team.includes('kick')) return makeTheme('Audi', 'Stake F1 Team Kick Sauber', 'linear-gradient(110deg, #bb0000 0%, #7a0000 35%, #300000 65%, #121214 95%)', '#bb0000', <AudiLogo />, 'nichul27', 'kick-sauber');
  if (team.includes('cadillac') || team.includes('andretti')) return makeTheme('Cadillac', 'Cadillac F1 Team', 'linear-gradient(110deg, #6b7280 0%, #374151 35%, #1f2937 65%, #121214 95%)', '#6b7280', <AudiLogo />, 'valbot77', 'cadillac');

  // Default fallback
  return {
    code: key.substring(0, 3),
    fullName: driverCodeOrName,
    team: teamName || 'F1 Team',
    teamFull: teamName || 'Formula 1 Team',
    gradientClass: 'from-f1-red via-red-900 to-zinc-950',
    gradientStyle: { background: 'linear-gradient(135deg, #e10600 0%, #4a0000 60%, #0e0e0f 100%)' },
    accentColor: '#e10600',
    logoSvg: <FerrariLogo />,
    portraitUrl: f1Photo('ferrari', 'lewham01'),
  };
}
