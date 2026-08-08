import { useEffect, useState } from 'react';

function split(msRemaining: number) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(target).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const { days, hours, minutes, seconds } = split(remaining);
  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Mins', value: minutes },
    { label: 'Secs', value: seconds },
  ];

  if (remaining <= 0) {
    return (
      <div className="font-headline-md text-2xl italic text-primary uppercase">Lights out!</div>
    );
  }

  return (
    <div className="flex gap-3 md:gap-5">
      {units.map(u => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="bg-black/50 border border-primary-container/30 rounded-sm px-3 md:px-5 py-3 md:py-4 min-w-[64px] md:min-w-[84px] text-center shadow-[0_0_20px_rgba(225,6,0,0.12)]">
            <span className="font-racing-num text-3xl md:text-5xl text-white text-glow-red tracking-tight">
              {String(u.value).padStart(2, '0')}
            </span>
          </div>
          <span className="font-label-caps text-[10px] text-on-surface-variant mt-2 tracking-widest uppercase">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
