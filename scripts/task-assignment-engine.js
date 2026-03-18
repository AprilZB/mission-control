#!/usr/bin/env node

/**
 * 多 Agent 任务分配引擎
 * 
 * 功能：
 * 1. 根据任务内容自动匹配 Agent
 * 2. 负载均衡
 * 3. 任务升级处理
 * 4. 性能统计
 */

const fs = require('fs');
const path = require('path');

class TaskAssignmentEngine {
    constructor() {
        this.agentsFile = path.join(__dirname, '../data/agents.json');
        this.tasksFile = path.join(__dirname, '../data/tasks.json');
        this.routesFile = path.join(__dirname, '../config/agent-routes.json');
        this.statsFile = path.join(__dirname, '../data/agent-stats.json');
        
        this.agents = [];
        this.tasks = [];
        this.routes = {};
        this.stats = {};
    }

    // 加载数据
    async loadData() {
        try {
            this.agents = JSON.parse(fs.readFileSync(this.agentsFile, 'utf8')).agents || [];
        } catch (e) {
            console.error('加载 agents.json 失败:', e.message);
            this.agents = [];
        }

        try {
            this.tasks = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8')).tasks || [];
        } catch (e) {
            console.error('加载 tasks.json 失败:', e.message);
            this.tasks = [];
        }

        try {
            this.routes = JSON.parse(fs.readFileSync(this.routesFile, 'utf8'));
        } catch (e) {
            console.error('加载 agent-routes.json 失败:', e.message);
            this.routes = { rules: [], defaultAction: { assignTo: 'main-assistant' } };
        }

        try {
            this.stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8')) || {};
        } catch (e) {
            this.stats = {};
        }
    }

