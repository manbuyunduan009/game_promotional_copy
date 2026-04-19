import type {
  CategorySummaryItem,
  MonthlyStats,
  NewRecordInput,
  RecordDraft,
  RecordFormErrors,
  RecordItem,
  RecordType,
} from '../types';
import {
  getCategoryLabel,
  isCategoryValidForType,
  normalizeCategory,
} from './categories';

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function buildRecord(input: NewRecordInput): RecordItem {
  const createdAt = new Date().toISOString();

  return {
    id: createRecordId(),
    type: input.type,
    category: normalizeCategory(input.type, input.category),
    amount: input.amount,
    content: input.content.trim(),
    date: input.date,
    note: input.note.trim(),
    createdAt,
  };
}

export function updateRecordItem(
  currentRecord: RecordItem,
  input: NewRecordInput,
): RecordItem {
  return {
    ...currentRecord,
    type: input.type,
    category: normalizeCategory(input.type, input.category),
    amount: input.amount,
    content: input.content.trim(),
    date: input.date,
    note: input.note.trim(),
  };
}

export function sortRecords(records: RecordItem[]) {
  return [...records].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function groupRecordsByDate(records: RecordItem[]) {
  const grouped = new Map<string, RecordItem[]>();

  for (const record of sortRecords(records)) {
    const recordsForDate = grouped.get(record.date);

    if (recordsForDate) {
      recordsForDate.push(record);
      continue;
    }

    grouped.set(record.date, [record]);
  }

  return Array.from(grouped, ([date, items]) => ({ date, items }));
}

export function calculateMonthlyStats(
  records: RecordItem[],
  month: string,
): MonthlyStats {
  let incomeTotal = 0;
  let expenseTotal = 0;
  let count = 0;

  for (const record of records) {
    if (!record.date.startsWith(month)) {
      continue;
    }

    count += 1;

    if (record.type === 'income') {
      incomeTotal += record.amount;
    } else {
      expenseTotal += record.amount;
    }
  }

  return {
    incomeTotal,
    expenseTotal,
    balance: incomeTotal - expenseTotal,
    count,
  };
}

export function calculateCategorySummary(
  records: RecordItem[],
  month: string,
  type: RecordType,
): CategorySummaryItem[] {
  const totals = new Map<RecordItem['category'], CategorySummaryItem>();

  for (const record of records) {
    if (!record.date.startsWith(month) || record.type !== type) {
      continue;
    }

    const currentValue = totals.get(record.category);

    if (currentValue) {
      currentValue.total += record.amount;
      currentValue.count += 1;
      continue;
    }

    totals.set(record.category, {
      category: record.category,
      label: getCategoryLabel(record.category),
      total: record.amount,
      count: 1,
    });
  }

  return Array.from(totals.values()).sort((left, right) => right.total - left.total);
}

export function getCurrentDateValue() {
  return formatDateInput(new Date());
}

export function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatSignedAmount(record: RecordItem) {
  const prefix = record.type === 'income' ? '+' : '-';
  return `${prefix}${formatCurrency(record.amount)}`;
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${date}T00:00:00`));
}

export function formatMonthLabel(month: string) {
  const [year, monthValue] = month.split('-');
  return `${year} 年 ${Number(monthValue)} 月`;
}

export function getRecordTypeLabel(type: RecordType) {
  return type === 'income' ? '收入' : '支出';
}

export function createDraftFromRecord(record: RecordItem): RecordDraft {
  return {
    type: record.type,
    category: record.category,
    amount: String(record.amount),
    content: record.content,
    date: record.date,
    note: record.note,
  };
}

export function validateRecordDraft(
  draft: Pick<RecordDraft, 'amount' | 'content' | 'date' | 'category' | 'type'>,
): {
  amount: number | null;
  errors: RecordFormErrors;
} {
  const errors: RecordFormErrors = {};
  let amount: number | null = null;

  if (!draft.amount.trim()) {
    errors.amount = '请输入金额。';
  } else {
    const parsedAmount = Number(draft.amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = '金额必须大于 0。';
    } else {
      amount = parsedAmount;
    }
  }

  if (!draft.content.trim()) {
    errors.content = '请输入这笔收支的具体内容。';
  }

  if (!draft.date) {
    errors.date = '请选择日期。';
  }

  if (!isCategoryValidForType(draft.category, draft.type)) {
    errors.category = '请选择分类。';
  }

  return { amount, errors };
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createRecordId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
