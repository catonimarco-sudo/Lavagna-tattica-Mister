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

    // Grouping by tactical roles
    const defenseRoles = ['TD', 'DC', 'TS', 'DIF', 'TER'];
    const lowMidfieldRoles = ['MED'];
    const highMidfieldRoles = ['TRQ', 'ED', 'ES', 'ALA'];
    const centralMidfieldRoles = ['CC', 'CEN'];
    const attackRoles = ['ATT', 'PUN'];

    const defs = teamPlayers.filter((p) => defenseRoles.includes(p.role.toUpperCase()));
    const lowMids = teamPlayers.filter((p) => lowMidfieldRoles.includes(p.role.toUpperCase()));
    const highMids = teamPlayers.filter((p) => highMidfieldRoles.includes(p.role.toUpperCase()));
    const centerMids = teamPlayers.filter((p) => centralMidfieldRoles.includes(p.role.toUpperCase()));
    const atts = teamPlayers.filter((p) => attackRoles.includes(p.role.toUpperCase()));

    const units: Player[][] = [];

    // Sort function for a line: along pitch lateral width
    const sortLateral = (list: Player[]) => {
      return [...list].sort((a, b) => (isVertical ? a.x - b.x : a.y - b.y));
    };

    if (defs.length >= 2) units.push(sortLateral(defs));
    
    // Low midfield (e.g. double pivot / MED)
    if (lowMids.length >= 2) {
      units.push(sortLateral(lowMids));
    } else if (lowMids.length === 1 && centerMids.length >= 1) {
      units.push(sortLateral([...lowMids, ...centerMids]));
    } else if (centerMids.length >= 2 && highMids.length === 0) {
      units.push(sortLateral(centerMids));
    }

    // High midfield / Trequarti / Ali (e.g. 7, 10, 11)
    if (highMids.length >= 2) {
      units.push(sortLateral(highMids));
    } else if (highMids.length === 1 && centerMids.length >= 1) {
      units.push(sortLateral([...highMids, ...centerMids]));
    }

    if (atts.length >= 2) units.push(sortLateral(atts));

    // Fallback: If roles are customized or missing, cluster by pitch depth (x in horizontal, y in vertical)
    if (units.length === 0) {
      const sortedByDepth = [...teamPlayers].sort((a, b) =>
        isVertical ? a.y - b.y : a.x - b.x
      );
      
      const clusters: Player[][] = [];
      let currentCluster: Player[] = [];

      sortedByDepth.forEach((p) => {
        const depthVal = isVertical ? p.y : p.x;
        if (currentCluster.length === 0) {
          currentCluster.push(p);
        } else {
          const firstDepth = isVertical ? currentCluster[0].y : currentCluster[0].x;
          if (Math.abs(depthVal - firstDepth) <= 12) {
            currentCluster.push(p);
          } else {
            if (currentCluster.length >= 2) clusters.push(sortLateral(currentCluster));
            currentCluster = [p];
          }
        }
      });
      if (currentCluster.length >= 2) clusters.push(sortLateral(currentCluster));
      units.push(...clusters);
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
