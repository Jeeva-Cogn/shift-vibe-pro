export interface ExportRecord {
  id: string;
  filename: string;
  generatedAt: string; // ISO string
  month: string; // e.g., August
  year: string; // e.g., 2025
  dataBase64: string; // base64 of xlsx binary
}

const STORAGE_KEY = 'export_history_v1';

function load(): ExportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExportRecord[]) : [];
  } catch {
    return [];
  }
}

function save(list: ExportRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  try {
    window.dispatchEvent(new CustomEvent('export-history-updated'));
  } catch {}
}

export function getExportHistory(): ExportRecord[] {
  return load();
}

export function addExportRecord(filename: string, month: string, year: string, data: ArrayBuffer) {
  const dataBase64 = arrayBufferToBase64(data);
  const record: ExportRecord = {
    id: crypto.randomUUID(),
    filename,
    generatedAt: new Date().toISOString(),
    month,
    year,
    dataBase64,
  };
  const list = load();
  list.unshift(record);
  save(list);
}

export function removeExportRecord(id: string) {
  const list = load().filter(r => r.id !== id);
  save(list);
}

export function downloadExportRecord(record: ExportRecord) {
  const blob = base64ToBlob(record.dataBase64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = record.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
