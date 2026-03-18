# HEARTBEAT.md - 周期性任务检查

## Mission Control 任务检查

每 30 分钟检查一次 tasks.json 是否有新任务被移动到 "in_progress" 状态。

检查项：
1. 读取 `data/tasks.json`
2. 查找状态为 `in_progress` 且未处理的任务
3. 开始执行任务并更新状态

---

## 检查频率

- **白天** (08:00-23:00): 每 30 分钟
- **夜间** (23:00-08:00): 每 2 小时（仅紧急情况）
