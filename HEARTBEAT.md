# HEARTBEAT.md - 周期性任务检查

## 任务提醒检查

每工作日 9:00 运行提醒引擎，检查并发送任务提醒。

执行命令：
```bash
node scripts/reminder-engine.js
```

### 当前活跃提醒

- **AI 架构汇报 PPT** - 截止 2026-04-10，工作日每 2 天 9:00 提醒
- 接收人：ZhangBo
- 渠道：企业微信

---

## Mission Control 任务监控

### 方案 A：Webhook（推荐）✅

- **状态**: 已配置
- **URL**: `https://ap-dev.tail7de964.ts.net/hook/mission-control`
- **Secret**: 已配置在 `~/.clawdbot/secrets/github-webhook-secret`
- **Transform**: `~/.clawdbot/hooks-transforms/github-mission-control.mjs`

当 GitHub 上的 `tasks.json` 被推送到 "in_progress" 状态时，自动触发任务处理。

### 方案 B：轮询（备选）

如果 Webhook 不工作，启用轮询模式：

**轮询脚本**: `scripts/poll-mission-control.js`

**执行频率**: 每 30 秒

**启动命令**:
```bash
node scripts/poll-mission-control.js
```

**检测内容**:
- 新创建的任务
- 状态变为 `in_progress` 的任务
- 已完成的任务

---

## 检查频率

- **Webhook**: 实时触发
- **轮询**: 每 30 秒（如果启用）
- **提醒发送**: 工作日 9:00（自动计算，跳过周末）
- **夜间** (23:00-08:00): 仅紧急情况

---

## 故障排查

如果任务未自动处理：

1. 检查 Webhook 状态：访问 https://github.com/AprilZB/mission-control/settings/hooks
2. 查看 Deliveries 日志，确认是否有失败
3. 检查 Tailscale Funnel: `tailscale funnel status`
4. 临时启用轮询模式作为备选
