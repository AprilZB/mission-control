# Webhook 配置指南 - Mission Control

## 当前状态 ✅

- **Tailscale Funnel**: 已启用
  - URL: `https://ap-dev.tail7de964.ts.net`
  - 代理：`http://127.0.0.1:18789` (OpenClaw Gateway)
  
- **Webhook Secret**: 已配置
  - 位置：`~/.clawdbot/secrets/github-webhook-secret`
  - 值：`mnrb5a46p9d8etxzfhvlc07ysiwgo3quk1j2`

- **Transform**: 已安装
  - 文件：`~/.clawdbot/hooks-transforms/github-mission-control.mjs`

## 配置步骤

### 1. GitHub Webhook 设置

访问你的 Mission Control 仓库：https://github.com/AprilZB/mission-control

1. 进入 **Settings** → **Webhooks** → **Add webhook**
2. 配置如下：
   - **Payload URL**: `https://ap-dev.tail7de964.ts.net/hook/mission-control`
   - **Content type**: `application/json`
   - **Secret**: `mnrb5a46p9d8etxzfhvlc07ysiwgo3quk1j2`
   - **Events**: 选择 **Just the push event**

3. 点击 **Add webhook**

### 2. 验证 Webhook

在 GitHub webhook 页面，查看最近的 Deliveries：
- 绿色 ✓ 表示成功
- 红色 ✗ 表示失败（点击查看详情）

### 3. 测试流程

1. 在 GitHub 上编辑 `data/tasks.json`
2. 将任务的 `status` 改为 `in_progress`
3. 提交更改
4. 等待 webhook 触发（应该几秒内）
5. 检查 OpenClaw 是否收到任务

## 备选方案：轮询模式

如果 webhook 无法正常工作，可以使用轮询方案：

### 创建轮询脚本

```javascript
// scripts/poll-github.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'AprilZB/mission-control';
const BRANCH = 'master';
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

async function pollGitHub() {
  try {
    // 使用 gh CLI 获取最新内容
    const content = execSync(`gh api repos/${REPO}/contents/${TASKS_FILE}?ref=${BRANCH}`, {
      encoding: 'utf8'
    });
    
    const remote = JSON.parse(Buffer.from(content.content, 'base64').toString());
    const local = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    
    // 比较并检测变化
    if (JSON.stringify(remote) !== JSON.stringify(local)) {
      console.log('检测到任务变化！');
      fs.writeFileSync(TASKS_FILE, JSON.stringify(remote, null, 2));
      
      // 触发处理
      const newTasks = remote.tasks.filter(t => t.status === 'in_progress');
      newTasks.forEach(task => {
        console.log(`新任务：${task.title}`);
        // 这里可以调用 OpenClaw API 或发送消息
      });
    }
  } catch (error) {
    console.error('轮询失败:', error);
  }
}

// 每 30 秒轮询一次
setInterval(pollGitHub, 30000);
pollGitHub();
```

### 添加到 HEARTBEAT.md

```markdown
## Mission Control 轮询

每 30 秒检查一次 GitHub 任务变化：

```bash
node scripts/poll-github.js
```
```

## 故障排查

### 问题：Webhook 不触发

1. 检查 Tailscale Funnel 是否运行：
   ```bash
   tailscale funnel status
   ```

2. 检查 OpenClaw Gateway 是否监听 18789 端口：
   ```bash
   netstat -ano | findstr 18789
   ```

3. 查看 webhook 日志：
   ```bash
   # 在 ~/.clawdbot/hooks-transforms/ 查看调试日志
   ```

### 问题：认证失败

确保 webhook secret 匹配：
- GitHub webhook 设置中的 secret
- `~/.clawdbot/secrets/github-webhook-secret` 文件内容

### 问题：任务未处理

检查 transform 日志：
```bash
# 查看 ~/.clawdbot/data/.webhook-debug.log
```

## OpenClaw 集成方式对比

| 方式 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| **Webhook (hooks-transforms)** | 实时、低延迟、资源消耗少 | 需要公网访问、配置复杂 | ✅ 生产环境 |
| **Skills 轮询** | 简单、无需公网、易调试 | 延迟高、频繁 API 调用 | 开发测试 |
| **MCP** | 标准化协议、可扩展 | 需要 MCP 支持、配置复杂 | 未来扩展 |

## 推荐方案

**当前已配置 Webhook 方案，优先使用此方式。**

如果遇到问题，可以临时使用轮询方案作为备选。
