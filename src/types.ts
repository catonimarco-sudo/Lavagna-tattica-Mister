export type PitchViewMode = 
  | 'full_horizontal'
  | 'full_vertical'
  | 'half_attack'
  | 'half_defense'
  | 'attacking_third'
  | 'right_flank'
  | 'left_flank'
  | 'penalty_box';

export type PitchTheme = 'realistic_grass' | 'tactical_green' | 'night_board' | 'chalkboard';

export type ToolMode = 
  | 'select'
  | 'arrow_run'       // Freccia piena corsa
  | 'arrow_pass'      // Freccia tratteggiata passaggio
  | 'arrow_dribble'   // Linea ondulata conduzione
  | 'arrow_curve'     // Freccia curva sovrapposizione
  | 'arrow_press'     // Freccia pressing blocco T
  | 'line_measure'    // Linea dritta
  | 'freehand'        // Disegno libero
  | 'zone_box'        // Evidenziatore zona rettangolo
  | 'zone_circle'     // Evidenziatore cerchio
  | 'text_note'       // Testo su campo
  | 'eraser';         // Gomma

export type EquipmentType = 
  | 'cone'            // Conetto alto
  | 'flat_cone_yellow'// Cinesino giallo
  | 'flat_cone_red'   // Cinesino rosso
  | 'flat_cone_blue'  // Cinesino blu
  | 'flat_cone_orange'// Cinesino arancio
  | 'ball'            // Pallone da calcio
  | 'mini_goal'       // Porticina
  | 'agility_ladder'  // Scaletta
  | 'pole'            // Paletto
  | 'mannequin'       // Sagoma barriera
  | 'hurdle'          // Ostacolo
  | 'hoop';           // Cerchio

export interface Player {
  id: string;
  name: string;
  number: number;
  role: string; // POR, DC, TD, TS, MED, CC, TRQ, ED, ES, ATT, CEN, JOLLY
  team: 'home' | 'away' | 'goalkeeper_home' | 'goalkeeper_away' | 'jolly';
  customColor?: string;
  customTextColor?: string;
  photoUrl?: string; // Data URL or external image URL
  foot?: 'Destro' | 'Sinistro' | 'Ambidestro';
  notes?: string;
  // Position on pitch (percentage 0 to 100)
  x: number;
  y: number;
  rotation?: number; // In degrees (0 to 360) orientation
  visible?: boolean;
}

export interface EquipmentItem {
  id: string;
  type: EquipmentType;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  rotation?: number;
  label?: string;
  scale?: number;
}

export interface Point {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface DrawingElement {
  id: string;
  tool: ToolMode;
  color: string;
  strokeWidth: number;
  points: Point[];
  text?: string;
  fontSize?: number;
  isCompleted?: boolean;
}

export interface TacticalPhase {
  id: string;
  name: string;
  description: string;
  players: Player[];
  equipment: EquipmentItem[];
  drawings: DrawingElement[];
}

export interface ExerciseDrill {
  id: string;
  title: string;
  category: 'Tattica' | 'Tecnica' | 'Possesso Palla' | 'Partitella' | 'Riscaldamento' | 'Palle Inattive' | 'Fisico-Atletico';
  objectivePrimary: string;
  objectiveSecondary: string;
  durationMinutes: number;
  playerCount: string;
  pitchSize: string;
  description: string;
  coachingPoints: string[];
  phases: TacticalPhase[];
  activePhaseIndex: number;
  pitchView: PitchViewMode;
  pitchTheme: PitchTheme;
  showZonesGrid: boolean;
  showPlayerNames: boolean;
  showPlayerNumbers: boolean;
  showPlayerPhotos: boolean;
}

export interface TeamSettings {
  homeTeamName: string;
  homeTeamColor: string;
  homeTeamTextColor: string;
  awayTeamName: string;
  awayTeamColor: string;
  awayTeamTextColor: string;
  gkColor: string;
  jollyColor: string;
}

export interface SyncSessionState {
  roomId: string;
  lastUpdated: number;
  author: string;
  drill: ExerciseDrill;
  roster: Player[];
  teamSettings: TeamSettings;
}
