export type RecordType = 'income' | 'expense';

export type ViewKey = 'entry' | 'records' | 'stats';

export type RecordCategory =
  | 'expense-food'
  | 'expense-transport'
  | 'expense-housing'
  | 'expense-shopping'
  | 'expense-entertainment'
  | 'expense-medical'
  | 'expense-learning'
  | 'expense-other'
  | 'income-salary'
  | 'income-bonus'
  | 'income-reimbursement'
  | 'income-gift'
  | 'income-side-job'
  | 'income-other';

export type RecordItem = {
  id: string;
  type: RecordType;
  category: RecordCategory;
  amount: number;
  content: string;
  date: string;
  note: string;
  createdAt: string;
};

export type NewRecordInput = {
  type: RecordType;
  category: RecordCategory;
  amount: number;
  content: string;
  date: string;
  note: string;
};

export type RecordDraft = {
  type: RecordType;
  category: RecordCategory;
  amount: string;
  content: string;
  date: string;
  note: string;
};

export type RecordFormErrors = Partial<
  Record<keyof Pick<RecordDraft, 'amount' | 'content' | 'date' | 'category'>, string>
>;

export type MonthlyStats = {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  count: number;
};

export type CategorySummaryItem = {
  category: RecordCategory;
  label: string;
  total: number;
  count: number;
};
