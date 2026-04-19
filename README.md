# 简单记账

一个用 `Vite + React + TypeScript` 实现的个人记账 MVP。

当前版本聚焦 3 个核心能力：

- 快速新增收入 / 支出记录
- 按日期查看历史记录
- 查看月度统计

数据保存在浏览器本地 `localStorage`，刷新页面后不会丢失。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址通常为：

```txt
http://localhost:5173
```

## 构建产物

```bash
npm run build
```

构建成功后，静态文件会输出到 `dist/`。

## 目录结构

```txt
src/
  components/
    EntryForm.tsx
    RecordList.tsx
    MonthlyStatsPanel.tsx
  utils/
    records.ts
    storage.ts
  App.tsx
  App.css
  index.css
  main.tsx
  types.ts
```

## 当前设计取舍

- 先不用登录和后端，降低 MVP 复杂度
- 先不用 React Router，避免本地和部署阶段引入额外问题
- 先用 `localStorage` 验证主流程，后面再考虑同步能力
