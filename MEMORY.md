# MEMORY.md - 长期记忆

_最后更新：2026-03-18_

---

## 📋 用户信息

- **姓名**: ZhangBo（张波）
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

### Mission Control（任务管理系统）
- **仓库**: https://github.com/AprilZB/mission-control
- **Dashboard**: https://aprilzb.github.io/mission-control/
- **状态**: ⚠️ 部分完成
  - ✅ GitHub Pages 已启用
  - ✅ Tailscale Funnel 已配置
  - ✅ GitHub Webhook 已添加
  - ⚠️ OpenClaw 无内置 webhook 处理器，需轮询方案

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

## ⚠️ 待解决问题

1. **OpenClaw Gateway 定时任务重复** - 用户反馈有两个重复任务，需清理
2. **Mission Control Webhook** - OpenClaw 无内置 GitHub webhook 处理器，需实现轮询方案

---

## 📝 笔记

- 用户偏好简洁直接的沟通风格
- 使用企业微信作为主要沟通渠道
- 正在搭建自动化任务管理系统

---

_此文件应定期回顾和更新，保持信息新鲜。_
