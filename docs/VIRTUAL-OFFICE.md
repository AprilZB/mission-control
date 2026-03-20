# 虚拟办公室 - 完整功能文档

## 🎯 概述

虚拟办公室是一个基于 Mission Control 的多 Agent 可视化管理系统，提供：
- **3D 虚拟办公室界面** - 每个 Agent 有自己的工位
- **实时任务看板** - 可视化任务状态和进度
- **智能任务分配** - 基于规则和负载均衡自动分配
- **性能统计** - 追踪每个 Agent 的工作效率

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    虚拟办公室 Dashboard                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Agent 列表   │  │  办公室视图   │  │  任务详情    │          │
│  │  (左侧面板)  │  │  (中间区域)  │  │  (右侧面板)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (data/)                              │
│  - agents.json      Agent 注册表和状态                           │
│  - tasks.json       任务列表                                     │
│  - agent-stats.json Agent 性能统计                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    任务分配引擎 (scripts/)                       │
│  - task-assignment-engine.js  自动分配逻辑                      │
│  - 关键词匹配、负载均衡、任务升级                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   路由配置 (config/)                             │
│  - agent-routes.json  分配规则和策略                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 文件结构

```
workspace/
├── index.html                      # 虚拟办公室 Dashboard
├── data/
│   ├── agents.json                 # Agent 注册表
│   ├── tasks.json                  # 任务列表
│   └── agent-stats.json            # Agent 统计
├── config/
│   └── agent-routes.json           # 任务分配规则
├── scripts/
│   └── task-assignment-engine.js   # 任务分配引擎
└── docs/
    └── VIRTUAL-OFFICE.md           # 本文档
```

---

## 🤖 Agent 配置

### agents.json 结构

```json
{
  "agents": [
    {
      "id": "main-assistant",
      "name": "主助手",
      "type": "wecom",
      "status": "active",
      "avatar": "🤖",
      "capabilities": ["task_management", "web_search", "file_operations"],
      "workspace": "~/.openclaw/workspace",
      "model": "xiaolongxia/qwen3.5-plus",
      "maxLoad": 10,
      "currentLoad": 3
    }
  ],
  "lastUpdated": "2026-03-18T13:55:00Z"
}
```

### Agent 状态说明

| 状态 | 说明 | 颜色 |
|------|------|------|
| `active` | 正在执行任务 | 🟢 绿色 |
| `busy` | 高负载状态 | 🟡 黄色 |
| `idle` | 空闲可分配 | 🔵 蓝色 |
| `offline` | 离线不可用 | 🔴 红色 |

---

## 📋 任务分配规则

### agent-routes.json 配置

```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "企业微信消息处理",
      "priority": 1,
      "conditions": {
        "keywords": ["企业微信", "wecom", "客户消息"],
        "channels": ["wecom"],
        "taskTypes": ["communication"]
      },
      "action": {
        "assignTo": "main-assistant",
        "fallbackAgents": ["docs-assistant"],
        "autoStart": true
      }
    }
  ],
  "loadBalancing": {
    "enabled": true,
    "strategy": "round_robin_with_load",
    "maxTasksPerAgent": 10
  },
  "escalation": {
    "enabled": true,
    "timeoutMinutes": 30,
    "escalateTo": "main-assistant"
  }
}
```

### 分配流程

1. **关键词匹配** - 扫描任务标题、描述、标签
2. **规则优先级** - 按 priority 升序匹配
3. **Agent 选择** - 主 Agent → 备选 Agent → 负载均衡
4. **自动启动** - 根据 autoStart 决定是否立即开始

---

## 🎨 Dashboard 功能

### 1. 左侧面板 - Agent 团队

显示所有 Agent 的状态和统计：
- 头像和名称
- 实时状态（在线/忙碌/空闲/离线）
- 完成任务数、平均用时、成功率

**点击 Agent 卡片**：筛选该 Agent 的任务

### 2. 中间区域 - 办公室视图

每个 Agent 一个工位（Desk），显示：
- Agent 头像和状态徽章
- 当前任务列表
- 任务进度条
- 优先级标识（红/黄/绿）

**点击工位**：查看该 Agent 的所有任务

**点击任务卡片**：在右侧查看详情

### 3. 右侧面板 - 任务详情

显示选中任务的完整信息：
- 任务标题、状态、优先级
- 负责 Agent
- 任务描述
- 子任务列表（可勾选完成）
- 操作按钮（开始/完成）

### 4. 顶部导航

- **办公室视图** - 当前默认视图
- **任务看板** - 传统 Kanban 视图（待实现）
- **Agent 管理** - Agent 配置页面（待实现）
- **统计报表** - 数据分析页面（待实现）

---

## 🚀 使用指南

### 创建新任务

1. 点击右上角 **➕ 新建任务** 按钮
2. 填写表单：
   - 任务标题（必填）
   - 分配给 Agent（必填，或留空自动分配）
   - 优先级（高/中/低）
   - 任务描述
   - 项目分类
