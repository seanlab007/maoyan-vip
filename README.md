# 猫眼 MaoYan - 信任货币化平台

React + Supabase + Vercel 构建的达人变现平台

## 🌟 项目简介

猫眼是一个基于信任货币化的达人平台，帮助创作者通过社交影响力获得收益。核心功能包括：

- 🪙 **积分系统**：注册送 100 积分，每日签到、推荐奖励
- 🎴 **Creator Card**：达人名片，Silver/Gold/Platinum/Black Elite 四个等级
- 📊 **短剧投资**：支持短剧内容投资，50% ROI 回报
- 🍽️ **Dine & Post**：内容还款机制，发布内容偿还投资
- 🎁 **积分商城**：星巴克、京东卡、投资额度兑换

## 🚀 快速开始

### 环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

配置 Supabase 凭证：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📦 数据库初始化

### 1. 执行 Schema

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/schema.sql`：

```bash
# 打开 Supabase Dashboard
# 1. 进入 SQL Editor
# 2. 复制 supabase/schema.sql 内容
# 3. 执行 SQL
```

### 2. 初始化测试账号

执行 `supabase/test-account-init.sql` 创建测试账号：

```bash
# 在 Supabase SQL Editor 中执行
复制 supabase/test-account-init.sql 内容并执行
```

### 3. 验证数据库

```sql
-- 检查测试账号
SELECT
  u.email,
  p.nickname,
  p.phone,
  w.balance
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.wallets w ON p.id = w.user_id
WHERE u.email = '13800138000@test.maoyan.vip';
```

## 🧪 测试账号

### 手机号登录

- 手机号：`13800138000`
- 验证码：`123456`

### 邮箱登录

- 邮箱：`13800138000@test.maoyan.vip`
- 密码：`123456`

> 注意：测试账号仅用于开发调试，生产环境请删除

## 📁 项目结构

```
maoyan-vip/
├── src/
│   ├── components/      # 可复用组件
│   ├── pages/           # 页面组件
│   ├── store/           # Zustand 状态管理
│   ├── lib/             # 工具库（Supabase 客户端等）
│   ├── styles/          # 全局样式
│   └── types/           # TypeScript 类型定义
├── supabase/            # Supabase 相关文件
│   ├── schema.sql       # 数据库结构
│   └── test-account-init.sql  # 测试账号初始化
└── public/              # 静态资源
```

## 🎯 核心功能

### 1. 用户认证

- 邮箱注册/登录
- 手机号验证码登录（短信审核中，测试账号可用）
- OAuth 登录（微信、支付宝即将开放）

### 2. 积分系统

- 注册奖励：100 积分
- 每日签到：10-30 积分
- 推荐奖励：200 积分
- 积分商城兑换

### 3. Creator Card

四个等级：

| 等级 | 信用额度 | 特权 |
|------|---------|------|
| Silver | $500 | 基础权限 |
| Gold | $2,000 | 优先推荐 |
| Platinum | $5,000 | 专属客服 |
| Black Elite | $10,000 | 最高权限 |

### 4. 短剧投资

- 投资短剧内容
- 50% ROI 回报率
- Dine & Post 还款机制

## 🔧 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **状态管理**：Zustand
- **样式方案**：CSS Modules
- **认证**：Supabase Auth
- **数据库**：PostgreSQL (Supabase)
- **部署**：Vercel

## 📱 在线地址

- 生产环境：https://maoyan.vip

## 🛠️ 故障排查

### 问题1：注册后无法登录

**原因**：Supabase 触发器未正确执行，导致 profiles/wallets 表记录缺失

**解决方案**：

1. 检查触发器是否存在：
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

2. 手动执行触发器函数：
```sql
SELECT public.handle_new_user();
```

3. 手动补充用户数据：
```sql
-- 插入缺失的 profile
INSERT INTO public.profiles (id, nickname, referral_code)
SELECT id, COALESCE(raw_user_meta_data->>'nickname', split_part(email, '@', 1)), substr(md5(id::text), 1, 8)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 插入缺失的 wallet
INSERT INTO public.wallets (user_id, balance, total_earned)
SELECT id, 100, 100
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.wallets);
```

### 问题2：测试账号登录失败

**解决方案**：

1. 重新初始化测试账号：
```sql
-- 在 Supabase SQL Editor 中执行 supabase/test-account-init.sql
```

2. 检查测试账号是否存在：
```sql
SELECT * FROM auth.users WHERE email = '13800138000@test.maoyan.vip';
```

3. 如果密码错误，重置密码：
```sql
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = '13800138000@test.maoyan.vip';
```

### 问题3：RLS 策略阻止数据访问

**解决方案**：

1. 检查 RLS 策略：
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

2. 临时关闭 RLS（仅测试环境）：
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
```

## 📝 更新日志

### v1.2.0 (2026-03-27)

- ✅ 修复测试账号登录问题
- ✅ 优化手机号登录逻辑
- ✅ 增强邮箱登录错误提示
- ✅ 添加测试账号初始化脚本

### v1.1.0 (2026-03-26)

- ✅ 修复注册后无法登录的问题
- ✅ 增强注册流程，手动创建 profile 和 wallet
- ✅ 优化 authStore 错误处理

### v1.0.0 (2026-03-20)

- ✅ 基础认证功能（注册/登录）
- ✅ 积分系统
- ✅ 每日签到
- ✅ 积分商城

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证

## 👥 作者

- **Sean Dai** - [@seanlab007](https://github.com/seanlab007)

---

**猫眼 MaoYan** - 让信任变现，让创作更有价值 🚀
