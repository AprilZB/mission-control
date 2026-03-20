# MEMORY.md - 长期记忆

_最后更新：2026-03-18_

---

## 📋 用户信息

- **姓名**: ZhangBo（张勃）
- **企业微信**: ZhangBo
- **时区**: Asia/Shanghai

---

## 🏠 基础设施

### OpenClaw 配置
- **工作区**: `C:\Users\AP-DEV\.openclaw\workspace`
- **网关端口**: 18789 (loopback)
- **默认模型**: xiaolongxia/qwen3.5-plus
- **企业微信机器人**: 已启用

### Tailscale
- **节点名**: ap-dev
- **Funnel URL**: https://ap-dev.tail7de964.ts.net
- **状态**: 已启用 Funnel

### GitHub
- **用户名**: AprilZB
- **已认证**: ✅ (gh CLI)

---

## 📦 项目

### Mission Control 虚拟办公室（多 Agent 管理系统）
- **仓库**: https://github.com/AprilZB/mission-control
- **Dashboard**: https://aprilzb.github.io/mission-control/ ✅ **已上线**
- **状态**: ✅ 核心功能已完成
  - ✅ GitHub Pages 已启用
  - ✅ Tailscale Funnel 已配置 (https://ap-dev.tail7de964.ts.net)
  - ✅ GitHub Webhook 已配置
  - ✅ **虚拟办公室 UI** - 3D 工位视图、Agent 状态可视化
  - ✅ **任务分配引擎** - 关键词匹配、负载均衡、自动升级
  - ✅ **性能统计** - Agent 效率追踪、成功率分析
  - ✅ **提醒系统** - 工作日定时提醒、企业微信通知
  - ⚠️ OpenClaw 无内置 webhook 处理器，需轮询方案

**核心文件**:
- `index.html` - 虚拟办公室 Dashboard（响应式设计）
- `data/agents.json` - 4 个 Agent（主助手、开发、文档、研究）
- `data/agent-stats.json` - Agent 性能统计
- `config/agent-routes.json` - 任务分配规则配置
- `config/reminders.json` - 提醒配置
- `scripts/task-assignment-engine.js` - 自动分配引擎
- `scripts/reminder-engine.js` - 提醒引擎
- `docs/VIRTUAL-OFFICE.md` - 完整功能文档

**Agent 团队**:
- 🤖 主助手 (main-assistant) - WeCom 渠道、任务管理
- 👨‍💻 开发助手 (dev-assistant) - 代码开发、调试
- 📝 文档助手 (docs-assistant) - 文档写作、翻译
- 🔬 研究助手 (research-assistant) - 网络搜索、分析

### 🔔 活跃任务提醒

**AI 架构汇报 PPT**
- 任务 ID: `ai_ppt_executive`
- 截止：2026-04-10
- 提醒：工作日每 2 天 9:00（企业微信）
- 下次提醒：2026-03-20 09:00
- 进度：0/11 子任务

### 圆通快递货架项目
- **位置**: `~/Desktop/WMS/上海青乾/`
- **文件**: 两份报价对比（20260122 vs 20260317）
- **差异**: 总价从 ¥1,469,150 → ¥3,125,070 (+112.7%)
- **报告**: 已生成详细对比报告

---

## 🔑 凭证（敏感信息）

### Webhook Secret
- **位置**: `~/.clawdbot/secrets/github-webhook-secret`
- **值**: `mnrb5a46p9d8etxzfhvlc07ysiwgo3quk1j2`

### Mission Control Token
- **位置**: `~/.clawdbot/mission-control.json`

---

## ✅ 已解决问题

1. **新闻简报详情链接缺失**（2026-03-20 修复）
   - 问题：3 月 20 日的新闻没有详情链接
   - 原因：定时任务提示词不够明确
   - 解决：更新 `cron/jobs.json` 中的提示词，强制要求每条新闻带 `[详情](链接)` 格式
   - 下次运行：2026-03-21 08:00

## ✅ 已解决问题

1. **新闻简报详情链接缺失**（2026-03-20 修复）
   - 问题：3 月 20 日的新闻没有详情链接
   - 原因：定时任务提示词不够明确
   - 解决：更新 `cron/jobs.json` 中的提示词，强制要求每条新闻带 `[详情](链接)` 格式
   - 下次运行：2026-03-21 08:00

2. **Mission Control Dashboard 导航失效**（2026-03-20 修复）
   - 问题：任务看板、Agent 管理、统计报表点击无反应
   - 原因：导航标签未绑定点击事件处理函数
   - 解决：添加 `switchView()` 函数和三个视图渲染函数（`renderTaskBoard()`、`renderAgentManagement()`、`renderStatsReport()`）
   - 文件：`index.html`

## ⚠️ 待解决问题

1. **Mission Control Webhook** - 轮询脚本已存在 (`scripts/poll-mission-control.js`)，但未启用。需确认 Webhook 是否正常工作，如不工作则启用轮询模式

---

## 📝 笔记

- 用户偏好简洁直接的沟通风格
- 使用企业微信作为主要沟通渠道
- 正在搭建自动化任务管理系统

---

_此文件应定期回顾和更新，保持信息新鲜。_
