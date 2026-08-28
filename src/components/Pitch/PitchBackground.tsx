import React from 'react';
import { PitchTheme, PitchViewMode } from '../../types';

interface PitchBackgroundProps {
  viewMode: PitchViewMode;
  theme: PitchTheme;
  showZonesGrid?: boolean;
}

export const PitchBackground: React.FC<PitchBackgroundProps> = ({
  viewMode,
  theme,
  showZonesGrid = false,
}) => {
  // Theme styling definitions
  const getThemeStyles = () => {
    switch (theme) {
      case 'tactical_green':
        return {
          baseColor: '#1e5428',
          stripeColor: '#174720',
          lineColor: '#ffffff',
          lineOpacity: 0.9,
          zoneColor: 'rgba(255, 255, 255, 0.08)',
          zoneBorderColor: 'rgba(255, 255, 255, 0.25)',
        };
      case 'night_board':
        return {
          baseColor: '#0f172a',
          stripeColor: '#1e293b',
          lineColor: '#38bdf8',
          lineOpacity: 0.85,
          zoneColor: 'rgba(56, 189, 248, 0.05)',
          zoneBorderColor: 'rgba(56, 189, 248, 0.25)',
        };
      case 'chalkboard':
        return {
          baseColor: '#1c2826',
          stripeColor: '#16201e',
          lineColor: '#f1f5f9',
          lineOpacity: 0.8,
          zoneColor: 'rgba(241, 245, 249, 0.06)',
          zoneBorderColor: 'rgba(241, 245, 249, 0.2)',
        };
      case 'realistic_grass':
      default:
        return {
          baseColor: '#23652c',
          stripeColor: '#1c5424',
          lineColor: '#ffffff',
          lineOpacity: 0.95,
          zoneColor: 'rgba(255, 255, 255, 0.07)',
          zoneBorderColor: 'rgba(255, 255, 255, 0.28)',
        };
    }
  };

  const styles = getThemeStyles();

  // SVG viewBox settings based on view mode (base coordinate space: 0 0 1000 650)
  const getViewBox = () => {
    switch (viewMode) {
      case 'half_attack':
        return '490 0 510 650'; // Right half (attacco)
      case 'half_defense':
        return '0 0 510 650'; // Left half (difesa)
      case 'attacking_third':
        return '650 0 350 650'; // Final third
      case 'right_flank':
        return '0 360 1000 290'; // Right lateral channel (bottom half)
      case 'left_flank':
        return '0 0 1000 290'; // Left lateral channel (top half)
      case 'penalty_box':
        return '780 120 220 410'; // Penalty box close-up
      case 'full_vertical':
        return '0 0 650 1000';
      case 'full_horizontal':
      default:
        return '0 0 1000 650';
    }
  };

  const isVertical = viewMode === 'full_vertical';
  const width = isVertical ? 650 : 1000;
  const height = isVertical ? 1000 : 650;
  const marginX = isVertical ? 35 : 45;
  const marginY = isVertical ? 45 : 35;
  const pitchW = width - (marginX * 2);
  const pitchH = height - (marginY * 2);

  // Field dimensions relative to standard 1000x650
  // Standard full horizontal pitch coordinates:
  // Left: 45, Right: 955, Top: 35, Bottom: 615
  // Pitch width = 910, Pitch height = 580
  // Center X = 500, Center Y = 325

  return (
    <svg
      id="tactical-pitch-svg"
      viewBox={getViewBox()}
      preserveAspectRatio="none"
      className="w-full h-full select-none pointer-events-none transition-all duration-300"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Grass Pattern / Texture */}
        <pattern id="grass-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={styles.baseColor} />
          <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.03)" />
          <circle cx="7" cy="7" r="0.5" fill="rgba(0,0,0,0.04)" />
        </pattern>
        
        {/* Subtle Pitch Outer Shadow */}
        <filter id="pitch-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* 1. Main Background */}
      <rect x="0" y="0" width={width} height={height} fill="url(#grass-pattern)" />

      {/* 2. Alternating Grass Stripes (Lawn Mower stripes) */}
      {!isVertical ? (
        <g opacity="0.95">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((idx) => {
            const stripeWidth = pitchW / 14;
            const xPos = marginX + (idx * stripeWidth);
            if (idx % 2 === 1) {
              return (
                <rect
                  key={`stripe-${idx}`}
                  x={xPos}
                  y={marginY}
                  width={stripeWidth}
                  height={pitchH}
                  fill={styles.stripeColor}
                />
              );
            }
            return null;
          })}
        </g>
      ) : (
        <g opacity="0.95">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((idx) => {
            const stripeHeight = pitchH / 14;
            const yPos = marginY + (idx * stripeHeight);
            if (idx % 2 === 1) {
              return (
                <rect
                  key={`vstripe-${idx}`}
                  x={marginX}
                  y={yPos}
                  width={pitchW}
                  height={stripeHeight}
                  fill={styles.stripeColor}
                />
              );
            }
            return null;
          })}
        </g>
      )}

      {/* 3. Tactical Zones Grid / 5 Corridors & Half-Spaces (if active) */}
      {showZonesGrid && !isVertical && (
        <g className="tactical-zones-layer">
          {/* 5 Vertical Pitch Channels (Corridoio Sinistro, Half-Space Sx, Corridoio Centrale, Half-Space Dx, Corridoio Dx) */}
          {/* Y splits: 35, 151, 267, 383, 499, 615 */}
          <rect x={45} y={35} width={910} height={116} fill={styles.zoneColor} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <rect x={45} y={151} width={910} height={116} fill="none" stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <rect x={45} y={267} width={910} height={116} fill={styles.zoneColor} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <rect x={45} y={383} width={910} height={116} fill="none" stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <rect x={45} y={499} width={910} height={116} fill={styles.zoneColor} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />

          {/* Longitudinal Pitch Divisions (Difesa, Costruzione, Rifinitura / Trequarti, Finalizzazione) */}
          <line x1={227} y1={35} x2={227} y2={615} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <line x1={363} y1={35} x2={363} y2={615} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <line x1={637} y1={35} x2={637} y2={615} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />
          <line x1={773} y1={35} x2={773} y2={615} stroke={styles.zoneBorderColor} strokeDasharray="6,6" strokeWidth="1.5" />

          {/* Zone Labels */}
          <text x={95} y={60} fill="rgba(255,255,255,0.4)" fontSize="13" fontWeight="bold">Fascia Sx</text>
          <text x={95} y={180} fill="rgba(255,255,255,0.4)" fontSize="13" fontWeight="bold">Half-Space Sx</text>
          <text x={95} y={330} fill="rgba(255,255,255,0.4)" fontSize="13" fontWeight="bold">Centro</text>
          <text x={95} y={445} fill="rgba(255,255,255,0.4)" fontSize="13" fontWeight="bold">Half-Space Dx</text>
          <text x={95} y={560} fill="rgba(255,255,255,0.4)" fontSize="13" fontWeight="bold">Fascia Dx</text>
          <text x={705} y={330} fill="rgba(255,255,255,0.4)" fontSize="14" fontWeight="bold" textAnchor="middle">Trequarti Offensiva</text>
        </g>
      )}

      {/* 4. Official Soccer Pitch Markings (Horizontal) */}
      {!isVertical && (
        <g stroke={styles.lineColor} strokeWidth="3" fill="none" strokeOpacity={styles.lineOpacity} strokeLinecap="square">
          {/* Pitch Outer Boundary Line */}
          <rect x={45} y={35} width={910} height={580} />

          {/* Halfway Line */}
          <line x1={500} y1={35} x2={500} y2={615} />

          {/* Center Circle (Radius 80) */}
          <circle cx={500} cy={325} r={80} />

          {/* Center Spot */}
          <circle cx={500} cy={325} r={3.5} fill={styles.lineColor} />

          {/* --- LEFT SIDE (HOME / DEFENSE) --- */}
          {/* Left Penalty Area (Width 140, Height 330, Y: 160 to 490) */}
          <rect x={45} y={160} width={140} height={330} />

          {/* Left Goal Area / 6-Yard Box (Width 50, Height 160, Y: 245 to 405) */}
          <rect x={45} y={245} width={50} height={160} />

          {/* Left Penalty Spot (100px from goal line) */}
          <circle cx={145} cy={325} r={3.5} fill={styles.lineColor} />

          {/* Left Penalty Arc (D-box) */}
          <path d="M 185 260 A 80 80 0 0 1 185 390" />

          {/* Left Goal (Net & Posts) */}
          <rect x={20} y={285} width={25} height={80} stroke={styles.lineColor} strokeWidth="2.5" fill="rgba(255,255,255,0.08)" />

          {/* --- RIGHT SIDE (AWAY / ATTACK) --- */}
          {/* Right Penalty Area */}
          <rect x={815} y={160} width={140} height={330} />

          {/* Right Goal Area / 6-Yard Box */}
          <rect x={905} y={245} width={50} height={160} />

          {/* Right Penalty Spot */}
          <circle cx={855} cy={325} r={3.5} fill={styles.lineColor} />

          {/* Right Penalty Arc (D-box) */}
          <path d="M 815 260 A 80 80 0 0 0 815 390" />

          {/* Right Goal (Net & Posts) */}
          <rect x={955} y={285} width={25} height={80} stroke={styles.lineColor} strokeWidth="2.5" fill="rgba(255,255,255,0.08)" />

          {/* --- CORNER ARCS --- */}
          {/* Top-Left */}
          <path d="M 45 50 A 15 15 0 0 0 60 35" />
          {/* Bottom-Left */}
          <path d="M 45 600 A 15 15 0 0 1 60 615" />
          {/* Top-Right */}
          <path d="M 940 35 A 15 15 0 0 0 955 50" />
          {/* Bottom-Right */}
          <path d="M 940 615 A 15 15 0 0 1 955 600" />
        </g>
      )}

      {/* Vertical Markings (If vertical mode) */}
      {isVertical && (
        <g stroke={styles.lineColor} strokeWidth="3" fill="none" strokeOpacity={styles.lineOpacity} strokeLinecap="square">
          <rect x={35} y={45} width={580} height={910} />
          <line x1={35} y1={500} x2={615} y2={500} />
          <circle cx={325} cy={500} r={80} />
          <circle cx={325} cy={500} r={3.5} fill={styles.lineColor} />

          {/* Top Penalty Area */}
          <rect x={160} y={45} width={330} height={140} />
          <rect x={245} y={45} width={160} height={50} />
          <circle cx={325} cy={145} r={3.5} fill={styles.lineColor} />
          <path d="M 260 185 A 80 80 0 0 0 390 185" />
          <rect x={285} y={20} width={80} height={25} stroke={styles.lineColor} strokeWidth="2.5" fill="rgba(255,255,255,0.08)" />

          {/* Bottom Penalty Area */}
          <rect x={160} y={815} width={330} height={140} />
          <rect x={245} y={905} width={160} height={50} />
          <circle cx={325} cy={855} r={3.5} fill={styles.lineColor} />
          <path d="M 260 815 A 80 80 0 0 1 390 815" />
          <rect x={285} y={955} width={80} height={25} stroke={styles.lineColor} strokeWidth="2.5" fill="rgba(255,255,255,0.08)" />
        </g>
      )}
    </svg>
  );
};
