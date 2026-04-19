import { useState } from 'react';
import './App.css';

const stageOrder = ['validation', 'mature', 'scale', 'explore'] as const;
const moduleOrder = ['business', 'operations', 'technology'] as const;

type StageKey = (typeof stageOrder)[number];
type ModuleKey = (typeof moduleOrder)[number];

const stageMap = {
  validation: {
    label: '增长验证期',
    tag: '跑通闭环',
    summary: '先验证获客、激活、留存和 LTV/CAC 是否跑通，再决定要不要放量。',
    question: '当前业务是不是已经具备继续放量的条件？',
    signal: '建议继续保留试验预算，但先把激活与留存补稳，再扩大投放。',
    metrics: [
      { label: 'LTV / CAC', value: '1.6', detail: '接近放量门槛，但仍不稳定' },
      { label: '激活转化率', value: '34%', detail: '关键行为仍有明显损耗' },
      { label: '试验支撑时效', value: '2.4 天', detail: '技术已能支持周级验证' },
    ],
    ai: {
      title: '验证期 AI 试点',
      observe: '小预算投放带来注册增长，但 D7 留存下滑 8%，CAC 上升 12%。',
      predict: '如果直接放量，短期新增会继续涨，但单位经济模型可能恶化。',
      action: '先补激活路径和新手引导实验，再决定是否进入规模化投放。',
      confidence: '中',
    },
  },
  mature: {
    label: '成熟 / 现金牛',
    tag: '稳态利润',
    summary: '重点看利润、留存和口碑能否稳住，再通过动作和支撑持续提升效率。',
    question: '在不伤害口碑和生态的前提下，能否持续稳定利润？',
    signal: '适合继续加投高复购动作和自动化支撑，同时控制低效活动投入。',
    metrics: [
      { label: '经营达成率', value: '108%', detail: '利润率 24.6%，高于目标' },
      { label: '运营 ROI', value: '3.8', detail: '召回和会员转化贡献最稳' },
      { label: '技术覆盖价值', value: '76%', detail: '大部分核心收入与技术链路相关' },
    ],
    ai: {
      title: '成熟业务 AI 试点',
      observe: '社群复购转化持续高于大盘 19%，低互动内容边际收益持续走弱。',
      predict: '若增加会员召回和自动化触达，预计下周期利润率可再提升 1.4pct。',
      action: '压缩低互动内容投放，把资源转向高复购人群经营与自动化平台。',
      confidence: '中高',
    },
  },
  scale: {
    label: '增长放量期',
    tag: '规模增长',
    summary: '重点看边际 ROI、渠道质量和组织承载，避免把增长做成粗放扩张。',
    question: '是否具备继续追加资源的条件，且系统与团队承载得住？',
    signal: '适合继续拉升高质量渠道，同时同步补充容量、归因和转化提效能力。',
    metrics: [
      { label: '边际 ROI', value: '2.7', detail: '仍然有效，但开始分化' },
      { label: '多渠道新增', value: '+42%', detail: '分层转化优于单点拉新' },
      { label: '弹性承载率', value: '91%', detail: '核心链路接近容量上限' },
    ],
    ai: {
      title: '放量期 AI 试点',
      observe: '短视频投放新增最快，但次留和复购明显弱于私域拉新。',
      predict: '如果继续按当前结构加投，收入会涨，但边际 ROI 还会继续下降。',
      action: '保留高增速渠道，同时将预算向高留存渠道和转化提效工具倾斜。',
      confidence: '中',
    },
  },
  explore: {
    label: '创新 / 探索',
    tag: '低成本试错',
    summary: '重点看试错成本、验证周期和能力沉淀，不以短期利润作为核心目标。',
    question: '当前方向是否值得继续验证，试错成本是不是还在可控区间？',
    signal: '适合保持小流量试验和轻量底座建设，不建议过早重投入。',
    metrics: [
      { label: '单次试验成本', value: '6.8 万', detail: '低于预算上限 18%' },
      { label: 'MVP 验证周期', value: '12 天', detail: '较上期缩短 4 天' },
      { label: '能力沉淀数', value: '5 项', detail: '配置化模板开始复用' },
    ],
    ai: {
      title: '探索期 AI 试点',
      observe: '社区共创路径参与度最高，但商业化信号仍弱。',
      predict: '继续大规模开发风险偏高，保持小流量试验更容易两轮内完成判断。',
      action: '保留高互动方向，暂停低反馈方案，强化低代码试验底座。',
      confidence: '中低',
    },
  },
} as const;

