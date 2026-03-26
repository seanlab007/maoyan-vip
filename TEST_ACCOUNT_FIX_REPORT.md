# 测试账号登录问题修复报告

## 📋 问题概述

用户反馈：测试账号 `13800138000` / 密码 `123456` 无法登录 maoyan.vip

## 🔍 问题分析

### 根本原因

1. **测试手机号登录逻辑错误**
   - 原代码尝试用 `test@maoyan.vip` 邮箱登录，这不是正确的手机号映射方式
   - 手机号验证码登录应该映射到特定的 Supabase Auth 用户

2. **测试账号未初始化**
   - Supabase 数据库中没有对应的测试账号记录
   - 缺少 profile 和 wallet 记录

3. **邮箱登录错误提示不友好**
   - 没有区分"密码错误"和"邮箱未验证"
   - 用户无法了解具体失败原因

### 问题表现

```
用户尝试登录：
1. 输入手机号：13800138000 ✅
2. 点击"发送验证码" ✅
3. 系统显示：验证码已发送（测试码：123456）✅
4. 输入验证码：123456 ✅
5. 点击"登录" ❌
6. 错误：测试登录失败，请检查 Supabase 配置 ❌

或

用户尝试登录：
1. 输入邮箱：13800138000@test.maoyan.vip ❌（不存在）
2. 输入密码：123456 ❌
3. 点击"登录" ❌
4. 错误：邮箱或密码错误 ❌
```

## ✅ 修复方案

### 1. 修复 Login.tsx - 手机号登录逻辑

**修改前**：
```tsx
// 测试号码 Mock 登录
if ((cleanPhone === TEST_PHONE || cleanPhone === '+86' + TEST_PHONE) && otp === TEST_OTP) {
  try {
    // 用测试账号登录（需要 Supabase 中存在此用户）
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@maoyan.vip',  // ❌ 错误的邮箱
      password: 'test123456'
    })
    // ...
  }
}
```

**修改后**：
```tsx
// 测试号码 Mock 登录
if ((cleanPhone === TEST_PHONE || cleanPhone === '+86' + TEST_PHONE) && otp === TEST_OTP) {
  try {
    // 使用测试邮箱登录
    const testEmail = '13800138000@test.maoyan.vip'  // ✅ 正确的邮箱映射
    const testPassword = '123456'

    // 尝试登录
    let { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    // 如果登录失败，尝试注册测试账号
    if (error) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nickname: '测试用户',
            phone: TEST_PHONE,
            referral_code: null
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      })

      if (signUpError) {
        throw signUpError
      }

      // 等待用户创建
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 再次尝试登录
      const loginResult = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      data = loginResult.data
      error = loginResult.error
    }

    if (error) throw error

    // ... 后续登录逻辑
  }
}
```

**关键改进**：
- ✅ 使用正确的测试邮箱：`13800138000@test.maoyan.vip`
- ✅ 自动创建测试账号（如果不存在）
- ✅ 等待 1.5 秒确保用户创建完成
- ✅ 更详细的错误处理和日志

### 2. 增强 Login.tsx - 邮箱登录错误提示

**修改前**：
```tsx
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : '登录失败'
  toast.error(msg.includes('Invalid login credentials') ? '邮箱或密码错误' : msg)
}
```

**修改后**：
```tsx
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : '登录失败'
  if (msg.includes('Invalid login credentials')) {
    toast.error('邮箱或密码错误')
  } else if (msg.includes('Email not confirmed')) {
    toast.error('请先验证邮箱')
  } else {
    toast.error(msg)
  }
}
```

**关键改进**：
- ✅ 区分"密码错误"和"邮箱未验证"
- ✅ 更友好的错误提示

### 3. 创建测试账号初始化脚本

**文件**：`supabase/test-account-init.sql`

```sql
-- 创建测试账号
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := '13800138000@test.maoyan.vip';
BEGIN
  -- 查找测试用户
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = test_email;

  -- 如果不存在，创建测试账号
  IF test_user_id IS NULL THEN
    -- 1. 创建 Auth 用户
    INSERT INTO auth.users (...)
    VALUES (...);

    -- 2. 创建 profile
    INSERT INTO public.profiles (id, nickname, phone, referral_code)
    VALUES (...);

    -- 3. 创建钱包并赠送 100 积分
    INSERT INTO public.wallets (user_id, balance, total_earned)
    VALUES (test_user_id, 100, 100);

    -- 4. 写入注册积分流水
    INSERT INTO public.transactions (...)
    VALUES (...);
  END IF;
END $$;
```

**功能**：
- ✅ 自动检测测试账号是否存在
- ✅ 创建完整的 Auth 用户、profile、wallet 记录
- ✅ 赠送 100 积分注册奖励
- ✅ 显示执行结果和测试账号信息

### 4. 更新 README.md

添加内容：
- ✅ 测试账号使用说明
- ✅ 数据库初始化步骤
- ✅ 故障排查指南
- ✅ 更新日志

### 5. 创建测试账号使用指南

**文件**：`TEST_ACCOUNT_GUIDE.md`

包含内容：
- ✅ 测试账号信息（手机号/邮箱登录）
- ✅ 详细的初始化步骤
- ✅ 验证测试账号的 SQL 查询
- ✅ 常见问题和解决方案
- ✅ 测试场景示例
- ✅ 安全提示（生产环境删除）

## 📦 修改文件清单

1. **src/pages/Login.tsx**
   - 修复测试手机号登录逻辑
   - 增强邮箱登录错误提示
   - 优化错误处理

