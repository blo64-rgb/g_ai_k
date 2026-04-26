import { STORAGE_KEYS } from "../config/constants.js";

export function saveLevelState(state) {
  localStorage.setItem(STORAGE_KEYS.levelState, JSON.stringify(state));
}

export function loadLevelState() {
  const raw = localStorage.getItem(STORAGE_KEYS.levelState);
  return raw ? JSON.parse(raw) : null;
}

export function saveSessionCheckpoint(state) {
  localStorage.setItem(STORAGE_KEYS.sessionCheckpoint, JSON.stringify(state));
}

export function loadSessionCheckpoint() {
  const raw = localStorage.getItem(STORAGE_KEYS.sessionCheckpoint);
  return raw ? JSON.parse(raw) : null;
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEYS.levelState);
  localStorage.removeItem(STORAGE_KEYS.sessionCheckpoint);
}
