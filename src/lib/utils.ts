// Returns current time in Asia/Kolkata (Chennai) timezone as a Date object
export function getChennaiTime() {
  // Use Intl API for formatting, but for logic, adjust offset manually
  const now = new Date();
  // Get UTC time in ms, add IST offset (5.5 hours)
  const chennaiOffset = 5.5 * 60; // in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  const diff = chennaiOffset + localOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
}

// Returns formatted Chennai time string
export function getChennaiTimeString() {
  return getChennaiTime().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
