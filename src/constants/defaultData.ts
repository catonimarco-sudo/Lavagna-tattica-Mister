import { ExerciseDrill, Player, TeamSettings, TacticalPhase } from '../types';

export const DEFAULT_TEAM_SETTINGS: TeamSettings = {
  homeTeamName: 'Squadra Blu',
  homeTeamColor: '#1e40af', // Deep Royal Blue
  homeTeamTextColor: '#ffffff',
  awayTeamName: 'Squadra Rossa',
  awayTeamColor: '#dc2626', // Bright Crimson Red
  awayTeamTextColor: '#ffffff',
  gkColor: '#eab308', // Yellow
  jollyColor: '#16a34a', // Green Jolly
};

export const DEFAULT_ROSTER: Player[] = [
  { id: 'p-1', name: 'Donnarumma G.', number: 1, role: 'POR', team: 'goalkeeper_home', foot: 'Destro', x: 7, y: 50, notes: 'Forte nelle uscite' },
  { id: 'p-2', name: 'Di Lorenzo G.', number: 2, role: 'TD', team: 'home', foot: 'Destro', x: 25, y: 18, notes: 'Spinta e sovrapposizione' },
  { id: 'p-3', name: 'Bastoni A.', number: 3, role: 'DC', team: 'home', foot: 'Sinistro', x: 22, y: 38, notes: 'Impostazione dal basso' },
  { id: 'p-4', name: 'Calafiori R.', number: 4, role: 'DC', team: 'home', foot: 'Sinistro', x: 22, y: 62, notes: 'Anticipo aggressivo' },
  { id: 'p-5', name: 'Dimarco F.', number: 5, role: 'TS', team: 'home', foot: 'Sinistro', x: 25, y: 82, notes: 'Cross e tiro da fuori' },
  { id: 'p-6', name: 'Barella N.', number: 6, role: 'CC', team: 'home', foot: 'Destro', x: 45, y: 32, notes: 'Inserimenti senza palla' },
  { id: 'p-7', name: 'Jorginho F.', number: 8, role: 'MED', team: 'home', foot: 'Destro', x: 38, y: 50, notes: 'Regia e tempi di gioco' },
  { id: 'p-8', name: 'Frattesi D.', number: 7, role: 'CC', team: 'home', foot: 'Destro', x: 45, y: 68, notes: 'Goleador incursore' },
  { id: 'p-9', name: 'Chiesa F.', number: 10, role: 'ED', team: 'home', foot: 'Destro', x: 70, y: 20, notes: '1 vs 1 e profondità' },
  { id: 'p-10', name: 'Scamacca G.', number: 9, role: 'ATT', team: 'home', foot: 'Destro', x: 75, y: 50, notes: 'Riferimento centrale e sponde' },
  { id: 'p-11', name: 'Zaccagni M.', number: 11, role: 'ES', team: 'home', foot: 'Destro', x: 70, y: 80, notes: 'Dribbling verso il centro' },
  
  // Riserve / Seconda squadra
  { id: 'p-12', name: 'Vicario G.', number: 12, role: 'POR', team: 'goalkeeper_away', foot: 'Destro', x: 93, y: 50, notes: 'Reattività tra i pali' },
  { id: 'p-13', name: 'Bellanova R.', number: 13, role: 'TD', team: 'away', foot: 'Destro', x: 75, y: 82 },
  { id: 'p-14', name: 'Mancini G.', number: 14, role: 'DC', team: 'away', foot: 'Destro', x: 78, y: 62 },
  { id: 'p-15', name: 'Buongiorno A.', number: 15, role: 'DC', team: 'away', foot: 'Sinistro', x: 78, y: 38 },
  { id: 'p-16', name: 'Udogie D.', number: 16, role: 'TS', team: 'away', foot: 'Sinistro', x: 75, y: 18 },
  { id: 'p-17', name: 'Locatelli M.', number: 17, role: 'MED', team: 'away', foot: 'Destro', x: 60, y: 50 },
  { id: 'p-18', name: 'Pellegrini L.', number: 18, role: 'TRQ', team: 'away', foot: 'Destro', x: 55, y: 35 },
  { id: 'p-19', name: 'Cristante B.', number: 19, role: 'CC', team: 'away', foot: 'Destro', x: 55, y: 65 },
  { id: 'p-20', name: 'Retegui M.', number: 20, role: 'ATT', team: 'away', foot: 'Destro', x: 30, y: 50 },
  { id: 'p-21', name: 'Raspadori G.', number: 21, role: 'ATT', team: 'jolly', foot: 'Ambidestro', x: 50, y: 50 },
];

