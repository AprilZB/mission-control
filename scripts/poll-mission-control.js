/**
 * Mission Control GitHub 轮询脚本
 * 
 * 每 30 秒检查 GitHub 上的 tasks.json 变化
 * 检测到新任务时自动处理
 * 
 * 用法：node scripts/poll-mission-control.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { homedir } = require('os');

// 配置
const CONFIG = {
  repo: 'AprilZB/mission-control',
  branch: 'master',
  pollInterval: 30000, // 30 秒
  workspace: path.join(homedir(), '.openclaw', 'workspace'),
  tasksFile: 'data/tasks.json',
  snapshotFile: 'data/.tasks-snapshot.json'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// 获取远程 tasks.json
function getRemoteTasks() {
  try {
    const cmd = `gh api repos/${CONFIG.repo}/contents/${CONFIG.tasksFile}?ref=${CONFIG.branch}`;
    const output = execSync(cmd, { encoding: 'utf8' });
    const data = JSON.parse(output);
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  } catch (error) {
    log(`获取远程任务失败：${error.message}`, 'red');
    return null;
  }
}

// 获取本地快照
function getLocalSnapshot() {
  const snapshotPath = path.join(CONFIG.workspace, CONFIG.snapshotFile);
  if (!fs.existsSync(snapshotPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(snapshotPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`读取本地快照失败：${error.message}`, 'red');
    return null;
  }
}

// 保存快照
function saveSnapshot(tasks) {
  const snapshotPath = path.join(CONFIG.workspace, CONFIG.snapshotFile);
  try {
    fs.writeFileSync(snapshotPath, JSON.stringify(tasks, null, 2), 'utf8');
    log('快照已保存', 'green');
  } catch (error) {
    log(`保存快照失败：${error.message}`, 'red');
  }
}

// 比较任务变化
function detectChanges(remote, local) {
  if (!local) {
    log('首次运行，初始化快照', 'blue');
    return { new: remote.tasks || [], changed: [], completed: [] };
  }

  const changes = {
    new: [],
    changed: [],
    completed: []
  };

  const remoteMap = new Map((remote.tasks || []).map(t => [t.id, t]));
  const localMap = new Map((local.tasks || []).map(t => [t.id, t]));

  // 检测新任务和状态变化
  remote.tasks?.forEach(task => {
    const localTask = localMap.get(task.id);
    if (!localTask) {
      changes.new.push(task);
      log(`发现新任务：${task.title}`, 'blue');
    } else if (task.status !== localTask.status) {
      if (task.status === 'in_progress') {
        changes.changed.push(task);
        log(`任务进入进行中：${task.title}`, 'yellow');
      } else if (task.status === 'done') {
        changes.completed.push(task);
        log(`任务已完成：${task.title}`, 'green');
      }
    }
  });

  return changes;
}

// 处理新任务
function processTask(task) {
  log(`\n处理任务：${task.title}`, 'blue');
  log(`  描述：${task.description?.substring(0, 100) || '无描述'}`, 'blue');
  log(`  优先级：${task.priority || 'medium'}`, 'blue');
  log(`  子任务：${task.subtasks?.length || 0} 个`, 'blue');
  
  // 1. 写入处理日志
  const logFile = path.join(CONFIG.workspace, 'data/.task-processing.log');
  const logEntry = {
    timestamp: new Date().toISOString(),
    taskId: task.id,
    title: task.title,
    status: task.status,
    action: 'detected',
    assignedAgent: task.assignedAgent || 'unassigned'
  };
  
  try {
    const existing = fs.existsSync(logFile) 
      ? JSON.parse(fs.readFileSync(logFile, 'utf8')) 
      : [];
    existing.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(existing, null, 2), 'utf8');
    log('已记录到处理日志', 'green');
  } catch (error) {
    log(`写入日志失败：${error.message}`, 'red');
  }

  // 2. 发送企业微信通知（如果配置了）
  sendWeComNotification(task);
}

// 发送企业微信通知
function sendWeComNotification(task) {
  const notificationFile = path.join(CONFIG.workspace, 'data/.wecom-notifications.json');
  
  const notification = {
    timestamp: new Date().toISOString(),
    taskId: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignedAgent: task.assignedAgent,
    channel: 'wecom',
    recipient: 'ZhangBo',
    messageType: 'new_task'
  };

  try {
    const existing = fs.existsSync(notificationFile) 
      ? JSON.parse(fs.readFileSync(notificationFile, 'utf8')) 
      : [];
    existing.push(notification);
    fs.writeFileSync(notificationFile, JSON.stringify(existing, null, 2), 'utf8');
    log('已写入企业微信通知队列', 'green');
    
    // 说明：实际发送需要 OpenClaw 网关轮询这个文件并发送
    // 或者通过 OpenClaw 的 API 直接发送
    log('提示：OpenClaw 网关会轮询此文件并发送通知', 'yellow');
  } catch (error) {
    log(`写入通知失败：${error.message}`, 'red');
  }
}

// 主轮询函数
function poll() {
  log('开始轮询 GitHub...', 'blue');
  
  const remote = getRemoteTasks();
  if (!remote) {
    log('无法获取远程任务，跳过本次轮询', 'red');
    return;
  }
  
  const local = getLocalSnapshot();
  const changes = detectChanges(remote, local);
  
  if (changes.new.length === 0 && changes.changed.length === 0 && changes.completed.length === 0) {
    log('无变化', 'green');
  } else {
    log(`发现 ${changes.new.length} 个新任务，${changes.changed.length} 个状态变化`, 'yellow');
    
    // 处理新任务
    [...changes.new, ...changes.changed].forEach(processTask);
  }
  
  // 更新快照
  saveSnapshot(remote);
}

// 启动
log('Mission Control 轮询服务启动', 'green');
log(`仓库：${CONFIG.repo}`, 'blue');
log(`轮询间隔：${CONFIG.pollInterval / 1000}秒`, 'blue');

// 立即执行一次
poll();

// 定时轮询
setInterval(poll, CONFIG.pollInterval);
