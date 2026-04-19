import { useRef, useState } from 'react';
import type { RecordItem } from '../types';
import {
  calculateCategorySummary,
  calculateMonthlyStats,
  formatCurrency,
  formatMonthLabel,
  formatSignedAmount,
  getCurrentMonthValue,
  sortRecords,
} from '../utils/records';

type MonthlyStatsPanelProps = {
  records: RecordItem[];
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<number>;
};

export function MonthlyStatsPanel({
  records,
  onExportBackup,
  onImportBackup,
}: MonthlyStatsPanelProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthValue());
  const [transferMessage, setTransferMessage] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const monthRecords = sortRecords(records).filter((record) =>
    record.date.startsWith(selectedMonth),
  );
  const stats = calculateMonthlyStats(records, selectedMonth);
  const expenseSummary = calculateCategorySummary(records, selectedMonth, 'expense');
  const incomeSummary = calculateCategorySummary(records, selectedMonth, 'income');
  const topExpense = expenseSummary[0] ?? null;
  const topIncome = incomeSummary[0] ?? null;

  function handleExportClick() {
    onExportBackup();
    setTransferError('');
    setTransferMessage(
      `备份文件已开始下载，当前共导出 ${records.length} 笔记录。`,
    );
  }

  function handleRestoreClick() {
    setTransferError('');
    setTransferMessage('');
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    event.target.value = '';
    setTransferError('');
    setTransferMessage('');

    const shouldReplace = window.confirm(
      '恢复会覆盖当前所有本地记录。建议先导出一份当前数据。确定继续吗？',
    );

    if (!shouldReplace) {
      return;
    }

    setIsImporting(true);

    try {
      const importedCount = await onImportBackup(file);
      setTransferMessage(`恢复成功，已导入 ${importedCount} 笔记录。`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '恢复失败，请换一个备份文件重试。';
      setTransferError(message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="stats-layout">
      <header className="panel-header">
        <div className="panel-title">
          <h2>看本月统计</h2>
          <p>查看本月收入、支出、分类分布和数据备份。</p>
        </div>
        <div className="record-badge">{formatMonthLabel(selectedMonth)}</div>
      </header>

      <div className="month-toolbar">
        <label className="field">
          <span>选择月份</span>
          <input
            className="month-input"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </label>
      </div>

      <div className="stats-grid">
        <article>
          <span>月总收入</span>
          <strong>{formatCurrency(stats.incomeTotal)}</strong>
        </article>
        <article>
          <span>月总支出</span>
          <strong>{formatCurrency(stats.expenseTotal)}</strong>
        </article>
        <article>
          <span>月结余</span>
          <strong>{formatCurrency(stats.balance)}</strong>
        </article>
        <article>
          <span>记录笔数</span>
          <strong>{stats.count}</strong>
        </article>
      </div>

      <section className="month-records">
        <h3>本月记录预览</h3>

        {monthRecords.length === 0 ? (
          <div className="empty-state">
            <h3>本月暂无记录</h3>
            <p>记几笔收支后，这里会显示本月记录预览。</p>
          </div>
        ) : (
          <ul>
            {monthRecords.slice(0, 6).map((record) => (
              <li key={record.id}>
                <div className="month-record-text">
                  <p>{record.content}</p>
                  <small>
                    {record.date}
                    {record.note ? ` · ${record.note}` : ''}
                  </small>
                </div>
                <strong className={`record-amount ${record.type}`}>
                  {formatSignedAmount(record)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="category-summary-grid">
        <article className="category-summary-panel">
          <div className="category-summary-header">
            <h3>本月支出花在哪里</h3>
            <p>按分类汇总本月所有支出。</p>
          </div>

          {topExpense ? (
            <div className="category-highlight expense">
              <span>最大支出分类</span>
              <strong>{topExpense.label}</strong>
              <small>{formatCurrency(topExpense.total)}</small>
            </div>
          ) : null}

          {expenseSummary.length === 0 ? (
            <div className="empty-state">
              <h3>本月暂无支出分类数据</h3>
              <p>新增几笔支出后，这里会显示各类支出金额。</p>
            </div>
          ) : (
            <ul className="category-summary-list">
              {expenseSummary.map((item) => (
                <li key={item.category}>
                  <div className="category-summary-main">
                    <div className="category-summary-text">
                      <strong>{item.label}</strong>
                      <small>{item.count} 笔</small>
                    </div>
                    <div className="category-bar-track" aria-hidden="true">
                      <div
                        className="category-bar-fill expense"
                        style={{
                          width: `${getBarWidth(item.total, topExpense?.total ?? item.total)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="category-summary-meta">
                    <span>{formatCurrency(item.total)}</span>
                    <small>{getPercentLabel(item.total, stats.expenseTotal)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="category-summary-panel">
          <div className="category-summary-header">
            <h3>本月收入来自哪里</h3>
            <p>按分类汇总本月所有收入。</p>
          </div>

          {topIncome ? (
            <div className="category-highlight income">
              <span>最大收入分类</span>
              <strong>{topIncome.label}</strong>
              <small>{formatCurrency(topIncome.total)}</small>
            </div>
          ) : null}

          {incomeSummary.length === 0 ? (
            <div className="empty-state">
              <h3>本月暂无收入分类数据</h3>
              <p>新增几笔收入后，这里会显示主要收入来源。</p>
            </div>
          ) : (
            <ul className="category-summary-list">
              {incomeSummary.map((item) => (
                <li key={item.category}>
                  <div className="category-summary-main">
                    <div className="category-summary-text">
                      <strong>{item.label}</strong>
                      <small>{item.count} 笔</small>
                    </div>
                    <div className="category-bar-track" aria-hidden="true">
                      <div
                        className="category-bar-fill income"
                        style={{
                          width: `${getBarWidth(item.total, topIncome?.total ?? item.total)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="category-summary-meta">
                    <span>{formatCurrency(item.total)}</span>
                    <small>{getPercentLabel(item.total, stats.incomeTotal)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="backup-panel">
        <div className="backup-header">
          <div>
            <h3>备份与恢复</h3>
            <p>
              现在的数据只保存在当前浏览器里。要长期放心使用，记得定期导出备份。
            </p>
          </div>
        </div>

        <div className="backup-actions">
          <button className="primary-button" type="button" onClick={handleExportClick}>
            导出备份
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={handleRestoreClick}
            disabled={isImporting}
          >
            {isImporting ? '正在恢复...' : '导入恢复'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          className="file-input-hidden"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
        />

        <ul className="backup-tips">
          <li>导出会下载一个 `.json` 文件，这就是你的账本备份。</li>
          <li>导入恢复会覆盖当前本地数据，不是追加导入。</li>
          <li>最稳妥的做法是：每次恢复前，先再导出一份当前数据。</li>
        </ul>

        {transferMessage ? <p className="transfer-message">{transferMessage}</p> : null}
        {transferError ? <p className="transfer-error">{transferError}</p> : null}
      </section>
    </section>
  );
}

function getBarWidth(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 0;
  }

  return Math.max(8, (value / maxValue) * 100);
}

function getPercentLabel(value: number, total: number) {
  if (total <= 0) {
    return '0%';
  }

  return `${((value / total) * 100).toFixed(0)}%`;
}
