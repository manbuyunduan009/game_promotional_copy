import type { RecordCategory, RecordDraft, RecordType } from '../types';
import {
  getCategoryLabel,
  getDefaultCategory,
} from './categories';
import { getCurrentDateValue } from './records';

type CategoryRule = {
  keywords: string[];
  type: RecordType;
  category: RecordCategory;
};

type AmountMatch = {
  raw: string;
  value: number;
};

export type VoiceParseResult = {
  draft: RecordDraft;
  transcript: string;
  detectedType: RecordType;
  detectedCategory: RecordCategory;
  detectedAmount: number | null;
  detectedDate: string;
  detectedDateLabel: string | null;
  detectedContent: string;
};

const categoryRules: CategoryRule[] = [
  {
    keywords: ['早餐', '午饭', '午餐', '晚饭', '晚餐', '吃饭', '外卖', '奶茶', '咖啡', '宵夜', '水果'],
    type: 'expense',
    category: 'expense-food',
  },
  {
    keywords: ['打车', '滴滴', '地铁', '公交', '高铁', '火车', '机票', '加油', '停车', '过路费'],
    type: 'expense',
    category: 'expense-transport',
  },
  {
    keywords: ['房租', '租金', '电费', '水费', '燃气', '物业', '宽带', '网费'],
    type: 'expense',
    category: 'expense-housing',
  },
  {
    keywords: ['购物', '超市', '淘宝', '京东', '衣服', '鞋子', '日用品', '买东西'],
    type: 'expense',
    category: 'expense-shopping',
  },
  {
    keywords: ['电影', '游戏', '唱歌', 'ktv', '旅游', '旅行', '演出', '娱乐'],
    type: 'expense',
    category: 'expense-entertainment',
  },
  {
    keywords: ['医院', '买药', '药店', '体检', '挂号', '医疗'],
    type: 'expense',
    category: 'expense-medical',
  },
  {
    keywords: ['书', '课程', '培训', '学费', '教材', '学习'],
    type: 'expense',
    category: 'expense-learning',
  },
  {
    keywords: ['工资', '薪资', '发薪'],
    type: 'income',
    category: 'income-salary',
  },
  {
    keywords: ['奖金', '提成', '绩效'],
    type: 'income',
    category: 'income-bonus',
  },
  {
    keywords: ['报销'],
    type: 'income',
    category: 'income-reimbursement',
  },
  {
    keywords: ['红包', '礼金'],
    type: 'income',
    category: 'income-gift',
  },
  {
    keywords: ['副业', '兼职', '接单', '外快'],
    type: 'income',
    category: 'income-side-job',
  },
];

const incomeHints = ['收入', '收到', '收了', '到账', '赚了'];
const expenseHints = ['支出', '花了', '花费', '消费', '用了', '付款', '付了'];
const chineseDigits: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null;
  }

  const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    return null;
  }

  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  return recognition;
}

export async function ensureMicrophonePermission() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器不支持麦克风权限请求。');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'SecurityError':
          throw new Error(
            '浏览器没有拿到麦克风权限。请点击地址栏左侧的站点图标，把麦克风改成“允许”，然后刷新页面再试。',
          );
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          throw new Error('没有检测到可用的麦克风设备。');
        case 'NotReadableError':
        case 'TrackStartError':
          throw new Error('麦克风当前可能被其他应用占用，请关闭后重试。');
        default:
          throw new Error('麦克风启动失败，请稍后重试。');
      }
    }

    throw new Error('麦克风启动失败，请稍后重试。');
  }
}

export function applyVoiceTranscriptToDraft(
  transcript: string,
  currentDraft: RecordDraft,
): RecordDraft {
  return parseVoiceTranscript(transcript, currentDraft).draft;
}

export function parseVoiceTranscript(
  transcript: string,
  currentDraft: RecordDraft,
): VoiceParseResult {
  const cleanedTranscript = normalizeTranscript(transcript);
  const compactTranscript = compactForParsing(cleanedTranscript);
  const categoryRule = detectCategoryRule(compactTranscript);
  const detectedType =
    categoryRule?.type ?? detectRecordType(compactTranscript) ?? currentDraft.type;
  const detectedCategory =
    categoryRule?.category ?? getDefaultCategory(detectedType);
  const amountMatch = detectAmountMatch(compactTranscript);
  const dateMatch = detectDateMatch(compactTranscript);
  const detectedDate = dateMatch?.value ?? currentDraft.date;
  const detectedContent = buildContent(compactTranscript, amountMatch?.raw ?? '');

  return {
    transcript: compactTranscript,
    detectedType,
    detectedCategory,
    detectedAmount: amountMatch?.value ?? null,
    detectedDate,
    detectedDateLabel: dateMatch?.label ?? null,
    detectedContent: detectedContent || getCategoryLabel(detectedCategory),
    draft: {
      ...currentDraft,
      type: detectedType,
      category: detectedCategory,
      amount: amountMatch
        ? formatAmountValue(amountMatch.value)
        : currentDraft.amount,
      content: detectedContent || getCategoryLabel(detectedCategory),
      date: detectedDate,
    },
  };
}

export function getSpeechErrorMessage(error: string | undefined) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '浏览器没有拿到麦克风权限。请点击地址栏左侧的站点图标，把麦克风改成“允许”，然后刷新页面再试。';
    case 'audio-capture':
      return '没有检测到可用的麦克风。';
    case 'no-speech':
      return '没有听到语音，请靠近麦克风再试一次。';
    case 'network':
      return '语音识别网络异常，请稍后重试。';
    default:
      return '语音识别失败，请重试一次或改用手动输入。';
  }
}

