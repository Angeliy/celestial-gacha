# Celestial Gacha 测试报告

## 1. 测试环境

- 项目：Celestial Gacha
- 技术栈：React + Vite + TypeScript + Tailwind CSS
- 测试框架：Vitest
- 测试日期：2026-06-07

## 2. 自动化测试范围

自动化测试覆盖抽卡核心规则：

- SSR 90 抽保底。
- 自然抽中 SSR 后保底重置。

测试文件：

```text
src/gacha.test.ts
```

## 3. 自动化测试命令

```bash
npm run test
npm run build
npm run test:ci
```

## 4. 最新测试结果

```text
npm run test
Test Files  1 passed (1)
Tests       2 passed (2)

npm run build
Vite production build passed
```

## 5. 自动化测试用例

| 编号 | 用例 | 预期结果 | 状态 |
| --- | --- | --- | --- |
| TC-AUTO-001 | 连续 90 抽未自然命中 SSR | 第 90 抽必定 SSR，保底归零 | 通过 |
| TC-AUTO-002 | 第一次自然命中 SSR | 抽卡结果为 SSR，保底归零 | 通过 |

## 6. 页面手动验收流程

| 编号 | 页面 | 操作 | 预期结果 | 状态 |
| --- | --- | --- | --- | --- |
| TC-MANUAL-001 | 祈愿池首页 | 打开页面 | 显示国风水墨祈愿池 Banner | 待手动复核 |
| TC-MANUAL-002 | 祈愿池首页 | 点击 Banner 的 Wish x10 | 跳转抽卡页并出现 10 条结果 | 待手动复核 |
| TC-MANUAL-003 | 抽卡页面 | 点击单抽 | 新增 1 条结果，累计抽数增加 | 待手动复核 |
| TC-MANUAL-004 | 抽卡页面 | 点击重置 | 抽数、记录、保底恢复初始状态 | 待手动复核 |
| TC-MANUAL-005 | 统计页面 | 查看统计卡片 | 总抽数、SSR 率、当前保底与记录一致 | 待手动复核 |
| TC-MANUAL-006 | 角色图鉴 | 查看图鉴 | 已抽到角色显示档案，未抽到角色显示未显影 | 待手动复核 |

## 7. data-testid 覆盖

主要测试定位点：

- `app-brand`
- `essence-pill`
- `nav-home`
- `nav-summon`
- `nav-stats`
- `nav-codex`
- `pool-wish-ten-tianming`
- `pool-wish-ten-jianxin`
- `pull-one-button`
- `pull-ten-button`
- `reset-button`
- `stats-total-pulls`
- `stats-ssr-rate`
- `codex-progress`

## 8. 结论

当前版本核心抽卡逻辑自动化测试通过，生产构建通过。页面交互流程已经具备手动验收路径，可用于课程作业演示和录屏说明。
