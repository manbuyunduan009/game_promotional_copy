# AIP 经营沙盘 Demo

一个基于 `Vite + React + TypeScript` 搭建的经营沙盘汇报型 Demo。

当前版本的目标不是做完整系统，而是做一个可以向领导展示的“理想演示版”，帮助他们快速看懂：

- 业务经营结果怎么样
- 运营动作做了什么、哪些值得继续投入
- 技术支撑创造了什么价值
- 为什么这套体系值得继续投资源

## 当前页面重点

- 经营沙盘首页总览
- 一级、二级、三级指标分析方法
- 业务阶段切换
- 业务经营 / 运营动作 / 技术支撑三大模块切换
- 当前版本定位说明
- 未来 AI 化演进区块

## AI 化表达

未来 AI 化方向采用三层表达：

- `Data Flow`
- `AI Flow`
- `Workflow`

目标是让系统从“价值评估”逐步升级到“经营分析与决策辅助”。

## 本地运行

```bash
npm install
npm run dev
```

如果 `dev` 在当前环境里不稳定，可以先使用：

```bash
npm run build
npm run preview
```

## 目录说明

```txt
src/
  App.tsx
  App.css
  index.css
  components/
  utils/
```

其中：

- `src/App.tsx`：页面内容结构与演示数据
- `src/App.css`：页面样式
- `src/index.css`：全局视觉基底

## 迁移到新电脑

推荐方式：

1. 直接 `git clone` 当前仓库
2. 进入目录后执行 `npm install`
3. 使用 `npm run dev` 或 `npm run preview`

为了保留上下文，请同时关注：

- `PROJECT_CONTEXT.md`
- `HANDOFF_PROMPT.md`