function normalizeTranscript(transcript: string) {
  return transcript.replace(/[，。！？；：、]/g, ' ').replace(/\s+/g, ' ').trim();
}

function compactForParsing(transcript: string) {
  return transcript.replace(/\s+/g, '');
}

function detectCategoryRule(transcript: string) {
  return categoryRules.find((rule) =>
    rule.keywords.some((keyword) => transcript.includes(keyword)),
  );
}

function detectRecordType(transcript: string): RecordType | null {
  if (incomeHints.some((keyword) => transcript.includes(keyword))) {
    return 'income';
  }

  if (expenseHints.some((keyword) => transcript.includes(keyword))) {
    return 'expense';
  }

  return null;
}

function detectDateMatch(transcript: string): {
  value: string;
  label: string;
} | null {
  if (transcript.includes('前天')) {
    return {
      value: shiftDate(-2),
      label: '前天',
    };
  }

  if (transcript.includes('昨天')) {
    return {
      value: shiftDate(-1),
      label: '昨天',
    };
  }

  if (transcript.includes('今天')) {
    return {
      value: getCurrentDateValue(),
      label: '今天',
    };
  }

  const fullDateMatch = transcript.match(
    /(?:(\d{4})年)?(\d{1,2})[月\/\-](\d{1,2})(?:日|号)?/,
  );

  if (fullDateMatch) {
    const currentDate = new Date();
    const year = fullDateMatch[1]
      ? Number(fullDateMatch[1])
      : currentDate.getFullYear();
    const month = Number(fullDateMatch[2]);
    const day = Number(fullDateMatch[3]);

    if (isValidDate(year, month, day)) {
      return {
        value: formatDateValue(year, month, day),
        label: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      };
    }
  }

  return null;
}

function detectAmountMatch(transcript: string): AmountMatch | null {
  const arabicMatches = Array.from(transcript.matchAll(/\d+(?:\.\d+)?/g));

  if (arabicMatches.length > 0) {
    const raw = arabicMatches[arabicMatches.length - 1][0];
    return {
      raw,
      value: Number(raw),
    };
  }

  const chineseMatches = Array.from(
    transcript.matchAll(/[零一二两三四五六七八九十百千万点块元毛角分]+/g),
  );

  for (let index = chineseMatches.length - 1; index >= 0; index -= 1) {
    const raw = chineseMatches[index][0];
    const value = parseChineseAmount(raw);

    if (value !== null) {
      return { raw, value };
    }
  }

  return null;
}

function buildContent(transcript: string, amountRaw: string) {
  const escapedAmount = amountRaw ? escapeRegExp(amountRaw) : null;

  const content = (escapedAmount
    ? transcript.replace(new RegExp(escapedAmount, 'g'), ' ')
    : transcript)
    .replace(
      /帮我|帮忙|记一笔|记一下|记下|记录一下|记录|记账|今天|昨天|前天|收入|支出|花了|花费|花掉|消费了|消费|付款|付了|用了|收到|收了|赚了|到账|人民币|块钱|元钱|\d{1,4}年\d{1,2}月\d{1,2}(?:日|号)?|\d{1,2}[月\/\-]\d{1,2}(?:日|号)?/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();

  return content;
}

function formatAmountValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function parseChineseAmount(raw: string): number | null {
  const normalized = raw
    .replace(/人民币/g, '')
    .replace(/块钱|元钱/g, '点')
    .replace(/[块元]/g, '点')
    .replace(/[毛角]/g, '')
    .replace(/分/g, '')
    .replace(/两/g, '二')
    .replace(/点+/g, '点')
    .replace(/^点/, '零点')
    .replace(/点$/, '');

  if (!normalized) {
    return null;
  }

  if (normalized.includes('点')) {
    const [integerPartRaw, decimalPartRaw] = normalized.split('点');
    const integerPart = parseChineseInteger(integerPartRaw || '零');
    const decimalPart = parseChineseDecimal(decimalPartRaw);

    if (integerPart === null || decimalPart === null) {
      return null;
    }

    return Number(`${integerPart}.${decimalPart}`);
  }

  return parseChineseInteger(normalized);
}

function parseChineseInteger(raw: string) {
  if (!raw) {
    return 0;
  }

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const units: Record<string, number> = {
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
  };

  let total = 0;
  let section = 0;
  let number = 0;

  for (const character of raw) {
    if (character in chineseDigits) {
      number = chineseDigits[character];
      continue;
    }

    const unit = units[character];

    if (!unit) {
      return null;
    }

    if (unit === 10000) {
      section += number;
      total += section * unit;
      section = 0;
      number = 0;
      continue;
    }

    if (number === 0) {
      number = 1;
    }

    section += number * unit;
    number = 0;
  }

  return total + section + number;
}

function parseChineseDecimal(raw: string | undefined) {
  if (!raw) {
    return '0';
  }

  let decimal = '';

  for (const character of raw) {
    if (character in chineseDigits) {
      decimal += chineseDigits[character];
      continue;
    }

    if (/\d/.test(character)) {
      decimal += character;
      continue;
    }

    return null;
  }

  return decimal || '0';
}

function shiftDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateValue(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isValidDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
