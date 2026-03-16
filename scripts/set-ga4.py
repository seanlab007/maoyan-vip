#!/usr/bin/env python3
"""
设置 GA4 Measurement ID 并触发重新部署
用法：python3 scripts/set-ga4.py G-XXXXXXXXXX
需要环境变量：VERCEL_TOKEN
"""
import sys, json, os, urllib.request, urllib.error

VERCEL_TOKEN      = os.environ.get("VERCEL_TOKEN")
VERCEL_TEAM_ID    = "team_KKgolbxsnk74hukG0sQfv4z6"
VERCEL_PROJECT_ID = "prj_cSdgqTGpuPZsw2dUMlM6FQwR0CYr"

if not VERCEL_TOKEN:
    print("❌ 错误：未设置 VERCEL_TOKEN 环境变量")
    print("请先设置：export VERCEL_TOKEN='your_vercel_token'")
    sys.exit(1)

def vercel_api(method, path, data=None):
    url = f"https://api.vercel.com{path}?teamId={VERCEL_TEAM_ID}"
    body = json.dumps(data).encode() if data else None
    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def main():
    if len(sys.argv) < 2 or not sys.argv[1].startswith("G-"):
        print("用法：python3 scripts/set-ga4.py G-XXXXXXXXXX")
        print("示例：python3 scripts/set-ga4.py G-ABC123DEF4")
        sys.exit(1)
    
    ga_id = sys.argv[1].strip()
    print(f"设置 GA4 Measurement ID: {ga_id}")

    # 找到现有的环境变量 ID
    existing = vercel_api("GET", f"/v9/projects/{VERCEL_PROJECT_ID}/env")
    env_id = None
    for e in existing.get("envs", []):
        if e["key"] == "VITE_GA_MEASUREMENT_ID" and "production" in e.get("target", []):
            env_id = e["id"]
            break

    payload = {
        "key": "VITE_GA_MEASUREMENT_ID",
        "value": ga_id,
        "type": "plain",
        "target": ["production", "preview"],
    }

    if env_id:
        result = vercel_api("PATCH", f"/v9/projects/{VERCEL_PROJECT_ID}/env/{env_id}", payload)
    else:
        result = vercel_api("POST", f"/v10/projects/{VERCEL_PROJECT_ID}/env", payload)

    if "error" in result:
        print(f"❌ 设置失败：{result['error']}")
        sys.exit(1)

    print(f"✅ VITE_GA_MEASUREMENT_ID = {ga_id} 已更新到 Vercel")
    print("\n触发重新部署...")
    import subprocess
    subprocess.run(["python3", "/tmp/deploy_vercel.py"], check=True)
    print("\n✅ 部署已触发，GA4 将在新版本上线后开始收集数据")
    print(f"📊 GA4 控制台：https://analytics.google.com/")

if __name__ == "__main__":
    main()
