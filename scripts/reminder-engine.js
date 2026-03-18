#!/usr/bin/env node

/**
 * 任务提醒引擎
 * 
 * 功能：
 * 1. 检查到期提醒
 * 2. 发送企业微信消息
 * 3. 更新提醒状态
 */

const fs = require('fs');
const path = require('path');

class ReminderEngine {
    constructor() {
        this.remindersFile = path.join(__dirname, '../config/reminders.json');
        this.tasksFile = path.join(__dirname, '../data/tasks.json');
        this.reminders = {};
        this.tasks = [];
    }

    // 加载数据
    async loadData() {
        try {
            this.reminders = JSON.parse(fs.readFileSync(this.remindersFile, 'utf8'));
        } catch (e) {
            console.error('加载 reminders.json 失败:', e.message);
            this.reminders = { reminders: [] };
        }

        try {
            const tasksData = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
            this.tasks = tasksData.tasks || [];
        } catch (e) {
            console.error('加载 tasks.json 失败:', e.message);
            this.tasks = [];
        }
    }

    // 保存数据
    saveData() {
        this.reminders.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.remindersFile, JSON.stringify(this.reminders, null, 2), 'utf8');
    }

    // 检查是否需要发送提醒
    checkReminders() {
        const now = new Date();
        const currentTime = now.getTime();

        console.log(`[${now.toISOString()}] 检查提醒...`);

        for (const reminder of (this.reminders.reminders || [])) {
            if (!reminder.enabled) continue;

            // 检查是否在有效期内
            const startDate = new Date(reminder.startDate);
            const endDate = new Date(reminder.endDate);
            
            if (now < startDate || now > endDate) {
                continue;
            }

            // 检查是否到期
            const nextSend = new Date(reminder.nextSend);
            
            if (currentTime >= nextSend.getTime()) {
                console.log(`提醒到期：${reminder.title}`);
                this.sendReminder(reminder);
                
                // 计算下次提醒时间（工作日每 2 天）
                reminder.nextSend = this.calculateNextWeekdayReminder(nextSend, 2);
                reminder.lastSent = now.toISOString();
                reminder.sentCount = (reminder.sentCount || 0) + 1;
            }
        }

        this.saveData();
    }

    // 计算下次提醒时间（工作日，跳过周末）
    calculateNextWeekdayReminder(lastDate, daysInterval) {
        let nextDate = new Date(lastDate);
        let daysAdded = 0;

        while (daysAdded < daysInterval) {
            nextDate.setDate(nextDate.getDate() + 1);
            const dayOfWeek = nextDate.getDay();
            
            // 跳过周末（0=周日，6=周六）
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                daysAdded++;
            }
        }

        // 设置时间为 9:00
        nextDate.setHours(9, 0, 0, 0);

        // 时区调整（Asia/Shanghai = UTC+8）
        const offset = 8 * 60 * 60 * 1000;
        nextDate = new Date(nextDate.getTime() - offset);

        return nextDate.toISOString();
    }

    // 发送提醒消息
    async sendReminder(reminder) {
        const task = this.tasks.find(t => t.id === reminder.taskId);
        if (!task) {
            console.error(`任务不存在：${reminder.taskId}`);
            return;
        }

        // 计算剩余天数
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        // 计算进度
        const totalSubtasks = task.subtasks?.length || 0;
        const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
        const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

        // 替换消息模板变量
        let message = reminder.message
            .replace('{days_left}', daysLeft)
            .replace('{progress}', progress);

        // 添加子任务进度详情
        if (totalSubtasks > 0) {
            message += `\n\n📝 子任务进度：${completedSubtasks}/${totalSubtasks}`;
            
            const pending = task.subtasks.filter(s => !s.done);
            if (pending.length > 0 && pending.length <= 3) {
                message += '\n待完成：\n' + pending.map(s => `  - ${s.title}`).join('\n');
            }
        }

        console.log(`发送提醒给 ${reminder.recipient}:`);
        console.log(message);

        // 实际发送消息（这里调用企业微信 API）
        // await this.sendWeComMessage(reminder.recipient, message);
    }

    // 发送企业微信消息（示例）
    async sendWeComMessage(recipient, message) {
        // 这里集成企业微信 API
        // 可以使用 openclaw 的企业微信插件发送
        console.log(`[企业微信] 发送给 ${recipient}:`);
        console.log(message);
    }

    // 运行提醒引擎
    async run() {
        console.log('🔔 启动提醒引擎...');
        await this.loadData();
        this.checkReminders();
        console.log('✅ 提醒检查完成');
    }
}

// CLI 入口
if (require.main === module) {
    const engine = new ReminderEngine();
    engine.run().catch(console.error);
}

module.exports = ReminderEngine;