export const INITIAL_PHASE_1: TacticalPhase = {
  id: 'phase-1',
  name: 'Fase 1: Costruzione & Sviluppo',
  description: 'Costruzione dal basso con i 2 centrali larghi, terzini alti sulla linea laterale e vertice basso di centrocampo in appoggio.',
  players: DEFAULT_ROSTER.slice(0, 11),
  equipment: [
    { id: 'eq-1', type: 'ball', x: 23, y: 39 },
    { id: 'eq-2', type: 'flat_cone_yellow', x: 35, y: 25 },
    { id: 'eq-3', type: 'flat_cone_yellow', x: 35, y: 75 },
    { id: 'eq-4', type: 'flat_cone_red', x: 60, y: 25 },
    { id: 'eq-5', type: 'flat_cone_red', x: 60, y: 75 },
    { id: 'eq-6', type: 'cone', x: 45, y: 5 },
    { id: 'eq-7', type: 'cone', x: 45, y: 95 },
  ],
  drawings: [
    {
      id: 'draw-1',
      tool: 'arrow_pass',
      color: '#ffffff',
      strokeWidth: 3,
      points: [{ x: 22, y: 38 }, { x: 38, y: 50 }],
      isCompleted: true,
    },
    {
      id: 'draw-2',
      tool: 'arrow_run',
      color: '#38bdf8',
      strokeWidth: 3,
      points: [{ x: 25, y: 82 }, { x: 48, y: 88 }],
      isCompleted: true,
    },
    {
      id: 'draw-3',
      tool: 'arrow_run',
      color: '#38bdf8',
      strokeWidth: 3,
      points: [{ x: 45, y: 68 }, { x: 62, y: 65 }],
      isCompleted: true,
    }
  ],
};

export const INITIAL_PHASE_2: TacticalPhase = {
  id: 'phase-2',
  name: 'Fase 2: Finalizzazione & Taglio',
  description: 'Scarico sulla fascia con sovrapposizione del terzino sinistro e taglio verso il primo palo della punta centrale.',
  players: DEFAULT_ROSTER.slice(0, 11).map(p => {
    if (p.id === 'p-5') return { ...p, x: 68, y: 88 };
    if (p.id === 'p-11') return { ...p, x: 74, y: 70 };
    if (p.id === 'p-10') return { ...p, x: 86, y: 46 };
    if (p.id === 'p-8') return { ...p, x: 76, y: 58 };
    if (p.id === 'p-9') return { ...p, x: 82, y: 22 };
    if (p.id === 'p-7') return { ...p, x: 55, y: 52 };
    return p;
  }),
  equipment: [
    { id: 'eq-1', type: 'ball', x: 69, y: 87 },
    { id: 'eq-2', type: 'flat_cone_yellow', x: 35, y: 25 },
    { id: 'eq-3', type: 'flat_cone_yellow', x: 35, y: 75 },
    { id: 'eq-4', type: 'flat_cone_red', x: 60, y: 25 },
    { id: 'eq-5', type: 'flat_cone_red', x: 60, y: 75 },
    { id: 'eq-6', type: 'cone', x: 45, y: 5 },
    { id: 'eq-7', type: 'cone', x: 45, y: 95 },
  ],
  drawings: [
    {
      id: 'draw-4',
      tool: 'arrow_pass',
      color: '#ffffff',
      strokeWidth: 3,
      points: [{ x: 69, y: 87 }, { x: 86, y: 46 }],
      isCompleted: true,
    },
    {
      id: 'draw-5',
      tool: 'arrow_curve',
      color: '#fbbf24',
      strokeWidth: 3,
      points: [{ x: 82, y: 22 }, { x: 88, y: 38 }, { x: 92, y: 48 }],
      isCompleted: true,
    }
  ],
};

export const DEFAULT_DRILL: ExerciseDrill = {
  id: 'drill-default-1',
  title: 'Costruzione dal Basso e Sovrapposizione Laterale',
  category: 'Tattica',
  objectivePrimary: 'Superamento della prima linea di pressione avversaria tramite catena laterale',
  objectiveSecondary: 'Tempi di inserimento del centrocampista e cross in area di rigore',
  durationMinutes: 20,
  playerCount: '11 vs 0 (poi 11 vs 8)',
  pitchSize: 'Campo Intero / 3/4 di campo',
  description: 'La palla parte dal portiere o dal difensore centrale. Si ricerca la superiorità numerica sul lato forte attirando la pressione e attaccando lo spazio libero alle spalle della difesa.',
  coachingPoints: [
    'Ricezione orientata verso avanti dei difensori centrali',
    'Terzini sempre aperti a dare massima ampiezza prima della ricezione',
    'Vertice basso in costante movimento per offrire linea di passaggio pulita',
    'Attacco alla profondità con tempi precisi (evitare il fuorigioco)'
  ],
  phases: [INITIAL_PHASE_1, INITIAL_PHASE_2],
  activePhaseIndex: 0,
  pitchView: 'full_horizontal',
  pitchTheme: 'realistic_grass',
  showZonesGrid: false,
  showPlayerNames: true,
  showPlayerNumbers: true,
  showPlayerPhotos: true,
  playerRenderMode: 'jersey',
  showRepartoLines: false,
  repartoLineColor: '#ef4444',
};

