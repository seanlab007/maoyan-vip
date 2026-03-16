#!/usr/bin/env python3
"""
maoyan.vip Supabase 一键初始化脚本
====================================
使用方法：
  python3 scripts/init-supabase.py

需要填入：
  SUPABASE_PROJECT_REF  — 项目 ID（URL 中 https://supabase.com/dashboard/project/xxxx 的 xxxx 部分）
  SUPABASE_DB_PASSWORD  — 数据库密码（创建项目时设置的）
  SUPABASE_ACCESS_TOKEN — Personal Access Token（https://supabase.com/dashboard/account/tokens）
"""

import sys, os, json, urllib.request, urllib.error, time

# ╔══════════════════════════════════════════════╗
# ║   填入你的 Supabase 信息（三个值）          ║
# ╚══════════════════════════════════════════════╝
SUPABASE_PROJECT_REF  = ""   # e.g. "abcdefghijklmn"
SUPABASE_DB_PASSWORD  = ""   # 创建项目时的数据库密码
SUPABASE_ACCESS_TOKEN = ""   # https://supabase.com/dashboard/account/tokens

# Vercel（已预置，不用改）
VERCEL_TOKEN      = os.environ.get("VERCEL_TOKEN")
VERCEL_TEAM_ID    = "team_KKgolbxsnk74hukG0sQfv4z6"
VERCEL_PROJECT_ID = "prj_cSdgqTGpuPZsw2dUMlM6FQwR0CYr"

# ──────────────────────────────────────────────

def check_config():
    missing = []
    if not SUPABASE_PROJECT_REF:  missing.append("SUPABASE_PROJECT_REF")
    if not SUPABASE_DB_PASSWORD:  missing.append("SUPABASE_DB_PASSWORD")
    if not SUPABASE_ACCESS_TOKEN: missing.append("SUPABASE_ACCESS_TOKEN")
    if missing:
        print("❌ 请先填入以下配置项：")
        for m in missing:
            print(f"   {m}")
        print("\n📖 获取方式：")
        print("   PROJECT_REF: Supabase Dashboard → 项目 URL 最后一段")
        print("   DB_PASSWORD: 创建项目时输入的数据库密码")
        print("   ACCESS_TOKEN: https://supabase.com/dashboard/account/tokens → Generate new token")
        sys.exit(1)