const moduleMap = {
  business: {
    label: '业务经营',
    lens: '结果',
    audience: '管理层',
    question: '业务经营结果怎么样？是否达成公司目标？',
    summary: '先让领导判断整体表现，再看结构强弱与变化原因。',
    promise: '先回答整体好不好，再回答到底是哪里好、哪里出问题。',
    content: {
      validation: {
        headline: '验证期核心不是规模，而是商业闭环是否跑通。',
        summary: '一级继续看用户、收入和效率，二级切到增长效率、转化效果和单位经济模型。',
        level1: [
          { label: '用户结果', value: '新增 11.4 万', detail: '激活率 34%，关键行为未稳定' },
          { label: '收入结果', value: '月收入 260 万', detail: '付费增长明显，但利润未转正' },
          { label: '效率结果', value: 'LTV/CAC 1.6', detail: '接近门槛，仍需补留存' },
        ],
        level2: [
          { label: '增长效率', score: '观察', detail: 'CAC 有上升趋势，放量前仍需压实效率。', status: 'watch' },
          { label: '转化效果', score: '建设中', detail: '首转改善明显，但留存后的转化仍弱。', status: 'build' },
        ],
        level3: [
          { label: '激活率', value: '34%', detail: '首次关键行为仍是最大卡点。' },
          { label: 'D7 留存', value: '19%', detail: '决定 LTV/CAC 能否继续改善。' },
        ],
        recommend: '先补激活和留存，再决定是否进入放量阶段。',
      },
      mature: {
        headline: '成熟业务更看重稳态质量，而不只是绝对收入规模。',
        summary: '二级重点看留存健康、商业化持续性和口碑生态。',
        level1: [
          { label: '用户结果', value: 'MAU 186 万', detail: 'D30 留存 38%，核心用户盘稳定' },
          { label: '收入结果', value: '月利润 1,280 万', detail: '利润率 24.6%，持续高于目标' },
          { label: '效率结果', value: 'ROI 4.1', detail: '节省运营与支撑成本 310 万' },
        ],
        level2: [
          { label: '留存健康度', score: '强', detail: '高价值用户留存和版本回流都优于基线。', status: 'strong' },
          { label: '口碑与生态', score: '观察', detail: '一次版本节奏影响投诉率，需要持续跟踪。', status: 'watch' },
        ],
        level3: [
          { label: '复购率', value: '42%', detail: '会员召回和社群运营在推动商业化持续性。' },
          { label: 'NPS', value: '43', detail: '整体口碑良好，但需要关注情绪波动。' },
        ],
        recommend: '把资源投向高复购人群经营和口碑防护，而不是只追求新增。',
      },
      scale: {
        headline: '放量期更关注增长还能不能继续健康。',
        summary: '二级重点转向增长效率、规模化潜力和市场空间。',
        level1: [
          { label: '用户结果', value: '新增 58 万', detail: '分层转化路径开始拉开差距' },
          { label: '收入结果', value: '月收入 3,480 万', detail: '收入快速增长，但利润率承压' },
          { label: '效率结果', value: '边际 ROI 2.7', detail: '开始出现明显分化' },
        ],
        level2: [
          { label: '增长效率', score: '强', detail: '高转化渠道仍有加投空间。', status: 'strong' },
          { label: '规模化潜力', score: '观察', detail: '组织和系统承载开始接近上限。', status: 'watch' },
        ],
        level3: [
          { label: '组织承载率', value: '84%', detail: '业务和技术都接近高负载。' },
          { label: '高价值渠道占比', value: '61%', detail: '决定下一阶段收入能否继续稳住。' },
        ],
        recommend: '继续加投必须和补容量绑定推进。',
      },
      explore: {
        headline: '探索期看的是验证效率和成本控制。',
        summary: '二级切到试错成本、验证周期和能力沉淀。',
        level1: [
          { label: '用户结果', value: '种子用户 1.3 万', detail: '高互动用户占比 27%' },
          { label: '收入结果', value: '验证收入 48 万', detail: '收入不是主要目标，重在方向判断' },
          { label: '效率结果', value: '单次试验成本 6.8 万', detail: '控制在预算内' },
        ],
        level2: [
          { label: '试错成本', score: '强', detail: '试验规模和投入仍在可控区间。', status: 'strong' },
          { label: '能力沉淀', score: '建设中', detail: '已有部分复用模板，但沉淀仍可加强。', status: 'build' },
        ],
        level3: [
          { label: 'MVP 周期', value: '12 天', detail: '是判断试验底座是否有效的关键指标。' },
          { label: '验证成功率', value: '33%', detail: '说明方向仍在筛选，需要继续小步试错。' },
        ],
        recommend: '继续保持低成本试验，把投入聚焦在高反馈方向。',
      },
    },
  },
  operations: {
    label: '运营动作',
    lens: '动作',
    audience: '运营发行',
    question: '运营发行做了哪些动作？效果如何？哪些动作值得继续投入？',
    summary: '把活动、召回、转化、投放、内容放进同一套经营评价里。',
    promise: '不是统计做了多少动作，而是判断哪些动作值得继续投。',
    content: {
      validation: {
        headline: '验证期中的运营动作，核心是小预算验证关键漏斗。',
        summary: '一级看整体贡献与效率，二级聚焦小预算投放、漏斗打通和关键行为激活。',
        level1: [
          { label: '运营贡献收入', value: '118 万', detail: '活动和投放仍以验证为主' },
          { label: '运营成本', value: '74 万', detail: '以小流量测试和基础内容为主' },
          { label: '总运营 ROI', value: '1.6', detail: '接近继续验证的底线' },
        ],
        level2: [
          { label: '小预算投放', score: '观察', detail: '新增获取有效，但质量不够稳定。', status: 'watch' },
          { label: '漏斗打通', score: '建设中', detail: '注册到激活仍有较大损耗。', status: 'build' },
        ],
        level3: [
          { label: '注册转化率', value: '18%', detail: '是当前增长漏斗的第一道门槛。' },
          { label: '首日关键行为率', value: '31%', detail: '直接决定后续留存和首付。' },
        ],
        recommend: '先把注册到激活的关键链路做顺，再决定是否扩大预算。',
      },
      mature: {
        headline: '成熟业务中的运营重点，是守住利润和复购。',
        summary: '一级看整体运营贡献和成本效率，二级按活动、召回、付费转化拆结构。',
        level1: [
          { label: '运营贡献收入', value: '4,860 万', detail: '占整体流水 44%' },
          { label: '运营成本', value: '1,280 万', detail: '活动和内容成本保持稳定' },
          { label: '总运营 ROI', value: '3.8', detail: '高于去年同期 0.5' },
        ],
        level2: [
          { label: '召回运营', score: '强', detail: '老客召回与会员唤醒是最稳定的利润来源。', status: 'strong' },
          { label: '活动运营', score: '观察', detail: '大促能拉收入，但边际收益趋缓。', status: 'watch' },
        ],
        level3: [
          { label: '召回成功率', value: '27%', detail: '说明沉默用户仍有较高唤醒空间。' },
          { label: '复购周期', value: '21 天', detail: '直接影响成熟业务的利润稳定性。' },
        ],
        recommend: '继续投入召回和高价值转化动作，同时压缩低互动内容。',
      },
      scale: {
        headline: '放量期中的运营动作，核心是多渠道拉新和分层转化体系化。',
        summary: '二级重点看规模化拉新、全域转化和增长体系化。',
        level1: [
          { label: '运营贡献收入', value: '1.36 亿', detail: '拉新和转化一起拉动收入扩张' },
          { label: '运营成本', value: '5,020 万', detail: '投放和渠道成本快速提升' },
          { label: '总运营 ROI', value: '2.7', detail: '整体仍正向，但结构差异变大' },
        ],
        level2: [
          { label: '规模化拉新', score: '强', detail: '新渠道带来大量新增，但质量分化。', status: 'strong' },
          { label: '全域转化', score: '观察', detail: '分层转化体系仍在打磨。', status: 'watch' },
        ],
        level3: [
          { label: '渠道留存差', value: '14pct', detail: '说明渠道扩张不能只看新增规模。' },
          { label: '边际 CAC', value: '96 元', detail: '是判断是否继续加投的重要边界。' },
        ],
        recommend: '保留高增速渠道，但要同步加码分层转化和归因治理。',
      },
      explore: {
        headline: '探索期中的运营动作，核心是低成本验证和高密度试验。',
        summary: '二级重点切到低成本验证、小流量实验和种子用户共创。',
        level1: [
          { label: '运营贡献收入', value: '32 万', detail: '收入仅作为方向信号' },
          { label: '运营成本', value: '19 万', detail: '主要投入在实验和用户沟通' },
          { label: '总运营 ROI', value: '0.9', detail: '重点不在盈利，而在验证效率' },
        ],
        level2: [
          { label: '低成本验证', score: '强', detail: '试验成本仍在合理区间。', status: 'strong' },
          { label: '种子用户共创', score: '观察', detail: '反馈热度高，但商业信号还弱。', status: 'watch' },
        ],
        level3: [
          { label: '实验完成率', value: '86%', detail: '说明团队已经能保持高密度试验节奏。' },
          { label: '单次实验周期', value: '7 天', detail: '是探索业务能否低成本推进的关键。' },
        ],
        recommend: '继续用小流量和种子用户快速试错，不建议重型营销投入。',
      },
    },
  },
  technology: {
    label: '技术支撑',
    lens: '支撑',
    audience: '技术支持部',
    question: '技术支持提供了哪些支撑？创造了什么价值？',
    summary: '把技术从“做了多少需求”翻译成“创造了多少经营价值”的语言。',
    promise: '不是证明技术做了很多，而是证明哪些能力真正推动了经营结果。',
    content: {
      validation: {
        headline: '验证期中的技术价值，重点是让业务能更快试、低成本试。',
        summary: '二级重点切到快速验证、数据闭环和低成本试验支撑。',
        level1: [
          { label: '技术覆盖价值', value: '61%', detail: '关键试验链路已有技术支撑' },
          { label: '技术投入产出', value: 'ROI 1.9', detail: '更多价值体现在缩短验证周期' },
          { label: '技术效率价值', value: '响应 2.4 天', detail: '能支持周级试验节奏' },
        ],
        level2: [
          { label: '快速验证', score: '强', detail: '实验支持和快速上线是当前最大价值。', status: 'strong' },
          { label: '数据闭环', score: '建设中', detail: '部分关键指标尚未全链路打通。', status: 'build' },
        ],
        level3: [
          { label: '实验平台支撑数', value: '24 项', detail: '说明技术已成为验证节奏的关键支点。' },
          { label: '数据回传延迟', value: 'T+1', detail: '影响经营判断能否及时形成。' },
        ],
        recommend: '当前最值得投的不是重平台，而是试验底座、数据回传和低代码配置能力。',
      },
      mature: {
        headline: '成熟业务中的技术价值，重点是降本增效、复用和稳定性。',
        summary: '二级切到降本增效、能力复用和稳定性保障。',
        level1: [
          { label: '技术覆盖价值', value: '76%', detail: '核心流水与技术支撑动作相关' },
          { label: '技术投入产出', value: 'ROI 4.4', detail: '节省成本与赋能收入合计 1,120 万' },
          { label: '技术效率价值', value: '复用率 63%', detail: '平台与自动化能力持续拉高效率' },
        ],
        level2: [
          { label: '降本增效', score: '强', detail: '自动化触达和配置平台已大幅替代人工。', status: 'strong' },
          { label: '稳定性保障', score: '观察', detail: '大促期间仍需额外风险兜底。', status: 'watch' },
        ],
        level3: [
          { label: '自动化覆盖率', value: '58%', detail: '直接决定节省人力与响应速度。' },
          { label: '故障拦截成功率', value: '92%', detail: '稳定性直接影响口碑和利润质量。' },
        ],
        recommend: '继续投资自动化和平台复用能力，同时补齐高风险链路预警。',
      },
      scale: {
        headline: '放量期中的技术价值，重点是承载增长、提效转化和提升归因精度。',
        summary: '二级重点转向放量支撑、触达与转化提效、归因与平台化。',
        level1: [
          { label: '技术覆盖价值', value: '84%', detail: '大部分新增与转化链路已与技术能力绑定' },
          { label: '技术投入产出', value: 'ROI 3.2', detail: '赋能收入快速增长，但容量成本同步上升' },
          { label: '技术效率价值', value: '弹性保障 91%', detail: '核心链路仍需继续扩容' },
        ],
        level2: [
          { label: '放量支撑', score: '观察', detail: '高并发和弹性能力仍有提升空间。', status: 'watch' },
          { label: '触达与转化提效', score: '强', detail: '策略与实验能力已开始直接提升转化。', status: 'strong' },
        ],
        level3: [
          { label: '峰值承载率', value: '91%', detail: '说明系统容量正在成为增长边界。' },
          { label: '归因覆盖率', value: '68%', detail: '决定预算和资源能否更精准配置。' },
        ],
        recommend: '把扩容、归因和策略平台建设作为放量期核心技术投资。',
      },
      explore: {
        headline: '探索期中的技术价值，重点是低成本试验底座和能力沉淀。',
        summary: '二级切到试验底座、快速迭代和能力资产沉淀。',
        level1: [
          { label: '技术覆盖价值', value: '49%', detail: '聚焦高价值实验场景' },
          { label: '技术投入产出', value: 'ROI 1.2', detail: '价值主要体现在缩短试错时间' },
          { label: '技术效率价值', value: '配置化率 46%', detail: '基础底座正在成形' },
        ],
        level2: [
          { label: '试验底座', score: '强', detail: '低代码和配置化能力开始降低试验成本。', status: 'strong' },
          { label: '能力资产沉淀', score: '观察', detail: '部分经验仍停留在人和项目上。', status: 'watch' },
        ],
        level3: [
          { label: '配置化实验数', value: '17 项', detail: '说明底座已经开始承接业务创新。' },
          { label: '版本迭代周期', value: '5 天', detail: '是低成本探索能否跑得动的关键。' },
        ],
        recommend: '继续加强低代码试验底座和能力沉淀，让探索成果变成组织资产。',
      },
    },
  },
} as const;

