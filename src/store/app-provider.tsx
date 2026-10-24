/**
 * Global application state.
 *
 * A single context holds every entity the user creates. Writes to disk are
 * debounced so a burst of edits results in one AsyncStorage call.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { loadState, saveState } from '@/store/storage';
import { buildSampleState } from '@/store/sample-data';
import { EMPTY_STATE, type Account, type AppState, type CalendarEvent, type Debt, type ID, type Note, type NoteColor, type NoteFolder, type Task } from '@/store/types';
import { createId } from '@/utils/id';

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt'>;
export type EventInput = Omit<CalendarEvent, 'id' | 'createdAt'>;
export type AccountInput = Pick<Account, 'name' | 'type' | 'color'>;
export type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'settledAt'>;
export type NoteInput = Pick<
  Note,
  'folderId' | 'title' | 'content' | 'color' | 'pinned' | 'archived' | 'boldRanges'
>;
export type NoteFolderInput = Pick<NoteFolder, 'name' | 'color'>;

export interface SnapshotInput {
  month: string;
  cash: number;
  invested: number;
  note?: string;
}

interface AppContextValue {
  state: AppState;
  /** `false` while the persisted state is being read from disk. */
  ready: boolean;

  addTask: (input: TaskInput) => void;
  updateTask: (id: ID, patch: Partial<TaskInput>) => void;
  toggleTask: (id: ID) => void;
  removeTask: (id: ID) => void;

  addEvent: (input: EventInput) => void;
  updateEvent: (id: ID, patch: Partial<EventInput>) => void;
  removeEvent: (id: ID) => void;

  addAccount: (input: AccountInput) => void;
  updateAccount: (id: ID, patch: Partial<AccountInput>) => void;
  removeAccount: (id: ID) => void;
  upsertSnapshot: (accountId: ID, snapshot: SnapshotInput) => void;
  removeSnapshot: (accountId: ID, snapshotId: ID) => void;

  addDebt: (input: DebtInput) => void;
  updateDebt: (id: ID, patch: Partial<DebtInput>) => void;
  removeDebt: (id: ID) => void;

  addNoteFolder: (input: NoteFolderInput) => void;
  updateNoteFolder: (id: ID, patch: Partial<NoteFolderInput>) => void;
  removeNoteFolder: (id: ID) => void;

  addNote: (input: NoteInput) => Note;
  updateNote: (id: ID, patch: Partial<NoteInput>) => void;
  toggleNotePin: (id: ID) => void;
  archiveNote: (id: ID, archived?: boolean) => void;
  removeNote: (id: ID) => void;
  reorderNotes: (orderedIds: ID[]) => void;

  setMonthlyIncome: (value: number) => void;
  setUserName: (value: string) => void;
  loadSampleData: () => void;
  resetAll: () => void;
  replaceState: (next: AppState) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 250;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadState().then((loaded) => {
      if (cancelled) return;
      setState(loaded);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveState(state);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  const addTask = useCallback((input: TaskInput) => {
    setState((previous) => ({
      ...previous,
      tasks: [
        {
          ...input,
          id: createId('task'),
          createdAt: new Date().toISOString(),
          completedAt: input.done ? new Date().toISOString() : undefined,
        },
        ...previous.tasks,
      ],
    }));
  }, []);

  const updateTask = useCallback((id: ID, patch: Partial<TaskInput>) => {
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    }));
  }, []);

  const toggleTask = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => {
        if (task.id !== id) return task;
        const done = !task.done;
        return {
          ...task,
          done,
          completedAt: done ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, []);

  const removeTask = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const addEvent = useCallback((input: EventInput) => {
    setState((previous) => ({
      ...previous,
      events: [
        { ...input, id: createId('evt'), createdAt: new Date().toISOString() },
        ...previous.events,
      ],
    }));
  }, []);

  const updateEvent = useCallback((id: ID, patch: Partial<EventInput>) => {
    setState((previous) => ({
      ...previous,
      events: previous.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    }));
  }, []);

  const removeEvent = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      events: previous.events.filter((event) => event.id !== id),
    }));
  }, []);

  const addAccount = useCallback((input: AccountInput) => {
    setState((previous) => ({
      ...previous,
      accounts: [
        { ...input, id: createId('acc'), createdAt: new Date().toISOString(), snapshots: [] },
        ...previous.accounts,
      ],
    }));
  }, []);

  const updateAccount = useCallback((id: ID, patch: Partial<AccountInput>) => {
    setState((previous) => ({
      ...previous,
      accounts: previous.accounts.map((account) =>
        account.id === id ? { ...account, ...patch } : account,
      ),
    }));
  }, []);

  const removeAccount = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      accounts: previous.accounts.filter((account) => account.id !== id),
    }));
  }, []);

  const upsertSnapshot = useCallback((accountId: ID, snapshot: SnapshotInput) => {
    setState((previous) => ({
      ...previous,
      accounts: previous.accounts.map((account) => {
        if (account.id !== accountId) return account;

        const existing = account.snapshots.find((item) => item.month === snapshot.month);
        const next = existing
          ? { ...existing, cash: snapshot.cash, invested: snapshot.invested, note: snapshot.note }
          : {
              id: createId('snap'),
              month: snapshot.month,
              cash: snapshot.cash,
              invested: snapshot.invested,
              note: snapshot.note,
            };

        const snapshots = existing
          ? account.snapshots.map((item) => (item.month === snapshot.month ? next : item))
          : [...account.snapshots, next];

        return {
          ...account,
          snapshots: [...snapshots].sort((a, b) => (a.month < b.month ? -1 : 1)),
        };
      }),
    }));
  }, []);

  const removeSnapshot = useCallback((accountId: ID, snapshotId: ID) => {
    setState((previous) => ({
      ...previous,
      accounts: previous.accounts.map((account) =>
        account.id === accountId
          ? { ...account, snapshots: account.snapshots.filter((item) => item.id !== snapshotId) }
          : account,
      ),
    }));
  }, []);

  const addDebt = useCallback((input: DebtInput) => {
    setState((previous) => ({
      ...previous,
      debts: [
        { ...input, id: createId('debt'), createdAt: new Date().toISOString() },
        ...previous.debts,
      ],
    }));
  }, []);

  const updateDebt = useCallback((id: ID, patch: Partial<DebtInput>) => {
    setState((previous) => ({
      ...previous,
      debts: previous.debts.map((debt) =>
        debt.id === id ? { ...debt, ...patch, settledAt: patch.settled ? new Date().toISOString() : debt.settledAt } : debt,
      ),
    }));
  }, []);

  const removeDebt = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      debts: previous.debts.filter((debt) => debt.id !== id),
    }));
  }, []);

  const addNoteFolder = useCallback((input: NoteFolderInput) => {
    setState((previous) => ({
      ...previous,
      noteFolders: [
        { ...input, id: createId('folder'), createdAt: new Date().toISOString() },
        ...previous.noteFolders,
      ],
    }));
  }, []);

  const updateNoteFolder = useCallback((id: ID, patch: Partial<NoteFolderInput>) => {
    setState((previous) => ({
      ...previous,
      noteFolders: previous.noteFolders.map((folder) =>
        folder.id === id ? { ...folder, ...patch } : folder,
      ),
    }));
  }, []);

  const removeNoteFolder = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      noteFolders: previous.noteFolders.filter((folder) => folder.id !== id),
      notes: previous.notes.map((note) => (note.folderId === id ? { ...note, folderId: null } : note)),
    }));
  }, []);

  const addNote = useCallback((input: NoteInput): Note => {
    const now = new Date().toISOString();
    const note: Note = {
      ...input,
      id: createId('note'),
      createdAt: now,
      updatedAt: now,
    };
    setState((previous) => ({
      ...previous,
      notes: [note, ...previous.notes],
    }));
    return note;
  }, []);

  const updateNote = useCallback((id: ID, patch: Partial<NoteInput>) => {
    setState((previous) => ({
      ...previous,
      notes: previous.notes.map((note) =>
        note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note,
      ),
    }));
  }, []);

  const toggleNotePin = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      notes: previous.notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note,
      ),
    }));
  }, []);

  const archiveNote = useCallback((id: ID, archived = true) => {
    setState((previous) => ({
      ...previous,
      notes: previous.notes.map((note) =>
        note.id === id ? { ...note, archived, updatedAt: new Date().toISOString() } : note,
      ),
    }));
  }, []);

  const removeNote = useCallback((id: ID) => {
    setState((previous) => ({
      ...previous,
      notes: previous.notes.filter((note) => note.id !== id),
    }));
  }, []);

  const reorderNotes = useCallback((orderedIds: ID[]) => {
    const positions = new Map(orderedIds.map((noteId, index) => [noteId, index]));
    setState((previous) => ({
      ...previous,
      notes: previous.notes.map((note) =>
        positions.has(note.id) ? { ...note, order: positions.get(note.id) } : note,
      ),
    }));
  }, []);

  const setMonthlyIncome = useCallback((value: number) => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, monthlyIncome: Number.isFinite(value) ? value : 0 },
    }));
  }, []);

  const setUserName = useCallback((value: string) => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, userName: value },
    }));
  }, []);

  const loadSampleData = useCallback(() => {
    setState(buildSampleState());
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...EMPTY_STATE });
  }, []);

  const replaceState = useCallback((next: AppState) => {
    setState(next);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      ready,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addEvent,
      updateEvent,
      removeEvent,
      addAccount,
      updateAccount,
      removeAccount,
      upsertSnapshot,
      removeSnapshot,
      addDebt,
      updateDebt,
      removeDebt,
      addNoteFolder,
      updateNoteFolder,
      removeNoteFolder,
      addNote,
      updateNote,
      toggleNotePin,
      archiveNote,
      removeNote,
      reorderNotes,
      setMonthlyIncome,
      setUserName,
      loadSampleData,
      resetAll,
      replaceState,
    }),
    [
      state,
      ready,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addEvent,
      updateEvent,
      removeEvent,
      addAccount,
      updateAccount,
      removeAccount,
      upsertSnapshot,
      removeSnapshot,
      addDebt,
      updateDebt,
      removeDebt,
      addNoteFolder,
      updateNoteFolder,
      removeNoteFolder,
      addNote,
      updateNote,
      toggleNotePin,
      archiveNote,
      removeNote,
      reorderNotes,
      setMonthlyIncome,
      setUserName,
      loadSampleData,
      resetAll,
      replaceState,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an <AppProvider>.');
  }
  return context;
}