    // 保存数据
    saveData() {
        fs.writeFileSync(this.tasksFile, JSON.stringify({ tasks: this.tasks, lastUpdated: new Date().toISOString() }, null, 2));
        fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2), 'utf8');
    }

    // 关键词匹配
    matchKeywords(text, keywords) {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    // 匹配任务规则
    matchTaskRules(task) {
        const searchText = `${task.title} ${task.description} ${task.tags?.join(' ') || ''}`.toLowerCase();
        
        // 按优先级排序规则
        const sortedRules = [...(this.routes.rules || [])].sort((a, b) => a.priority - b.priority);

        for (const rule of sortedRules) {
            const conditions = rule.conditions || {};
            let match = false;

            // 关键词匹配
            if (conditions.keywords && this.matchKeywords(searchText, conditions.keywords)) {
                match = true;
            }

            // 任务类型匹配
            if (conditions.taskTypes && conditions.taskTypes.includes(task.type)) {
                match = true;
            }

            // 渠道匹配
            if (conditions.channels && conditions.channels.includes(task.channel)) {
                match = true;
            }

            if (match) {
                return rule.action;
            }
        }

        return this.routes.defaultAction || { assignTo: 'main-assistant' };
    }

    // 获取 Agent 当前负载
    getAgentLoad(agentId) {
        return this.tasks.filter(t => 
            t.assignedAgent === agentId && 
            !['done', 'archived'].includes(t.status)
        ).length;
    }

    // 获取 Agent 状态
    getAgentStatus(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        return agent?.status || 'offline';
    }

    // 选择最佳 Agent（考虑负载均衡）
    selectBestAgent(action, task) {
        const primaryAgent = action.assignTo;
        const fallbackAgents = action.fallbackAgents || [];

        // 检查主 Agent 是否可用
        if (this.isAgentAvailable(primaryAgent)) {
            return primaryAgent;
        }

        // 尝试备选 Agent
        for (const agentId of fallbackAgents) {
            if (this.isAgentAvailable(agentId)) {
                return agentId;
            }
        }

        // 负载均衡：找最空闲的 Agent
        const availableAgents = this.agents.filter(a => 
            a.status !== 'offline' && 
            this.getAgentLoad(a.id) < (this.routes.loadBalancing?.maxTasksPerAgent || 10)
        );

        if (availableAgents.length > 0) {
            // 按负载排序，选择负载最低的
            availableAgents.sort((a, b) => this.getAgentLoad(a.id) - this.getAgentLoad(b.id));
            return availableAgents[0].id;
        }

        // 没有可用 Agent，返回主 Agent
        return primaryAgent;
    }

    // 检查 Agent 是否可用
    isAgentAvailable(agentId) {
        const status = this.getAgentStatus(agentId);
        if (status === 'offline') return false;

        const load = this.getAgentLoad(agentId);
        const maxLoad = this.routes.loadBalancing?.maxTasksPerAgent || 10;

        return load < maxLoad;
    }

    // 分配任务
    assignTask(task) {
        const action = this.matchTaskRules(task);
        const selectedAgent = this.selectBestAgent(action, task);

        task.assignedAgent = selectedAgent;
        task.autoAssigned = true;
        task.assignedAt = new Date().toISOString();
        task.assignedBy = 'auto-assignment-engine';

        // 如果需要自动启动
        if (action.autoStart && task.status === 'backlog') {
            task.status = 'in_progress';
            task.startedAt = new Date().toISOString();
        }

        console.log(`任务 "${task.title}" 分配给 ${selectedAgent}`);
        return task;
    }

    // 处理新任务
    processNewTask(task) {
        if (!task.assignedAgent || task.autoAssigned) {
            return this.assignTask(task);
        }
        return task;
    }

    // 检查任务升级
    checkEscalation() {
        const escalationConfig = this.routes.escalation || {};
        if (!escalationConfig.enabled) return;

        const timeoutMs = (escalationConfig.timeoutMinutes || 30) * 60 * 1000;
        const now = Date.now();

        for (const task of this.tasks) {
            if (task.status === 'in_progress' && task.startedAt) {
                const startTime = new Date(task.startedAt).getTime();
                const duration = now - startTime;

                if (duration > timeoutMs) {
                    console.log(`任务 "${task.title}" 超时，触发升级`);
                    
                    // 升级到主助手
                    task.assignedAgent = escalationConfig.escalateTo || 'main-assistant';
                    task.escalated = true;
                    task.escalatedAt = new Date().toISOString();
                    task.previousAgent = task.previousAgent || task.assignedAgent;

                    // 发送通知
                    if (escalationConfig.notifyOnEscalation) {
                        this.sendEscalationNotification(task);
                    }
                }
            }
        }
    }

    // 发送升级通知
    sendEscalationNotification(task) {
        console.log(`[通知] 任务 "${task.title}" 已从 ${task.previousAgent} 升级到 ${task.assignedAgent}`);
        // 实际实现中可以发送邮件、消息等
    }

    // 更新 Agent 统计
    updateAgentStats(agentId, taskCompleted = false) {
        if (!this.stats[agentId]) {
            this.stats[agentId] = {
                totalAssigned: 0,
                totalCompleted: 0,
                totalEscalated: 0,
                avgCompletionTime: 0,
                successRate: 100
            };
        }

        const stats = this.stats[agentId];
        stats.totalAssigned++;

        if (taskCompleted) {
            stats.totalCompleted++;
            stats.successRate = Math.round((stats.totalCompleted / stats.totalAssigned) * 100);
        }
    }

    // 运行分配引擎
    async run() {
        console.log('🚀 启动任务分配引擎...');
        await this.loadData();

        // 处理未分配的任务
        const unassignedTasks = this.tasks.filter(t => !t.assignedAgent);
        for (const task of unassignedTasks) {
            this.processNewTask(task);
        }

        // 检查升级
        this.checkEscalation();

        // 保存更改
        this.saveData();

        console.log(`✅ 处理完成：${unassignedTasks.length} 个新任务已分配`);
    }
}

// CLI 入口
if (require.main === module) {
    const engine = new TaskAssignmentEngine();
    engine.run().catch(console.error);
}

module.exports = TaskAssignmentEngine;