const levelCards = [
  ['一级指标', '看模块整体结果', '帮助管理层快速判断整体表现好不好。'],
  ['二级指标', '看结构强弱', '帮助识别哪些业务构成更强、哪些需要调整。'],
  ['三级指标', '看原因解释', '帮助定位问题原因并形成后续优化动作。'],
] as const;

const aiJourney = [
  ['Data Flow', '先把项目、阶段、动作、支撑、投入、产出连起来'],
  ['AI Flow', '再让系统做解释、预判、预警和资源建议'],
  ['Workflow', '最后把建议送进复盘、跟进和协同闭环'],
] as const;

const aiCaps = [
  '经营解释：自动总结结果变化，告诉管理层最可能的原因。',
  '经营预判：对活动、投放、版本和经营动作做效果预估。',
  '风险预警：提前识别 ROI 下滑、成本异常和支撑不足。',
  '资源建议：基于 ROI、战略价值和数据置信度给出加投或控本建议。',
];
function App() {
  const [activeStage, setActiveStage] = useState<StageKey>('validation');
  const [activeModule, setActiveModule] = useState<ModuleKey>('business');

  const stage = stageMap[activeStage];
  const module = moduleMap[activeModule];
  const content = module.content[activeStage];

  return (
    <div className="dashboard-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-pill">经营沙盘 Demo</span>
            <span className="hero-eyebrow">结果 · 动作 · 支撑</span>
          </div>
          <h1>把经营结果、运营动作和技术支撑放进同一张经营地图</h1>
          <p className="hero-summary-text">
            这不是一个传统报表大盘，而是一个面向管理层的价值评估沙盘。当前版本先帮助领导看懂“结果从哪里来、哪些动作值得继续投、技术到底创造了什么价值”，未来再逐步升级到经营解释、风险预警和资源建议。
          </p>
          <div className="hero-proof">
            <article><span>当前可演示价值</span><strong>统一经营视角</strong><small>先让结果、动作、支撑能够被放在同一套语言里讨论。</small></article>
            <article><span>汇报目标</span><strong>值得投资源</strong><small>因为它能把零散数据升级成经营判断，而不是再多一层统计页。</small></article>
          </div>
        </div>
        <aside className="hero-briefing">
          <section className="briefing-card">
            <span className="section-label">当前演示焦点</span>
            <h2>{stage.label}</h2>
            <p>{stage.summary}</p>
            <div className="metric-list">
              {stage.metrics.map((item) => (
                <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></article>
              ))}
            </div>
          </section>
          <section className="briefing-card accent-card">
            <span className="section-label">管理层会问</span>
            <p className="briefing-question">{stage.question}</p>
            <div className="decision-banner"><span>当前信号</span><strong>{stage.signal}</strong></div>
          </section>
        </aside>
      </header>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-label">统一方法</span>
            <h2>所有模块都按一级、二级、三级指标来讲</h2>
          </div>
          <p>一级先看整体结果，二级看结构强弱，三级解释原因。这样领导看每个模块时，能始终用同一套分析方式理解价值。</p>
        </div>
        <div className="level-grid">
          {levelCards.map(([title, subtitle, detail]) => (
            <article key={title} className="level-card"><span>{title}</span><strong>{subtitle}</strong><p>{detail}</p></article>
          ))}
        </div>
        <div className="loop-grid">
          {moduleOrder.map((key) => (
            <article key={key} className={key === activeModule ? 'loop-card active' : 'loop-card'}>
              <span>{moduleMap[key].lens}</span>
              <strong>{moduleMap[key].label}</strong>
              <p>{moduleMap[key].question}</p>
              <small>{moduleMap[key].audience}</small>
            </article>
          ))}
          <article className="loop-card closure-card"><span>闭环</span><strong>价值评估完整闭环</strong><p>结果告诉我们经营好不好，动作告诉我们为什么，支撑告诉我们哪些能力值得继续建设。</p><small>这是领导愿意投资源的核心理由。</small></article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-label">阶段适配</span>
            <h2>先选业务阶段，再看每个模块的关注点如何变化</h2>
          </div>
          <p>一级指标保持稳定，二级指标随阶段调整，三级指标负责解释变化原因。这样既能跨周期对比，也能适配业务发展差异。</p>
        </div>
        <div className="tab-row">
          {stageOrder.map((key) => (
            <button key={key} className={key === activeStage ? 'tab active' : 'tab'} type="button" onClick={() => setActiveStage(key)}>
              <span>{stageMap[key].label}</span>
              <small>{stageMap[key].tag}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="module-panel">
        <div className="module-nav">
          {moduleOrder.map((key) => (
            <button key={key} className={key === activeModule ? 'module-tab active' : 'module-tab'} type="button" onClick={() => setActiveModule(key)}>
              <span>{moduleMap[key].label}</span>
              <small>{moduleMap[key].lens}</small>
            </button>
          ))}
        </div>
        <div className="module-body">
          <div className="panel-head">
            <div>
              <span className="section-label">{module.audience} · {stage.label}</span>
              <h2>{module.question}</h2>
            </div>
            <p>{module.summary}</p>
          </div>
          <div className="story-grid">
            <article className="story-card"><span>这个模块在讲什么</span><strong>{content.headline}</strong><p>{content.summary}</p></article>
            <article className="story-card promise-card"><span>演示价值</span><strong>{module.promise}</strong><p>这部分最适合你在汇报时把指标体系翻译成管理层能听懂的经营价值。</p></article>
          </div>
          <div className="metric-grid">
            {content.level1.map((item) => (
              <article key={item.label} className="metric-card"><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></article>
            ))}
          </div>
          <div className="analysis-grid">
            <section className="analysis-card">
              <span className="section-label">二级指标</span>
              <h3>看结构强弱与投入方向</h3>
              <div className="stack-list">
                {content.level2.map((item) => (
                  <article key={item.label} className="stack-item"><div className="stack-top"><strong>{item.label}</strong><em className={`status ${item.status}`}>{item.score}</em></div><p>{item.detail}</p></article>
                ))}
              </div>
            </section>
            <section className="analysis-card">
              <span className="section-label">三级指标</span>
              <h3>看原因解释与优化抓手</h3>
              <div className="stack-list">
                {content.level3.map((item) => (
                  <article key={item.label} className="stack-item"><div className="detail-top"><span>{item.label}</span><strong>{item.value}</strong></div><p>{item.detail}</p></article>
                ))}
              </div>
            </section>
          </div>
          <div className="recommend-card"><span className="section-label">当前汇报建议</span><strong>{content.recommend}</strong></div>
        </div>
      </section>

      <section className="panel muted-panel">
        <div className="panel-head">
          <div>
            <span className="section-label">当前版本定位</span>
            <h2>先做一个现在就能演示的理想版本</h2>
          </div>
          <p>这版 Demo 不假装所有指标已经完全打通，而是先把经营框架、阶段逻辑和价值闭环讲清楚，让领导看到“现在就能开始做，而且继续投资源会越做越值”。</p>
        </div>
        <div className="delivery-grid">
          <article><p>先证明框架价值，不依赖全量数据打通。</p></article>
          <article><p>先围绕高价值场景做局部闭环，如活动 ROI、投放转化、技术支撑价值。</p></article>
          <article><p>随着数据和语义逐步补齐，再把 AI 从解释升级到预测和资源建议。</p></article>
        </div>
      </section>

      <section className="ai-panel">
        <div className="panel-head">
          <div>
            <span className="section-label">未来 AI 化</span>
            <h2>从价值评估，升级到经营分析与决策辅助</h2>
          </div>
          <p>参考 AIP / Ontology 的方法论，但不直接照搬重平台形态。我们借的是“先建立业务对象和关系，再让 AI 进入经营判断和协同流程”的思路。</p>
        </div>
        <div className="journey-grid">
          {aiJourney.map(([title, detail]) => (
            <article key={title} className="journey-card"><span>{title}</span><p>{detail}</p></article>
          ))}
        </div>
        <div className="cap-grid">
          {aiCaps.map((item) => (
            <article key={item} className="cap-card"><p>{item}</p></article>
          ))}
        </div>
        <div className="pilot-grid">
          <article className="pilot-card"><span className="section-label">AI 试点示例</span><h3>{stage.ai.title}</h3><p><strong>观察：</strong>{stage.ai.observe}</p><p><strong>预判：</strong>{stage.ai.predict}</p><p><strong>建议：</strong>{stage.ai.action}</p></article>
          <article className="pilot-card confidence-card"><span className="section-label">输出规则</span><h3>AI 不是直接拍板，而是给可解释的判断依据</h3><p>建议必须带指标依据、业务规则、缺口提示和置信度，先做辅助判断，再逐步走向资源建议。</p><div className="confidence-chip">当前置信度：{stage.ai.confidence}</div></article>
        </div>
      </section>
    </div>
  );
}

export default App;