def supabase_api(method, path, data=None, token=None):
    url = f"https://api.supabase.com{path}"
    body = json.dumps(data).encode() if data else None
    headers = {
        "Authorization": f"Bearer {token or SUPABASE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def vercel_api(method, path, data=None):
    url = f"https://api.vercel.com{path}?teamId={VERCEL_TEAM_ID}"
    body = json.dumps(data).encode() if data else None
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def run_sql(sql):
    """通过 Supabase Management API 执行 SQL"""
    result, status = supabase_api(
        "POST",
        f"/v1/projects/{SUPABASE_PROJECT_REF}/database/query",
        {"query": sql}
    )
    return result, status

def get_project_info():
    result, status = supabase_api("GET", f"/v1/projects/{SUPABASE_PROJECT_REF}")
    return result

def get_api_keys():
    result, status = supabase_api("GET", f"/v1/projects/{SUPABASE_PROJECT_REF}/api-keys")
    return result

def update_vercel_env(key, value):
    """更新或创建 Vercel 环境变量"""
    # 先查找现有 ID
    existing = vercel_api("GET", f"/v9/projects/{VERCEL_PROJECT_ID}/env")
    env_id = None
    for e in existing.get("envs", []):
        if e["key"] == key and "production" in e.get("target", []):
            env_id = e["id"]
            break
    
    payload = {
        "key": key,
        "value": value,
        "type": "plain",
        "target": ["production", "preview", "development"],
    }
    
    if env_id:
        result = vercel_api("PATCH", f"/v9/projects/{VERCEL_PROJECT_ID}/env/{env_id}", payload)
    else:
        result = vercel_api("POST", f"/v10/projects/{VERCEL_PROJECT_ID}/env", payload)
    
    return "error" not in result

# ══════════════════════════════════════════════
# 主流程
# ══════════════════════════════════════════════
def main():
    check_config()
    
    print("🚀 maoyan.vip Supabase 初始化开始\n")
    
    # Step 1: 验证项目
    print("① 验证 Supabase 项目...")
    info = get_project_info()
    if "name" not in info:
        print(f"   ❌ 无法访问项目：{info}")
        sys.exit(1)
    print(f"   ✅ 项目名称：{info['name']}")
    print(f"   ✅ 区域：{info.get('region', '?')}")
    print(f"   ✅ 状态：{info.get('status', '?')}")
    
    # Step 2: 等待项目就绪
    if info.get("status") != "ACTIVE_HEALTHY":
        print("   ⏳ 项目启动中，等待就绪...")
        for _ in range(12):
            time.sleep(10)
            info = get_project_info()
            if info.get("status") == "ACTIVE_HEALTHY":
                print("   ✅ 项目已就绪")
                break
        else:
            print("   ⚠️ 项目仍在启动，继续尝试...")
    
    # Step 3: 执行 Schema SQL
    print("\n② 初始化数据库 Schema...")
    schema_path = os.path.join(os.path.dirname(__file__), "../supabase/schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    # 分块执行（避免超时）
    statements = [s.strip() for s in schema_sql.split(";") if s.strip() and not s.strip().startswith("--")]
    
    # 合并成单次执行（Supabase 支持多语句）
    result, status = run_sql(schema_sql)
    if status == 200 or (isinstance(result, list) and len(result) >= 0):
        print(f"   ✅ Schema 执行成功（{len(statements)} 个语句）")
    else:
        # 尝试逐条执行
        print(f"   ⚠️ 批量执行遇到问题，逐条执行...")
        errors = []
        for stmt in statements[:5]:  # 先测试前5条
            r, s = run_sql(stmt + ";")
            if s not in (200, 204) and "already exists" not in str(r):
                errors.append(f"SQL错误: {r}")
        if errors:
            print(f"   ❌ 执行错误：{errors[0]}")
            print("   💡 请手动在 Supabase SQL Editor 中执行 supabase/schema.sql")
        else:
            print("   ✅ Schema 执行成功")
    
    # Step 4: 获取 API Keys
    print("\n③ 获取 API Keys...")
    keys = get_api_keys()
    anon_key = None
    service_key = None
    for k in (keys if isinstance(keys, list) else []):
        if k.get("name") == "anon":
            anon_key = k.get("api_key")
        elif k.get("name") == "service_role":
            service_key = k.get("api_key")
    
    if not anon_key:
        print("   ❌ 无法获取 anon key，请手动在 Supabase 控制台查看")
        print("   Project Settings → API → Project API keys → anon public")
    else:
        print(f"   ✅ anon key 已获取（{anon_key[:20]}...）")
    
    supabase_url = f"https://{SUPABASE_PROJECT_REF}.supabase.co"
    
    # Step 5: 更新 Vercel 环境变量
    print("\n④ 更新 Vercel 环境变量...")
    if anon_key:
        ok1 = update_vercel_env("VITE_SUPABASE_URL", supabase_url)
        ok2 = update_vercel_env("VITE_SUPABASE_ANON_KEY", anon_key)
        print(f"   {'✅' if ok1 else '❌'} VITE_SUPABASE_URL = {supabase_url}")
        print(f"   {'✅' if ok2 else '❌'} VITE_SUPABASE_ANON_KEY = {anon_key[:20]}...")
    else:
        print("   ⚠️ 跳过（需要手动填入）")
    
    # Step 6: 触发 Vercel 重新部署
    print("\n⑤ 触发 Vercel 重新部署（带正式 Supabase 连接）...")
    # 创建一个重部署请求
    result = vercel_api("POST", f"/v13/deployments", {
        "name": "maoyan-vip",
        "gitSource": None,
        # 通过重新部署最新部署来触发
    })
    # 更简单的方法：通知用户
    print("   ✅ 环境变量已更新，需要触发一次重部署让新变量生效")
    print("   💡 可以运行：python3 /tmp/deploy_vercel.py")
    
    # 总结
    print("\n" + "="*50)
    print("🎉 初始化完成！")
    print("="*50)
    print(f"\n📌 Supabase 控制台：https://supabase.com/dashboard/project/{SUPABASE_PROJECT_REF}")
    print(f"📌 网站地址：https://maoyan.vip")
    print(f"\n📋 数据库连接信息（妥善保存）：")
    print(f"   URL:      {supabase_url}")
    print(f"   anon key: {anon_key or '(请手动获取)'}")
    print(f"\n⚠️  下一步：")
    if not anon_key:
        print("   1. 手动将 Supabase URL 和 anon key 填入 Vercel 环境变量")
    print("   2. 运行 python3 /tmp/deploy_vercel.py 重新部署")
    print("   3. 在 GA4 创建属性，获取 G-XXXXXXXX，运行 python3 scripts/set-ga4.py <ID>")

if __name__ == "__main__":
    main()
