import type { RecordItem } from '../types';
import { normalizeCategory } from './categories';

export const STORAGE_KEY = 'accounting_app_records';
const BACKUP_FILE_PREFIX = 'accounting-backup';

export function loadRecords(): RecordItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!savedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sanitizeRecords(parsedValue);
  } catch {
    return [];
  }
}

export function saveRecords(records: RecordItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function downloadBackup(records: RecordItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const backupPayload = {
    app: 'simple-accounting',
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  };
  const backupBlob = new Blob([JSON.stringify(backupPayload, null, 2)], {
    type: 'application/json',
  });
  const backupUrl = window.URL.createObjectURL(backupBlob);
  const link = window.document.createElement('a');

  link.href = backupUrl;
  link.download = `${BACKUP_FILE_PREFIX}-${createTimestamp()}.json`;
  link.click();

  window.URL.revokeObjectURL(backupUrl);
}

export async function readBackupFile(file: File): Promise<RecordItem[]> {
  const rawText = await file.text();
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawText);
  } catch {
    throw new Error('备份文件不是有效的 JSON。');
  }

  if (Array.isArray(parsedValue)) {
    return sanitizeImportedRecords(parsedValue);
  }

  if (
    parsedValue &&
    typeof parsedValue === 'object' &&
    'records' in parsedValue
  ) {
    return sanitizeImportedRecords((parsedValue as { records: unknown }).records);
  }

  throw new Error('备份文件格式不正确。');
}

export function sanitizeRecords(value: unknown): RecordItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeRecordItem)
    .filter((record): record is RecordItem => record !== null);
}

function sanitizeImportedRecords(value: unknown): RecordItem[] {
  if (!Array.isArray(value)) {
    throw new Error('备份文件里没有可用的记录列表。');
  }

  const records = value
    .map(normalizeRecordItem)
    .filter((record): record is RecordItem => record !== null);

  if (records.length !== value.length) {
    throw new Error('备份文件里有无效记录，已停止导入。');
  }

  return records;
}

function normalizeRecordItem(value: unknown): RecordItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Partial<RecordItem>;

  if (
    typeof item.id !== 'string' ||
    (item.type !== 'income' && item.type !== 'expense') ||
    typeof item.amount !== 'number' ||
    typeof item.content !== 'string' ||
    typeof item.date !== 'string' ||
    typeof item.note !== 'string' ||
    typeof item.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    type: item.type,
    category: normalizeCategory(item.type, item.category),
    amount: item.amount,
    content: item.content,
    date: item.date,
    note: item.note,
    createdAt: item.createdAt,
  };
}

function createTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hour}${minute}${second}`;
}
