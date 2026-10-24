/**
 * Domain model.
 *
 * Everything the user creates lives in these structures. They are plain JSON
 * so they can be serialised to AsyncStorage and exported as a backup file.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type MonthKey = string; // YYYY-MM

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: ID;
  title: string;
  notes?: string;
  done: boolean;
  /** Day the task is due. */
  dueDate?: ISODate;
  priority: Priority;
  createdAt: string;
  completedAt?: string;
}

export type EventKind = 'done' | 'planned';

export interface CalendarEvent {
  id: ID;
  title: string;
  date: ISODate;
  /** Optional `HH:mm`. */
  time?: string;
  /** `done` = something I already did, `planned` = something I have to do. */
  kind: EventKind;
  notes?: string;
  createdAt: string;
}

export type AccountType = 'bank' | 'broker';

/** A balance of a single account for a given month. */
export interface AccountSnapshot {
  id: ID;
  /** Month the balance belongs to. */
  month: MonthKey;
  /** Money available in cash. */
  cash: number;
  /** Money invested in products. */
  invested: number;
  note?: string;
}

export interface Account {
  id: ID;
  name: string;
  type: AccountType;
  color: string;
  createdAt: string;
  snapshots: AccountSnapshot[];
}

export type DebtDirection = 'they_owe_me' | 'i_owe';

export interface Debt {
  id: ID;
  /** What is owed, e.g. `un gorro`. */
  title: string;
  /** `money` debts have an amount, `other` ones are just things to remember. */
  kind: 'money' | 'other';
  amount?: number;
  direction: DebtDirection;
  /** Who it is related to, e.g. `mi amiga Marta`. */
  person?: string;
  dueDate?: ISODate;
  settled: boolean;
  notes?: string;
  createdAt: string;
  settledAt?: string;
}

export type NoteColor =
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'red'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'teal'
  | 'gray';

/** Half-open character range `[start, end)` marked as bold. */
export interface BoldRange {
  start: number;
  end: number;
}

export interface Note {
  id: ID;
  folderId: ID | null;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  /** Portions of `content` shown in bold. Missing on older notes. */
  boldRanges?: BoldRange[];
  /** Position when notes are sorted manually. Lower comes first. */
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: ID;
  name: string;
  color: NoteColor;
  createdAt: string;
}

export interface AppSettings {
  /** Rough monthly income, shown on the home screen. */
  monthlyIncome: number;
  /** Name used to greet the user on the home screen. */
  userName: string;
}

export interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  accounts: Account[];
  debts: Debt[];
  notes: Note[];
  noteFolders: NoteFolder[];
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  monthlyIncome: 0,
  userName: 'Diego',
};

export const EMPTY_STATE: AppState = {
  tasks: [],
  events: [],
  accounts: [],
  debts: [],
  notes: [],
  noteFolders: [],
  settings: DEFAULT_SETTINGS,
};

export const NOTE_COLORS: NoteColor[] = [
  'yellow',
  'orange',
  'pink',
  'red',
  'purple',
  'blue',
  'cyan',
  'green',
  'teal',
  'gray',
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const DEBT_KIND_LABELS: Record<Debt['kind'], string> = {
  money: 'Dinero',
  other: 'Otra cosa',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Banco',
  broker: 'Bróker',
};
