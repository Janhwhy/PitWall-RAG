import { getDriverTheme } from '../lib/driverThemes';
import type { DriverStandingEntry } from '../lib/api';

interface TopDriverCardProps {
  driver: DriverStandingEntry;
  position: number; // 1, 2, or 3
  isLeader?: boolean;
}

export default function TopDriverCard({ driver, position, isLeader }: TopDriverCardProps) {
  const theme = getDriverTheme(driver.driver_code || driver.full_name, driver.team);

  return (
    <div
      className={`rounded-xl rim-light overflow-hidden flex flex-col sm:flex-row h-full group hover:border-f1-red/60 transition-all duration-300 shadow-2xl relative ${
        isLeader ? 'border-2 border-f1-red shadow-f1-red/20' : ''
      }`}
      style={theme.gradientStyle}
    >
      {/* LEFT PORTION: Driver Portrait standing on Team Color Gradient */}
      <div className="relative w-full sm:w-5/12 min-h-[190px] sm:min-h-[210px] flex items-end justify-center p-2">
        {/* Top-Left: Team Logo Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md p-1.5 rim-border flex items-center justify-center shadow-lg">
            {theme.logoSvg}
          </div>
          <span className="text-[10px] font-telemetry-sm font-bold uppercase tracking-wider text-white/90 drop-shadow">
            {theme.team}
          </span>
        </div>

        {/* Driver Upper Body Portrait */}
        <div className="relative z-0 w-full h-full flex items-end justify-center pt-6">
          <div className="w-36 h-44 sm:w-40 sm:h-48 relative drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transform group-hover:scale-105 transition-transform duration-500">
            <img
              src={theme.portraitUrl}
              alt={driver.full_name}
              className="w-full h-full object-contain object-bottom filter contrast-105"
            />
          </div>
        </div>

        {/* Soft fade at bottom of portrait */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* RIGHT PORTION: Rank Number, Driver Name, Team, and Points */}
      <div className="w-full sm:w-7/12 p-5 sm:pl-2 flex flex-col justify-between z-10">
        <div>
          <div className="flex items-center justify-between mb-2">
            {/* Clean Rank Number 01, 02, 03 */}
            <span
              className={`font-racing-num text-3xl sm:text-4xl font-extrabold ${
                isLeader ? 'text-f1-red text-glow-red' : 'text-white/90'
              }`}
            >
              0{position}
            </span>

            {driver.wins > 0 && (
              <span className="px-2 py-0.5 bg-f1-red/20 border border-f1-red/40 text-f1-red rounded text-[10px] font-telemetry-sm font-bold uppercase tracking-wider">
                {driver.wins} {driver.wins === 1 ? 'WIN' : 'WINS'}
              </span>
            )}
          </div>

          <div className="space-y-1 my-2">
            <h3 className="font-headline-lg text-lg sm:text-xl font-bold text-white tracking-tight uppercase leading-tight group-hover:text-f1-red transition-colors">
              {driver.full_name}
            </h3>
            <p className="text-[11px] text-secondary/90 font-telemetry-sm uppercase tracking-wider">
              {theme.teamFull}
            </p>
          </div>
        </div>

        {/* Seamless Integrated Points Display */}
        <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
          <span className="text-[10px] text-secondary font-telemetry-sm uppercase tracking-widest font-bold">
            PTS
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-racing-num text-3xl sm:text-4xl font-extrabold text-white text-glow-red">
              {driver.points}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
