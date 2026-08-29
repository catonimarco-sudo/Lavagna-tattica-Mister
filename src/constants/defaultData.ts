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
  { id: 'p-1', name: 'Donnarumma G.', number: 1, role: 'POR', team: 'goalkeeper_home', foot: 'Destro', x: 7, y: 50, notes: 'Forte nelle uscite e guida del reparto' },
  { id: 'p-2', name: 'Di Lorenzo G.', number: 2, role: 'TD', team: 'home', foot: 'Destro', x: 25, y: 18, notes: 'Spinta, ampiezza e sovrapposizione' },
  { id: 'p-3', name: 'Bastoni A.', number: 4, role: 'DC', team: 'home', foot: 'Sinistro', x: 22, y: 38, notes: 'Impostazione dal basso e conduzione' },
  { id: 'p-4', name: 'Calafiori R.', number: 5, role: 'DC', team: 'home', foot: 'Sinistro', x: 22, y: 62, notes: 'Anticipo aggressivo e verticalizzazioni' },
  { id: 'p-5', name: 'Dimarco F.', number: 3, role: 'TS', team: 'home', foot: 'Sinistro', x: 25, y: 82, notes: 'Catena laterale, cross e tiro da fuori' },
  { id: 'p-6', name: 'Barella N.', number: 6, role: 'MED', team: 'home', foot: 'Destro', x: 38, y: 38, notes: 'Equilibrio, interdizione e primi passaggi' },
  { id: 'p-7', name: 'Kone M.', number: 8, role: 'MED', team: 'home', foot: 'Destro', x: 38, y: 62, notes: 'Dinamismo, strappi palla al piede e rottura della pressione' },
  { id: 'p-8', name: 'Soulè M.', number: 7, role: 'ED', team: 'home', foot: 'Sinistro', x: 55, y: 18, notes: '1 vs 1 in fascia, rientro sul mancino e visione' },
  { id: 'p-9', name: 'Catoni M.', number: 10, role: 'TRQ', team: 'home', foot: 'Destro', x: 54, y: 50, notes: 'Regia offensiva tra le linee, rifinitura e tiro' },
  { id: 'p-10', name: 'Zaccagni M.', number: 11, role: 'ES', team: 'home', foot: 'Destro', x: 55, y: 82, notes: 'Dribbling verso il centro e attacco dell’area' },
  { id: 'p-11', name: 'Dovbyk A.', number: 9, role: 'ATT', team: 'home', foot: 'Sinistro', x: 74, y: 50, notes: 'Riferimento centrale d’attacco, sponde e profondità' },
  
  // Riserve / Seconda squadra & Jolly
  { id: 'p-12', name: 'Vicario G.', number: 12, role: 'POR', team: 'goalkeeper_away', foot: 'Destro', x: 93, y: 50, notes: 'Reattività tra i pali' },
  { id: 'p-13', name: 'Bellanova R.', number: 13, role: 'TD', team: 'away', foot: 'Destro', x: 75, y: 82, notes: 'Velocità e profondità' },
  { id: 'p-14', name: 'Mancini G.', number: 14, role: 'DC', team: 'away', foot: 'Destro', x: 78, y: 62, notes: 'Marcatura stretta' },
  { id: 'p-15', name: 'Buongiorno A.', number: 15, role: 'DC', team: 'away', foot: 'Sinistro', x: 78, y: 38, notes: 'Fisicità e contrasto' },
  { id: 'p-16', name: 'Udogie D.', number: 16, role: 'TS', team: 'away', foot: 'Sinistro', x: 75, y: 18, notes: 'Fisicità e progressione' },
  { id: 'p-17', name: 'Locatelli M.', number: 17, role: 'MED', team: 'away', foot: 'Destro', x: 60, y: 50, notes: 'Geometrie di centrocampo' },
  { id: 'p-18', name: 'Pellegrini L.', number: 18, role: 'TRQ', team: 'away', foot: 'Destro', x: 55, y: 35, notes: 'Qualità tra le linee e calci da fermo' },
  { id: 'p-19', name: 'Frattesi D.', number: 19, role: 'CC', team: 'away', foot: 'Destro', x: 55, y: 65, notes: 'Inserimenti letali in area' },
  { id: 'p-20', name: 'Retegui M.', number: 20, role: 'ATT', team: 'away', foot: 'Destro', x: 30, y: 50, notes: 'Attacco alla porta e presenza in area' },
  { id: 'p-21', name: 'Raspadori G.', number: 21, role: 'ATT', team: 'jolly', foot: 'Ambidestro', x: 50, y: 50, notes: 'Attaccante di raccordo e Jolly' },
  { id: 'p-22', name: 'Carnesecchi M.', number: 22, role: 'POR', team: 'goalkeeper_away', foot: 'Destro', x: 93, y: 50, notes: 'Portiere reattivo' },
  { id: 'p-23', name: 'Fagioli N.', number: 23, role: 'MED', team: 'away', foot: 'Destro', x: 62, y: 48, notes: 'Visione e pulizia tecnica' },
  { id: 'p-24', name: 'Cambiaso A.', number: 24, role: 'TER', team: 'home', foot: 'Ambidestro', x: 30, y: 20, notes: 'Polivalenza tattica sia a destra che a sinistra' },
];