2. **supabase/test-account-init.sql**（新建）
   - 测试账号初始化脚本
   - 自动创建测试账号和相关数据

3. **README.md**
   - 添加测试账号使用说明
   - 添加数据库初始化步骤
   - 添加故障排查指南

4. **TEST_ACCOUNT_GUIDE.md**（新建）
   - 完整的测试账号使用指南
   - 常见问题解答
   - 测试场景示例

## 🧪 验证流程

### 步骤 1：初始化测试账号

在 Supabase SQL Editor 中执行：

```sql
-- 复制 supabase/test-account-init.sql 内容
-- 粘贴到 SQL Editor 并执行
```

预期结果：
```
NOTICE:  ✅ 测试账号创建成功: 13800138000@test.maoyan.vip (密码: 123456)
NOTICE:  ✅ 测试账号数据初始化完成
```

### 步骤 2：验证测试账号

```sql
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

预期结果：
- email: `13800138000@test.maoyan.vip`
- nickname: `测试用户`
- phone: `13800138000`
- balance: `100`

### 步骤 3：测试手机号登录

1. 访问 https://maoyan.vip/login
2. 切换到"手机号"标签
3. 输入手机号：`13800138000`
4. 点击"发送验证码"
5. 系统显示：`验证码已发送（测试码：123456）`
6. 输入验证码：`123456`
7. 点击"登录"

预期结果：
- ✅ 提示：`登录成功！欢迎回来 🎉`
- ✅ 自动跳转到 Dashboard
- ✅ 显示用户昵称：`测试用户`
- ✅ 显示积分：`100`

### 步骤 4：测试邮箱登录

1. 访问 https://maoyan.vip/login
2. 切换到"邮箱"标签
3. 输入邮箱：`13800138000@test.maoyan.vip`
4. 输入密码：`123456`
5. 点击"登录"

预期结果：
- ✅ 提示：`欢迎回来！`
- ✅ 自动跳转到 Dashboard
- ✅ 显示用户昵称：`测试用户`
- ✅ 显示积分：`100`

## 🚀 部署状态

- ✅ 代码已提交（commit: `7adddc7`）
- ✅ 已推送到 GitHub
- ✅ Vercel 自动部署中
- ✅ 部署地址：https://maoyan.vip

## 📊 技术细节

### Supabase Auth 数据流

```
测试手机号登录流程：
1. 用户输入 13800138000
2. 发送验证码 → 显示测试码 123456
3. 输入验证码 123456
4. 尝试登录 13800138000@test.maoyan.vip
5. 如果失败，自动创建测试账号
6. 等待 1.5 秒
7. 重新登录
8. 加载用户数据（profile、wallet）
9. 跳转到 Dashboard
```

### 测试账号数据结构

```
auth.users:
  - id: UUID
  - email: 13800138000@test.maoyan.vip
  - encrypted_password: crypt('123456')
  - raw_user_meta_data: { nickname: "测试用户", phone: "13800138000" }

public.profiles:
  - id: UUID (引用 auth.users.id)
  - nickname: "测试用户"
  - phone: "13800138000"
  - referral_code: 8位随机码
  - balance: 100 (通过 wallet)

public.wallets:
  - user_id: UUID (引用 profiles.id)
  - balance: 100
  - total_earned: 100

public.transactions:
  - user_id: UUID
  - type: 'earn'
  - source: 'register'
  - amount: 100
  - balance_after: 100
  - description: '🎉 注册奖励'
```

## ⚠️ 常见问题解决

### 问题 1：测试账号初始化失败

**解决方案**：
1. 检查 Supabase 连接是否正常
2. 检查 schema.sql 是否已执行
3. 手动执行 SQL 脚本
4. 查看错误日志

### 问题 2：登录后没有积分

**解决方案**：
1. 检查 wallet 记录是否存在
2. 检查 transactions 记录是否存在
3. 手动补充数据（见 TEST_ACCOUNT_GUIDE.md）

### 问题 3：密码错误

**解决方案**：
1. 重置测试账号密码
2. 重新初始化测试账号
3. 检查密码加密方式

## 🎉 修复总结

### 问题解决
✅ 测试手机号登录逻辑修复
✅ 测试账号自动初始化
✅ 增强错误提示
✅ 完整的使用文档

### 用户体验提升
- **登录更流畅**：自动创建测试账号，无需手动注册
- **错误提示更友好**：区分不同错误原因
- **文档更完整**：详细的使用指南和故障排查

### 开发体验提升
- **测试更便捷**：一键初始化测试账号
- **调试更容易**：详细的错误日志
- **文档更清晰**：完整的测试指南

## 📈 后续优化建议

1. **生产环境安全**
   - 删除测试账号或修改密码
   - 添加测试账号 IP 白名单
   - 设置测试账号过期时间

2. **自动化测试**
   - 添加 E2E 测试
   - 集成到 CI/CD 流程
   - 自动化测试报告

3. **监控和日志**
   - 添加登录失败日志
   - 监控测试账号使用情况
   - 异常报警机制

---

**详细文件**：
- `src/pages/Login.tsx` - 登录逻辑
- `supabase/test-account-init.sql` - 测试账号初始化
- `TEST_ACCOUNT_GUIDE.md` - 测试账号使用指南
- `README.md` - 项目文档

**提交记录**：commit `7adddc7`
**部署地址**：https://maoyan.vip
**GitHub**：https://github.com/seanlab007/maoyan-vip
