// Team accent colors, used for left-border/badge accents on standings and
// results tables (matches each constructor's real livery color).
export const TEAM_COLORS: Record<string, string> = {
  McLaren: '#FF8000',
  Ferrari: '#E8002D',
  'Red Bull Racing': '#3671C6',
  'Red Bull': '#3671C6',
  Mercedes: '#27F4D2',
  'Aston Martin': '#229971',
  'Alpine F1 Team': '#FF87BC',
  Alpine: '#FF87BC',
  Williams: '#64C4FF',
  'RB F1 Team': '#6692FF',
  'Racing Bulls': '#6692FF',
  'Haas F1 Team': '#B6BABD',
  Haas: '#B6BABD',
  'Kick Sauber': '#52E252',
  Sauber: '#52E252',
};

export const teamColor = (team: string): string => TEAM_COLORS[team] ?? '#ffb4a8';