export const FORMATIONS_PRESETS: { [key: string]: { name: string; positions: { role: string; x: number; y: number }[] } } = {
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'TD', x: 22, y: 15 },
      { role: 'DC', x: 18, y: 38 },
      { role: 'DC', x: 18, y: 62 },
      { role: 'TS', x: 22, y: 85 },
      { role: 'MED', x: 32, y: 50 },
      { role: 'CC', x: 42, y: 32 },
      { role: 'CC', x: 42, y: 68 },
      { role: 'ED', x: 68, y: 18 },
      { role: 'ATT', x: 74, y: 50 },
      { role: 'ES', x: 68, y: 82 },
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'TD', x: 22, y: 15 },
      { role: 'DC', x: 18, y: 38 },
      { role: 'DC', x: 18, y: 62 },
      { role: 'TS', x: 22, y: 85 },
      { role: 'MED', x: 34, y: 38 },
      { role: 'MED', x: 34, y: 62 },
      { role: 'TRQ', x: 52, y: 50 },
      { role: 'ED', x: 55, y: 18 },
      { role: 'ES', x: 55, y: 82 },
      { role: 'ATT', x: 74, y: 50 },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'DC', x: 18, y: 28 },
      { role: 'DC', x: 16, y: 50 },
      { role: 'DC', x: 18, y: 72 },
      { role: 'ED', x: 42, y: 12 },
      { role: 'MED', x: 34, y: 50 },
      { role: 'CC', x: 44, y: 35 },
      { role: 'CC', x: 44, y: 65 },
      { role: 'ES', x: 42, y: 88 },
      { role: 'ATT', x: 72, y: 38 },
      { role: 'ATT', x: 72, y: 62 },
    ]
  },
  '4-4-2': {
    name: '4-4-2 Classico',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'TD', x: 22, y: 15 },
      { role: 'DC', x: 18, y: 38 },
      { role: 'DC', x: 18, y: 62 },
      { role: 'TS', x: 22, y: 85 },
      { role: 'ED', x: 48, y: 15 },
      { role: 'CC', x: 40, y: 38 },
      { role: 'CC', x: 40, y: 62 },
      { role: 'ES', x: 48, y: 85 },
      { role: 'ATT', x: 72, y: 40 },
      { role: 'ATT', x: 72, y: 60 },
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'DC', x: 18, y: 28 },
      { role: 'DC', x: 16, y: 50 },
      { role: 'DC', x: 18, y: 72 },
      { role: 'ED', x: 42, y: 15 },
      { role: 'CC', x: 38, y: 38 },
      { role: 'CC', x: 38, y: 62 },
      { role: 'ES', x: 42, y: 85 },
      { role: 'ED', x: 68, y: 20 },
      { role: 'ATT', x: 74, y: 50 },
      { role: 'ES', x: 68, y: 80 },
    ]
  },
  '4-3-1-2': {
    name: '4-3-1-2 (Rombo)',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'TD', x: 22, y: 15 },
      { role: 'DC', x: 18, y: 38 },
      { role: 'DC', x: 18, y: 62 },
      { role: 'TS', x: 22, y: 85 },
      { role: 'MED', x: 32, y: 50 },
      { role: 'CC', x: 42, y: 32 },
      { role: 'CC', x: 42, y: 68 },
      { role: 'TRQ', x: 55, y: 50 },
      { role: 'ATT', x: 72, y: 38 },
      { role: 'ATT', x: 72, y: 62 },
    ]
  },
  '5-3-2': {
    name: '5-3-2 (Blocco Basso)',
    positions: [
      { role: 'POR', x: 6, y: 50 },
      { role: 'TD', x: 20, y: 10 },
      { role: 'DC', x: 16, y: 30 },
      { role: 'DC', x: 14, y: 50 },
      { role: 'DC', x: 16, y: 70 },
      { role: 'TS', x: 20, y: 90 },
      { role: 'MED', x: 30, y: 50 },
      { role: 'CC', x: 36, y: 32 },
      { role: 'CC', x: 36, y: 68 },
      { role: 'ATT', x: 68, y: 40 },
      { role: 'ATT', x: 68, y: 60 },
    ]
  }
};
