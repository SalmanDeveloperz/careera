"use client";

import { DEFAULT_PROFILE, type StudentProfile } from "./types";

const STORAGE_KEY = "careera-student-profile";

export function loadProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }),
  );
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getProfileOrDefault(): StudentProfile {
  return loadProfile() ?? DEFAULT_PROFILE;
}
