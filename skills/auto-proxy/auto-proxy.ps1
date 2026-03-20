# Auto-Proxy Switch Script
# 自动检测并切换 Clash 代理

param(
    [string]$Action = "check",
    [string]$ProxyNode = "Digilink"
)

$CLASH_API = "http://127.0.0.1:9090"
$CLASH_SECRET = "f2d87924a5501b21"
$HEADERS = @{
    "Authorization" = "Bearer $CLASH_SECRET"
    "Content-Type" = "application/json"
}

function Test-ClashRunning {
    try {
        $resp = Invoke-WebRequest -Uri "$CLASH_API/configs" -Headers $HEADERS -UseBasicParsing -TimeoutSec 3
        return $true
    } catch {
        return $false
    }
}

function Get-ClashStatus {
    try {
        $configs = Invoke-WebRequest -Uri "$CLASH_API/configs" -Headers $HEADERS -UseBasicParsing | ConvertFrom-Json
        $global = Invoke-WebRequest -Uri "$CLASH_API/proxies/GLOBAL" -Headers $HEADERS -UseBasicParsing | ConvertFrom-Json
        return @{
            Mode = $configs.mode
            Proxy = $global.now
            Running = $true
        }
    } catch {
        return @{ Running = $false }
    }
}

function Enable-Proxy {
    param([string]$Node = "Digilink", [string]$Mode = "rule")
    
    if (-not (Test-ClashRunning)) {
        Write-Host "Clash 未运行"
        return $false
    }
    
    try {
        Invoke-WebRequest -Uri "$CLASH_API/proxies/GLOBAL" -Method PUT -Headers $HEADERS -Body "{\"name\":\"$Node\"}" -UseBasicParsing | Out-Null
        Write-Host "已切换到代理节点：$Node"
    } catch {
        Write-Host "切换节点失败：$_"
    }
    
    try {
        Invoke-WebRequest -Uri "$CLASH_API/configs" -Method PATCH -Headers $HEADERS -Body "{\"mode\":\"$Mode\"}" -UseBasicParsing | Out-Null
        Write-Host "代理模式：$Mode"
    } catch {
        Write-Host "切换模式失败：$_"
    }
    
    return $true
}

function Disable-Proxy {
    if (-not (Test-ClashRunning)) {
        Write-Host "Clash 未运行"
        return $false
    }
    
    try {
        Invoke-WebRequest -Uri "$CLASH_API/proxies/GLOBAL" -Method PUT -Headers $HEADERS -Body '{"name":"DIRECT"}' -UseBasicParsing | Out-Null
        Invoke-WebRequest -Uri "$CLASH_API/configs" -Method PATCH -Headers $HEADERS -Body '{"mode":"rule"}' -UseBasicParsing | Out-Null
        Write-Host "已切换到直连"
        return $true
    } catch {
        Write-Host "切换失败：$_"
        return $false
    }
}

# 主逻辑
if ($Action -eq "check") {
    $status = Get-ClashStatus
    if ($status.Running) {
        Write-Host "Clash 运行中 | 模式：$($status.Mode) | 当前：$($status.Proxy)"
        if ($status.Proxy -eq "DIRECT" -or $status.Proxy -eq "REJECT") {
            Write-Host "当前为直连，可能需要切换代理"
        }
    } else {
        Write-Host "Clash 未运行"
    }
} elseif ($Action -eq "enable") {
    Enable-Proxy -Node $ProxyNode
} elseif ($Action -eq "disable") {
    Disable-Proxy
} elseif ($Action -eq "status") {
    Get-ClashStatus | Format-List
} elseif ($Action -eq "auto") {
    $status = Get-ClashStatus
    if (-not $status.Running) {
        Write-Host "Clash 未运行，无法自动切换"
        exit 1
    }
    if ($status.Proxy -eq "DIRECT" -or $status.Proxy -eq "REJECT") {
        Write-Host "检测到直连状态，自动切换到代理..."
        Enable-Proxy -Node $ProxyNode -Mode "rule"
    } else {
        Write-Host "已在使用代理：$($status.Proxy)"
    }
} else {
    Write-Host "用法：.\auto-proxy.ps1 [check|enable|disable|status|auto]"
}