export const initialPlayers = DEFAULT_ROSTER;
export const defaultPlayers = DEFAULT_ROSTER;
export const INITIAL_PLAYERS = DEFAULT_ROSTER;
export const DEFAULT_PLAYERS = DEFAULT_ROSTER;

export const INITIAL_PHASE_1: TacticalPhase = {
  id: 'phase-1',
  name: 'Fase 1: Costruzione & Sviluppo per Reparti',
  description: 'Costruzione con i centrali Bastoni e Calafiori, mediana di regia con Barella e Kone M., rifinitura sulla trequarti affidata a Catoni M., Soulè M. e Zaccagni.',
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
      strokeWidth: 2.5,
      points: [{ x: 22, y: 38 }, { x: 38, y: 62 }],
      isCompleted: true,
    },
    {
      id: 'draw-2',
      tool: 'arrow_pass',
      color: '#38bdf8',
      strokeWidth: 2.5,
      points: [{ x: 38, y: 62 }, { x: 54, y: 50 }],
      isCompleted: true,
    },
    {
      id: 'draw-3',
      tool: 'arrow_run',
      color: '#fbbf24',
      strokeWidth: 2.5,
      points: [{ x: 55, y: 18 }, { x: 68, y: 28 }],
      isCompleted: true,
    }
  ],
};

export const INITIAL_PHASE_2: TacticalPhase = {
  id: 'phase-2',
  name: 'Fase 2: Rifinitura Catoni M. & Taglio Soulè M.',
  description: 'Catoni M. riceve tra le linee, orienta verso la porta e imbuca per il taglio di Soulè M. e l’attacco al primo palo di Dovbyk A.',
  players: DEFAULT_ROSTER.slice(0, 11).map(p => {
    if (p.id === 'p-5') return { ...p, x: 62, y: 88 };
    if (p.id === 'p-10') return { ...p, x: 74, y: 76 };
    if (p.id === 'p-11') return { ...p, x: 86, y: 48 };
    if (p.id === 'p-9') return { ...p, x: 68, y: 50 }; // Catoni M. avanza
    if (p.id === 'p-8') return { ...p, x: 75, y: 30 }; // Soulè M. taglia dentro
    if (p.id === 'p-7') return { ...p, x: 50, y: 60 }; // Kone M. sostiene
    if (p.id === 'p-6') return { ...p, x: 46, y: 40 }; // Barella N.
    return p;
  }),
  equipment: [
    { id: 'eq-1', type: 'ball', x: 68, y: 50 },
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
      strokeWidth: 2.5,
      points: [{ x: 68, y: 50 }, { x: 75, y: 30 }],
      isCompleted: true,
    },
    {
      id: 'draw-5',
      tool: 'arrow_curve',
      color: '#fbbf24',
      strokeWidth: 2.5,
      points: [{ x: 75, y: 30 }, { x: 84, y: 38 }, { x: 88, y: 48 }],
      isCompleted: true,
    }
  ],
};

export const DEFAULT_DRILL: ExerciseDrill = {
  id: 'drill-default-1',
  title: 'Costruzione Tattica e Sviluppo per Reparti (4-2-3-1)',
  category: 'Tattica',
  objectivePrimary: 'Mantenimento delle distanze di reparto tra linea difensiva (2-4-5-3), mediana (6-8) e trequarti (7-10-11)',
  objectiveSecondary: 'Rifinitura con Catoni M. tra le linee e supporto sulle corsie di Soulè M. e Dimarco F.',
  durationMinutes: 20,
  playerCount: '11 vs 0 (poi 11 vs 8)',
  pitchSize: 'Campo Intero / 3/4 di campo',
  description: 'La palla parte dal portiere o dalla linea difensiva. Si attiva il doppio perno centrale (Barella-Kone M.) per superare la prima linea di pressione e verticalizzare sul trequartista Catoni M., innescando la rifinitura per Soulè M. e Dovbyk A.',
  coachingPoints: [
    'Linea difensiva compatta e scaglionata per impedire imbucate centrali',
    'Doppio perno di centrocampo sempre in diagonale di sostegno',
    'Catoni M. riceve tra le linee con orientamento posturale verso la porta',
    'Attacco simultaneo del primo palo e dello spazio a rimorchio'
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
  showRepartoLines: true,
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
