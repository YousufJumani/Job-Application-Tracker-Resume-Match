import { STORAGE_KEY } from "../constants";
import type { JobApplication } from "../types";

export function loadApplications(): JobApplication[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JobApplication[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveApplications(apps: JobApplication[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}
