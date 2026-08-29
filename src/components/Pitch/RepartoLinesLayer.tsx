import React from 'react';
import { Player, PitchViewMode } from '../../types';

interface RepartoLinesLayerProps {
  players: Player[];
  lineColor?: string;
  strokeWidth?: number;
  viewMode?: PitchViewMode;
}

export const RepartoLinesLayer: React.FC<RepartoLinesLayerProps> = ({
  players,
  lineColor = '#ef4444',
  strokeWidth = 3,
  viewMode = 'full_horizontal',
}) => {
  if (!players || players.length === 0) return null;

  // Filter outfield players of primary team (home and away separately)
  const homeOutfield = players.filter((p) => p.team === 'home');
  const awayOutfield = players.filter((p) => p.team === 'away');

  // Helper to split a group of players into defense, midfield, attack based on role or spatial coordinate
  const buildTacticalUnits = (teamPlayers: Player[]) => {
    if (teamPlayers.length < 2) return [];

    const isVertical = viewMode === 'full_vertical';

    // Categorize by standard role names if present, or partition by primary axis
    const defenseRoles = ['TD', 'DC', 'TS', 'DIF', 'TER'];
    const midfieldRoles = ['MED', 'CC', 'TRQ', 'ED', 'ES', 'CEN'];
    const attackRoles = ['ATT', 'PUN', 'ALA'];

    const defs = teamPlayers.filter((p) => defenseRoles.includes(p.role.toUpperCase()));
    const mids = teamPlayers.filter((p) => midfieldRoles.includes(p.role.toUpperCase()));
    const atts = teamPlayers.filter((p) => attackRoles.includes(p.role.toUpperCase()));

    const units: Player[][] = [];

    // Sort function for a line: along pitch width
    const sortLateral = (list: Player[]) => {
      return [...list].sort((a, b) => (isVertical ? a.x - b.x : a.y - b.y));
    };

    if (defs.length >= 2) units.push(sortLateral(defs));
    if (mids.length >= 2) units.push(sortLateral(mids));
    if (atts.length >= 2) units.push(sortLateral(atts));

    // Fallback: If roles are not standard, cluster by depth
    if (units.length === 0) {
      const sortedByDepth = [...teamPlayers].sort((a, b) =>
        isVertical ? a.y - b.y : a.x - b.x
      );
      if (sortedByDepth.length >= 4) {
        units.push(sortLateral(sortedByDepth.slice(0, Math.ceil(sortedByDepth.length / 2))));
        units.push(sortLateral(sortedByDepth.slice(Math.ceil(sortedByDepth.length / 2))));
      } else if (sortedByDepth.length >= 2) {
        units.push(sortLateral(sortedByDepth));
      }
    }

    return units;
  };

  const homeUnits = buildTacticalUnits(homeOutfield);
  const awayUnits = buildTacticalUnits(awayOutfield);
  const allUnits = [...homeUnits, ...awayUnits];

  if (allUnits.length === 0) return null;

  return (
    <svg
      id="tactical-reparto-lines-layer"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-15"
    >
      <defs>
        <filter id="reparto-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {allUnits.map((unit, unitIdx) => {
        if (unit.length < 2) return null;

        // Construct polyline points
        const pointsStr = unit.map((p) => `${p.x},${p.y}`).join(' ');

        return (
          <g key={`unit-line-${unitIdx}`} filter="url(#reparto-glow)">
            {/* Background contrast outline */}
            <polyline
              points={pointsStr}
              fill="none"
              stroke="#0f172a"
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {/* Main high-visibility tactical line */}
            <polyline
              points={pointsStr}
              fill="none"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="none"
            />

            {/* Anchor node rings on each connected player */}
            {unit.map((p) => (
              <circle
                key={`node-${p.id}`}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={strokeWidth * 0.9}
                fill={lineColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