3. 点击 **创建任务**

### 自动分配任务

如果创建任务时不指定 Agent，系统会：

1. 运行任务分配引擎
2. 匹配关键词和规则
3. 选择最合适的 Agent
4. 设置 `autoAssigned: true` 标记

### 手动分配任务

在任务详情中：
1. 点击任务卡片
2. 在右侧面板选择 Agent
3. 点击 **开始任务**

### 监控任务进度

- **进度条** - 显示子任务完成比例
- **状态徽章** - 实时状态指示
- **Agent 状态** - 工作中/忙碌/空闲

---

## 📊 性能统计

### agent-stats.json 指标

```json
{
  "main-assistant": {
    "totalAssigned": 15,
    "totalCompleted": 15,
    "totalEscalated": 0,
    "avgCompletionTime": 45,
    "successRate": 100,
    "lastActive": "2026-03-18T13:50:00Z",
    "specialties": ["task_management", "web_search"]
  }
}
```

### 指标说明

| 指标 | 说明 |
|------|------|
| `totalAssigned` | 总分配任务数 |
| `totalCompleted` | 总完成任务数 |
| `totalEscalated` | 总升级任务数（超时转交） |
| `avgCompletionTime` | 平均完成时间（秒） |
| `successRate` | 成功率（%） |
| `lastActive` | 最后活跃时间 |
| `specialties` | 专长领域 |

---

## ⚙️ 高级配置

### 负载均衡策略

```json
"loadBalancing": {
  "enabled": true,
  "strategy": "round_robin_with_load",  // 或 "least_loaded"
  "maxTasksPerAgent": 10,
  "considerAgentStatus": true,
  "considerCurrentLoad": true
}
```

### 任务升级规则

```json
"escalation": {
  "enabled": true,
  "timeoutMinutes": 30,
  "escalateTo": "main-assistant",
  "notifyOnEscalation": true
}
```

当任务超过 30 分钟未完成：
1. 自动转交给主助手
2. 记录升级事件
3. 发送通知（如配置）

---

## 🔧 运行任务分配引擎

### 手动运行

```bash
node scripts/task-assignment-engine.js
```

### 自动运行（推荐）

在 HEARTBEAT.md 中添加：

```markdown
## 任务分配检查

每 5 分钟运行一次任务分配引擎：
- 检查未分配的任务
- 自动分配合适的 Agent
- 检查超时任务并升级
```

### 集成到 OpenClaw

创建 hook 或 cron 任务定期执行：

```javascript
// 示例：每 5 分钟检查一次
setInterval(() => {
  const engine = new TaskAssignmentEngine();
  engine.run();
}, 5 * 60 * 1000);
```

---

## 🎨 自定义主题

在 index.html 中修改 CSS 变量：

```css
:root {
  --bg-primary: #0f172a;      /* 主背景色 */
  --bg-secondary: #1e293b;    /* 次级背景 */
  --accent-blue: #3b82f6;     /* 主色调 */
  --accent-green: #10b981;    /* 成功色 */
  --accent-red: #ef4444;      /* 警告色 */
}
```

---

## 📱 响应式设计

Dashboard 支持多种屏幕尺寸：

- **桌面端** (>1400px)：三栏布局
- **平板端** (1000-1400px)：两栏布局（隐藏详情面板）
- **移动端** (<1000px)：单栏布局

---

## 🔗 API 集成

### 从 GitHub 加载数据

Dashboard 会自动从 GitHub 加载：
- `https://raw.githubusercontent.com/AprilZB/mission-control/master/data/agents.json`
- `https://raw.githubusercontent.com/AprilZB/mission-control/master/data/tasks.json`

### 本地测试模式

如果加载失败，会使用内置的模拟数据。

---

## 🐛 故障排查

### Dashboard 不显示数据

1. 检查 GitHub Pages 是否启用
2. 确认 data/ 目录已推送
3. 浏览器控制台查看错误

### 任务分配不工作

1. 检查 agent-routes.json 格式
2. 确认关键词匹配正确
3. 查看引擎日志输出

### Agent 状态不更新

1. 手动刷新页面
2. 检查自动刷新间隔（默认 30 秒）
3. 确认 agents.json 已提交

---

## 📝 待开发功能

- [ ] 任务看板视图（Kanban）
- [ ] Agent 管理页面
- [ ] 统计报表图表
- [ ] WebSocket 实时更新
- [ ] 拖拽任务重新分配
- [ ] 任务依赖关系
- [ ] Agent 能力学习优化

---

## 📞 支持

- **GitHub Issues**: https://github.com/AprilZB/mission-control/issues
- **Dashboard**: https://aprilzb.github.io/mission-control/
- **文档**: workspace/docs/ 目录

---

_最后更新：2026-03-18_
