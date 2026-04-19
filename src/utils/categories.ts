import type { RecordCategory, RecordType } from '../types';

type CategoryOption = {
  id: RecordCategory;
  label: string;
  type: RecordType;
};

export const EXPENSE_CATEGORIES = [
  { id: 'expense-food', label: '餐饮', type: 'expense' },
  { id: 'expense-transport', label: '交通', type: 'expense' },
  { id: 'expense-housing', label: '居住', type: 'expense' },
  { id: 'expense-shopping', label: '购物', type: 'expense' },
  { id: 'expense-entertainment', label: '娱乐', type: 'expense' },
  { id: 'expense-medical', label: '医疗', type: 'expense' },
  { id: 'expense-learning', label: '学习', type: 'expense' },
  { id: 'expense-other', label: '其他支出', type: 'expense' },
] as const satisfies readonly CategoryOption[];

export const INCOME_CATEGORIES = [
  { id: 'income-salary', label: '工资', type: 'income' },
  { id: 'income-bonus', label: '奖金', type: 'income' },
  { id: 'income-reimbursement', label: '报销', type: 'income' },
  { id: 'income-gift', label: '红包', type: 'income' },
  { id: 'income-side-job', label: '副业', type: 'income' },
  { id: 'income-other', label: '其他收入', type: 'income' },
] as const satisfies readonly CategoryOption[];

const CATEGORY_OPTIONS = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoriesByType(type: RecordType) {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function getDefaultCategory(type: RecordType): RecordCategory {
  return type === 'expense' ? 'expense-other' : 'income-other';
}

export function isCategoryValidForType(
  category: string | undefined,
  type: RecordType,
): category is RecordCategory {
  return getCategoriesByType(type).some((option) => option.id === category);
}

export function normalizeCategory(
  type: RecordType,
  category: string | undefined,
): RecordCategory {
  if (isCategoryValidForType(category, type)) {
    return category;
  }

  return getDefaultCategory(type);
}

export function getCategoryLabel(category: RecordCategory) {
  return (
    CATEGORY_OPTIONS.find((option) => option.id === category)?.label ?? '未分类'
  );
}
