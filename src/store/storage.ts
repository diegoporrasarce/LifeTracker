/**
 * Persistence layer.
 *
 * The whole state is stored as a single JSON document under one key. Writes
 * are debounced by the provider, and a corrupt payload never breaks the app:
 * it is simply ignored and the user starts from an empty state.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, EMPTY_STATE, type AppState } from '@/store/types';

const STORAGE_KEY = 'lifetracker:v1:state';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Coerces an arbitrary parsed payload into a valid state. */
export function normaliseState(payload: unknown): AppState {
  if (!isRecord(payload)) return { ...EMPTY_STATE };

  const settings = isRecord(payload.settings) ? payload.settings : {};
  const monthlyIncome =
    typeof settings.monthlyIncome === 'number' && Number.isFinite(settings.monthlyIncome)
      ? settings.monthlyIncome
      : 0;
  const userName =
    typeof settings.userName === 'string' && settings.userName.trim()
      ? settings.userName.trim()
      : DEFAULT_SETTINGS.userName;

  return {
    tasks: asArray<AppState['tasks'][number]>(payload.tasks),
    events: asArray<AppState['events'][number]>(payload.events),
    accounts: asArray<AppState['accounts'][number]>(payload.accounts),
    debts: asArray<AppState['debts'][number]>(payload.debts),
    notes: asArray<AppState['notes'][number]>((payload as Record<string, unknown>).notes),
    noteFolders: asArray<AppState['noteFolders'][number]>((payload as Record<string, unknown>).noteFolders),
    settings: { monthlyIncome, userName },
  };
}

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    return normaliseState(JSON.parse(raw));
  } catch (error) {
    console.warn('[LifeTracker] Could not read stored state, starting empty.', error);
    return { ...EMPTY_STATE };
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[LifeTracker] Could not persist state.', error);
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[LifeTracker] Could not clear stored state.', error);
  }
}

export function serialiseState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function parseState(raw: string): AppState {
  return normaliseState(JSON.parse(raw));
}
