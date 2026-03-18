# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Clash Mi 代理配置

- API 地址：http://127.0.0.1:9090
- Secret: `f2d87924a5501b21`
- 默认节点：Digilink
- 自动脚本：`skills/auto-proxy/auto-proxy.ps1`

### 自动代理规则

当检测到网络请求失败时，自动执行：
1. 检查 Clash 是否运行
2. 如果当前是 DIRECT，切换到 Digilink
3. 重试原请求

### 快速命令（直接执行）

```powershell
# 检查状态
$resp = Invoke-WebRequest -Uri "http://127.0.0.1:9090/proxies/GLOBAL" -Headers @{"Authorization"="Bearer f2d87924a5501b21"} -UseBasicParsing; $resp.Content | ConvertFrom-Json | Select-Object now

# 启用代理（切换到 Digilink）
Invoke-WebRequest -Uri "http://127.0.0.1:9090/proxies/GLOBAL" -Method PUT -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"name":"Digilink"}'

# 切换到全局模式
Invoke-WebRequest -Uri "http://127.0.0.1:9090/configs" -Method PATCH -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"mode":"global"}'

# 切换回规则模式
Invoke-WebRequest -Uri "http://127.0.0.1:9090/configs" -Method PATCH -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"mode":"rule"}'
```

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
