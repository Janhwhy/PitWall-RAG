import type { ReactNode } from 'react';

/**
 * Shared panel chrome so every section reads as one connected surface
 * instead of a grid of individually-boxed, individually-bordered cards.
 * Accent renders as a thin left rail, not a full border ring.
 */
export function Panel({
  children,
  className = '',
  accent,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  accent?: 'red' | 'caution' | 'go' | 'tertiary';
  as?: 'div' | 'section';
}) {
  const accentBorder = accent
    ? {
        red: 'border-l-2 border-l-f1-red',
        caution: 'border-l-2 border-l-status-caution',
        go: 'border-l-2 border-l-status-go',
        tertiary: 'border-l-2 border-l-tertiary-container',
      }[accent]
    : 'border-l border-l-border-rim';
  return (
    <Tag className={`bg-background-surface/70 border border-border-rim/80 ${accentBorder} rounded-lg ${className}`}>
      {children}
    </Tag>
  );
}

export function PanelHeader({
  icon,
  title,
  action,
}: {
  icon?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-rim/60">
      <div className="flex items-center gap-2.5">
        {icon && <span className="material-symbols-outlined text-secondary text-[17px]">{icon}</span>}
        <h3 className="font-telemetry-sm text-[10.5px] uppercase tracking-[0.16em] font-semibold text-on-surface">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

/** A labeled stat row for inside a Panel — replaces one-off boxed stat cards. */
export function StatRow({
  label,
  value,
  valueClass = 'text-white',
  sub,
  last = false,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${last ? '' : 'border-b border-border-rim/60'}`}>
      <div className="font-telemetry-sm text-[10px] text-secondary uppercase tracking-widest mb-1">{label}</div>
      <div className={`font-telemetry-lg text-2xl ${valueClass}`}>{value}</div>
      {sub && <div className="font-telemetry-sm text-[10px] text-secondary uppercase mt-1 tracking-wide">{sub}</div>}
    </div>
  );
}
