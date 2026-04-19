import { useState } from 'react';
import type {
  NewRecordInput,
  RecordDraft,
  RecordFormErrors,
  RecordItem,
} from '../types';
import { getCategoriesByType, getCategoryLabel, getDefaultCategory } from '../utils/categories';
import {
  createDraftFromRecord,
  formatDateLabel,
  formatSignedAmount,
  getRecordTypeLabel,
  groupRecordsByDate,
  validateRecordDraft,
} from '../utils/records';

type RecordListProps = {
  records: RecordItem[];
  onDeleteRecord: (recordId: string) => void;
  onUpdateRecord: (recordId: string, input: NewRecordInput) => void;
};

export function RecordList({
  records,
  onDeleteRecord,
  onUpdateRecord,
}: RecordListProps) {
  const groupedRecords = groupRecordsByDate(records);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<RecordDraft | null>(null);
  const [editingErrors, setEditingErrors] = useState<RecordFormErrors>({});
  const [feedback, setFeedback] = useState('');

  function beginEditing(record: RecordItem) {
    setEditingRecordId(record.id);
    setEditingDraft(createDraftFromRecord(record));
    setEditingErrors({});
    setFeedback('');
  }

  function cancelEditing() {
    setEditingRecordId(null);
    setEditingDraft(null);
    setEditingErrors({});
  }

  function updateEditingField<Key extends keyof RecordDraft>(
    key: Key,
    value: RecordDraft[Key],
  ) {
    setEditingDraft((currentDraft) =>
      currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
    );
    setFeedback('');
    if (
      key === 'amount' ||
      key === 'content' ||
      key === 'date' ||
      key === 'category'
    ) {
      setEditingErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
    }
  }

  function switchEditingType(type: RecordDraft['type']) {
    setEditingDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            type,
            category: getDefaultCategory(type),
          }
        : currentDraft,
    );
    setFeedback('');
    setEditingErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined,
    }));
  }

  function saveEditingRecord(recordId: string) {
    if (!editingDraft) {
      return;
    }

    const { amount, errors } = validateRecordDraft(editingDraft);

    if (Object.keys(errors).length > 0) {
      setEditingErrors(errors);
      setFeedback('');
      return;
    }

    onUpdateRecord(recordId, {
      type: editingDraft.type,
      category: editingDraft.category,
      amount: amount ?? 0,
      content: editingDraft.content,
      date: editingDraft.date,
      note: editingDraft.note,
    });

    setEditingRecordId(null);
    setEditingDraft(null);
    setEditingErrors({});
    setFeedback('记录已更新。');
  }

  function deleteRecord(record: RecordItem) {
    const shouldDelete = window.confirm(`确定删除“${record.content}”吗？`);

    if (!shouldDelete) {
      return;
    }

    onDeleteRecord(record.id);

    if (editingRecordId === record.id) {
      cancelEditing();
    }

    setFeedback('记录已删除。');
  }

  return (
    <section>
      <header className="panel-header">
        <div className="panel-title">
          <h2>按日期回看记录</h2>
          <p>按日期查看每一笔收支，支持直接编辑和删除。</p>
        </div>
        <div className="record-badge">共 {records.length} 笔</div>
      </header>

      {feedback ? <p className="list-feedback">{feedback}</p> : null}

      {groupedRecords.length === 0 ? (
        <div className="empty-state">
          <h3>暂无记录</h3>
          <p>先去“记账”页新增一笔收入或支出，这里会按日期自动展示。</p>
        </div>
      ) : (
        <div className="record-groups">
          {groupedRecords.map((group) => (
            <article className="record-group" key={group.date}>
              <div className="record-group-header">
                <h3>{formatDateLabel(group.date)}</h3>
                <p>当天共 {group.items.length} 笔</p>
              </div>

              <div className="record-items">
                {group.items.map((record) => {
                  const isEditing = editingRecordId === record.id && editingDraft;

                  return (
                    <article className="record-item" key={record.id}>
                      {isEditing ? (
                        <form
                          className="record-edit-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveEditingRecord(record.id);
                          }}
                        >
                          <div className="record-edit-header">
                            <div className="record-content">
                              <span className="record-type">正在编辑</span>
                              <h4>{record.content}</h4>
                              <p>修改后保存即可生效。</p>
                            </div>

                            <div className="record-actions">
                              <button
                                className="ghost-button compact-button"
                                type="button"
                                onClick={cancelEditing}
                              >
                                取消
                              </button>
                              <button
                                className="danger-button compact-button"
                                type="button"
                                onClick={() => deleteRecord(record)}
                              >
                                删除
                              </button>
                            </div>
                          </div>

                          <div className="field">
                            <label>收支类型</label>
                            <div className="type-toggle" aria-label="编辑收支类型">
                              <button
                                className={
                                  editingDraft.type === 'expense'
                                    ? 'toggle-button active'
                                    : 'toggle-button'
                                }
                                type="button"
                                onClick={() => switchEditingType('expense')}
                              >
                                支出
                              </button>
                              <button
                                className={
                                  editingDraft.type === 'income'
                                    ? 'toggle-button active'
                                    : 'toggle-button'
                                }
                                type="button"
                                onClick={() => switchEditingType('income')}
                              >
                                收入
                              </button>
                            </div>
                          </div>

                          <div className="form-grid">
                            <div className="field">
                              <label htmlFor={`edit-category-${record.id}`}>分类</label>
                              <select
                                id={`edit-category-${record.id}`}
                                className="field-input"
                                value={editingDraft.category}
                                onChange={(event) =>
                                  updateEditingField(
                                    'category',
                                    event.target.value as RecordDraft['category'],
                                  )
                                }
                              >
                                {getCategoriesByType(editingDraft.type).map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.label}
                                  </option>
                                ))}
                              </select>
                              {editingErrors.category ? (
                                <p className="field-error">{editingErrors.category}</p>
                              ) : null}
                            </div>

                            <div className="field">
                              <label htmlFor={`edit-amount-${record.id}`}>金额</label>
                              <input
                                id={`edit-amount-${record.id}`}
                                className="field-input"
                                inputMode="decimal"
                                value={editingDraft.amount}
                                onChange={(event) =>
                                  updateEditingField('amount', event.target.value)
                                }
                              />
                              {editingErrors.amount ? (
                                <p className="field-error">{editingErrors.amount}</p>
                              ) : null}
                            </div>

                            <div className="field">
                              <label htmlFor={`edit-date-${record.id}`}>日期</label>
                              <input
                                id={`edit-date-${record.id}`}
                                className="field-input"
                                type="date"
                                value={editingDraft.date}
                                onChange={(event) =>
                                  updateEditingField('date', event.target.value)
                                }
                              />
                              {editingErrors.date ? (
                                <p className="field-error">{editingErrors.date}</p>
                              ) : null}
                            </div>

                            <div className="field full-width">
                              <label htmlFor={`edit-content-${record.id}`}>内容</label>
                              <input
                                id={`edit-content-${record.id}`}
                                className="field-input"
                                value={editingDraft.content}
                                onChange={(event) =>
                                  updateEditingField('content', event.target.value)
                                }
                              />
                              {editingErrors.content ? (
                                <p className="field-error">{editingErrors.content}</p>
                              ) : null}
                            </div>

                            <div className="field full-width">
                              <label htmlFor={`edit-note-${record.id}`}>备注</label>
                              <textarea
                                id={`edit-note-${record.id}`}
                                className="field-textarea"
                                value={editingDraft.note}
                                onChange={(event) =>
                                  updateEditingField('note', event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="form-footer">
                            <button className="primary-button" type="submit">
                              保存修改
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="record-main">
                            <div className="record-content">
                              <span className="record-type">
                                {getRecordTypeLabel(record.type)}
                              </span>
                              <span className="record-category-tag">
                                {getCategoryLabel(record.category)}
                              </span>
                              <h4>{record.content}</h4>
                              <p>{record.date}</p>
                            </div>

                            <div className="record-side">
                              <strong className={`record-amount ${record.type}`}>
                                {formatSignedAmount(record)}
                              </strong>

                              <div className="record-actions">
                                <button
                                  className="secondary-button compact-button"
                                  type="button"
                                  onClick={() => beginEditing(record)}
                                >
                                  编辑
                                </button>
                                <button
                                  className="danger-button compact-button"
                                  type="button"
                                  onClick={() => deleteRecord(record)}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          </div>

                          {record.note ? (
                            <p className="record-note">备注：{record.note}</p>
                          ) : null}
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
