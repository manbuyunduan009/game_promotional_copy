import { useEffect, useRef, useState } from 'react';
import type { NewRecordInput, RecordDraft, RecordFormErrors } from '../types';
import {
  getCategoriesByType,
  getCategoryLabel,
  getDefaultCategory,
} from '../utils/categories';
import {
  getCurrentDateValue,
  getRecordTypeLabel,
  validateRecordDraft,
} from '../utils/records';
import {
  createSpeechRecognition,
  ensureMicrophonePermission,
  getSpeechErrorMessage,
  isSpeechRecognitionSupported,
  parseVoiceTranscript,
} from '../utils/voiceEntry';

type EntryFormProps = {
  onAddRecord: (input: NewRecordInput) => void;
  onOpenRecords: () => void;
  totalRecords: number;
};

function createInitialFormState(): RecordDraft {
  return {
    type: 'expense',
    category: getDefaultCategory('expense'),
    amount: '',
    content: '',
    date: getCurrentDateValue(),
    note: '',
  };
}

export function EntryForm({
  onAddRecord,
  onOpenRecords,
  totalRecords,
}: EntryFormProps) {
  const [form, setForm] = useState<RecordDraft>(() => createInitialFormState());
  const [errors, setErrors] = useState<RecordFormErrors>({});
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [voiceSummary, setVoiceSummary] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const formRef = useRef(form);
  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  function switchType(type: RecordDraft['type']) {
    setForm((currentForm) => ({
      ...currentForm,
      type,
      category: getDefaultCategory(type),
    }));
    setFeedback('');
    setErrors((currentErrors) => ({
      ...currentErrors,
      category: undefined,
    }));
    setVoiceError('');
    setVoiceSummary('');
  }

  function updateField<Key extends keyof RecordDraft>(
    key: Key,
    value: RecordDraft[Key],
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
    setFeedback('');
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
    setVoiceError('');
    setVoiceSummary('');
  }

  async function startVoiceInput() {
    if (!speechSupported) {
      setVoiceError('当前浏览器暂不支持语音录入。');
      return;
    }

    setVoiceError('');
    setVoiceMessage('正在请求麦克风权限...');

    try {
      await ensureMicrophonePermission();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '麦克风启动失败，请稍后重试。';
      setVoiceError(message);
      setVoiceMessage('');
      return;
    }

    let recognition = recognitionRef.current;

    if (!recognition) {
      recognition = createSpeechRecognition();
      recognitionRef.current = recognition;
    }

    if (!recognition) {
      setVoiceError('当前浏览器暂不支持语音录入。');
      return;
    }

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('');
      setVoiceMessage('正在听，请直接说一笔账。');
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript?.trim();

      if (!transcript) {
        return;
      }

      setLastTranscript(transcript);
      const parseResult = parseVoiceTranscript(transcript, formRef.current);
      setForm(parseResult.draft);
      setVoiceSummary(buildVoiceSummary(parseResult));
      setErrors({});
      setFeedback('语音内容已填入表单，请确认后保存。');
      setVoiceError('');
      setVoiceMessage('识别完成，表单已更新。');
    };

    recognition.onerror = (event) => {
      setVoiceError(getSpeechErrorMessage(event.error));
      setVoiceMessage('');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setVoiceError('语音录入启动失败，请稍后重试。');
      setVoiceMessage('');
    }
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setVoiceMessage('录音已停止。');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { amount, errors: nextErrors } = validateRecordDraft(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback('');
      return;
    }

    onAddRecord({
      type: form.type,
      category: form.category,
      amount: amount ?? 0,
      content: form.content,
      date: form.date,
      note: form.note,
    });

    setForm((currentForm) => ({
      ...currentForm,
      category: getDefaultCategory(currentForm.type),
      amount: '',
      content: '',
      note: '',
    }));
    setErrors({});
    setFeedback('已保存到本地，刷新页面也不会丢失。');
    setVoiceMessage('');
    setVoiceSummary('');
  }

  return (
    <section className="entry-section">
      <header className="panel-header">
        <div className="panel-title">
          <h2>快速记一笔</h2>
          <p>
            支持手动输入和语音录入，保存后会自动更新记录列表和本月统计。
          </p>
        </div>
        <div className="record-badge">已累计 {totalRecords} 笔</div>
      </header>

      <div className="entry-layout">
        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>收支类型</label>
            <div className="type-toggle" aria-label="收支类型切换">
              <button
                className={
                  form.type === 'expense' ? 'toggle-button active' : 'toggle-button'
                }
                type="button"
                onClick={() => switchType('expense')}
              >
                支出
              </button>
              <button
                className={
                  form.type === 'income' ? 'toggle-button active' : 'toggle-button'
                }
                type="button"
                onClick={() => switchType('income')}
              >
                收入
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="category">分类</label>
              <select
                id="category"
                className="field-input"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value as RecordDraft['category'])}
              >
                {getCategoriesByType(form.type).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="field-error">{errors.category}</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="amount">金额</label>
              <input
                id="amount"
                className="field-input"
                inputMode="decimal"
                type="number"
                step="0.01"
                placeholder="例如 28.50"
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
              />
              {errors.amount ? <p className="field-error">{errors.amount}</p> : null}
            </div>

            <div className="field">
              <label htmlFor="date">日期</label>
              <input
                id="date"
                className="field-input"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
              />
              {errors.date ? <p className="field-error">{errors.date}</p> : null}
            </div>

            <div className="field full-width">
              <label htmlFor="content">内容</label>
              <input
                id="content"
                className="field-input"
                placeholder="例如 午饭、打车、工资、报销"
                value={form.content}
                onChange={(event) => updateField('content', event.target.value)}
              />
              {errors.content ? (
                <p className="field-error">{errors.content}</p>
              ) : null}
            </div>

            <div className="field full-width">
              <label htmlFor="note">备注</label>
              <textarea
                id="note"
                className="field-textarea"
                placeholder="选填，例如：和朋友聚餐、公司报销到账"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
              />
            </div>
          </div>

          <div className="form-footer">
            <button className="primary-button" type="submit">
              保存记录
            </button>
            <button className="secondary-button" type="button" onClick={onOpenRecords}>
              去看记录列表
            </button>
            {feedback ? <p className="feedback">{feedback}</p> : null}
          </div>
        </form>

        <aside className="entry-notes voice-panel">
          <div className="voice-header">
            <h3>语音记账</h3>
            <p>说一句话，系统会尽量识别金额、分类、内容和日期。</p>
          </div>

          <div className="voice-actions">
            <button
              className="primary-button"
              type="button"
              onClick={startVoiceInput}
              disabled={!speechSupported || isListening}
            >
              {isListening ? '正在录音...' : '开始语音录入'}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={stopVoiceInput}
              disabled={!isListening}
            >
              停止录音
            </button>
          </div>

          <div className="voice-examples">
            <span>例如：</span>
            <ul className="helper-list">
              <li>午饭三十五块</li>
              <li>昨天打车十八</li>
              <li>工资五千</li>
            </ul>
          </div>

          {voiceMessage ? <p className="voice-status">{voiceMessage}</p> : null}
          {voiceError ? <p className="voice-error">{voiceError}</p> : null}
          {voiceSummary ? <p className="voice-status">{voiceSummary}</p> : null}

          {!speechSupported ? (
            <p className="voice-support-note">
              当前浏览器不支持语音录入，建议用 Chrome 或 Edge 打开。
            </p>
          ) : null}

          {lastTranscript ? (
            <div className="voice-transcript">
              <span>最近一次识别</span>
              <strong>{lastTranscript}</strong>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function buildVoiceSummary(
  parseResult: ReturnType<typeof parseVoiceTranscript>,
) {
  const summaryParts = [
    getRecordTypeLabel(parseResult.detectedType),
    getCategoryLabel(parseResult.detectedCategory),
  ];

  if (parseResult.detectedAmount !== null) {
    summaryParts.push(`金额 ${parseResult.detectedAmount}`);
  }

  if (parseResult.detectedDateLabel) {
    summaryParts.push(`日期 ${parseResult.detectedDateLabel} -> ${parseResult.detectedDate}`);
  } else {
    summaryParts.push(`日期 ${parseResult.detectedDate}`);
  }

  summaryParts.push(`内容 ${parseResult.detectedContent}`);

  return `识别结果：${summaryParts.join(' / ')}`;
}
