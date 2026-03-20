# Auto-Proxy Skill - 自动代理切换

## 功能
当检测到网络请求失败（如 web_search）时，自动检查并切换 Clash 代理。

## Clash 配置
- API 地址：http://127.0.0.1:9090
- Secret: f2d87924a5501b21
- 默认代理节点：Digilink

## 自动化规则

### 触发条件
1. `web_search` 失败（fetch failed / network error）
2. 其他 HTTP 请求失败且检测到可能是网络限制

### 自动操作
1. 检查 Clash 是否运行（端口 9090）
2. 检查当前代理模式
3. 如果是 DIRECT，切换到 Digilink
4. 如果是 rule 模式但失败，尝试切换到 global 模式
5. 重试原请求

### 状态检查命令
```powershell
# 检查 Clash 状态
Invoke-WebRequest -Uri "http://127.0.0.1:9090/configs" -Headers @{"Authorization"="Bearer f2d87924a5501b21"}

# 检查当前代理
Invoke-WebRequest -Uri "http://127.0.0.1:9090/proxies/GLOBAL" -Headers @{"Authorization"="Bearer f2d87924a5501b21"}
```

### 切换代理命令
```powershell
# 切换到 Digilink
Invoke-WebRequest -Uri "http://127.0.0.1:9090/proxies/GLOBAL" -Method PUT -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"name":"Digilink"}'

# 切换到全局模式
Invoke-WebRequest -Uri "http://127.0.0.1:9090/configs" -Method PATCH -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"mode":"global"}'

# 切换回规则模式
Invoke-WebRequest -Uri "http://127.0.0.1:9090/configs" -Method PATCH -Headers @{"Authorization"="Bearer f2d87924a5501b21"; "Content-Type"="application/json"} -Body '{"mode":"rule"}'
```

## 日志记录
所有自动切换操作记录到 `memory/auto-proxy-log.md`
