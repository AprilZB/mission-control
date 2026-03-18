# 多 Agent 可视化管理系统 - 设计方案

## 架构概述

```
┌─────────────────────────────────────────────────────────────────┐
│                    Mission Control Dashboard                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Agent 状态  │  │  任务看板   │  │  性能指标   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Agent 注册中心 (agents.json)                │
│  - Agent ID、名称、类型                                          │
│  - 能力列表                                                       │
│  - 当前状态 (active/idle/busy)                                   │
│  - 工作区路径                                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      任务分配引擎                                │
│  - 根据任务类型自动分配 Agent                                    │
│  - 负载均衡                                                       │
│  - 优先级队列                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 任务数据结构扩展

```json
{
  "tasks": [
    {
      "id": "task_001",
      "title": "处理客户咨询",
      "description": "自动回复企业微信客户消息",
      "status": "in_progress",
      "assignedAgent": "main-assistant",
      "agentType": "wecom",
      "priority": "high",
      "subtasks": [
        { "id": "sub_001", "title": "读取消息", "done": true, "agent": "main-assistant" },
        { "id": "sub_002", "title": "分析意图", "done": false, "agent": "main-assistant" },
        { "id": "sub_003", "title": "生成回复", "done": false, "agent": "main-assistant" }
      ],
      "agentContext": {
        "sessionId": "wecom:ZhangBo",
        "capabilities": ["search", "reply", "escalate"],
        "lastActive": "2026-03-18T13:50:00Z"
      },
      "metrics": {
        "createdAt": "2026-03-18T10:00:00Z",
        "startedAt": "2026-03-18T10:05:00Z",
        "completedAt": null,
        "duration": 300
      }
    }
  ],
  "agentStats": {
    "main-assistant": {
      "tasksCompleted": 15,
      "avgResponseTime": 45,
      "successRate": 0.98
    }
  }
}
```

## Dashboard 增强功能

### 1. Agent 状态面板
- 🟢 在线 (active)
- 🟡 空闲 (idle)
- 🔴 忙碌 (busy)
- ⚫ 离线 (offline)

### 2. 任务分配视图
- 按 Agent 分组显示任务
- 显示每个 Agent 的负载
- 支持手动重新分配

### 3. 性能指标
- 任务完成数
- 平均响应时间
- 成功率
- 活跃时间段

### 4. Agent 能力标签
- `web_search` - 网络搜索
- `file_operations` - 文件操作
- `coding` - 代码编写
- `documentation` - 文档处理
- `communication` - 消息通信

## 实现步骤

1. **扩展 agents.json** - 定义所有 Agent 及其能力
2. **修改 Dashboard HTML** - 添加 Agent 状态面板
3. **实现任务分配逻辑** - 根据能力自动分配
4. **添加性能追踪** - 记录任务执行指标
5. **创建监控视图** - 实时显示 Agent 状态

## 使用场景

### 场景 1: 自动任务分配
```
用户创建任务 → 分析任务类型 → 匹配 Agent 能力 → 分配给最佳 Agent
```

### 场景 2: 负载均衡
```
检测 Agent 负载 → 如果 busy → 寻找 idle Agent → 重新分配
```

### 场景 3: 任务升级
```
任务超时 → 触发告警 → 分配给更高级 Agent → 通知管理员
```

## 配置文件

- `data/agents.json` - Agent 注册表
- `data/tasks.json` - 任务列表（扩展后）
- `data/agent-stats.json` - 性能统计
- `config/agent-routes.json` - 任务路由规则
