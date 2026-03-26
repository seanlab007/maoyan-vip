# Supabase SQL Editor 执行指南

## 📋 步骤说明

由于 CLI 环境限制，需要手动在 Supabase Dashboard 中执行 SQL。

## 🚀 执行步骤

### 1. 打开 Supabase Dashboard

访问：https://supabase.com/dashboard/project/fczherphuixpdjuevzsh

### 2. 进入 SQL Editor

- 在左侧菜单点击 "SQL Editor" (SQL 编辑器)
- 点击 "New Query" (新建查询)

### 3. 执行测试账号初始化脚本

**方法一：复制粘贴（推荐）**

1. 打开文件：`supabase/test-account-init.sql`
2. 全选并复制内容 (Cmd+A, Cmd+C)
3. 粘贴到 SQL Editor (Cmd+V)
4. 点击 "Run" (运行)

**方法二：直接执行以下 SQL**

```sql
-- 检查测试账号是否已存在，如果不存在则创建
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
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      test_email,
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"nickname": "测试用户", "phone": "13800138000"}',
      NOW(),
      NOW()
    )
    RETURNING id INTO test_user_id;

    RAISE NOTICE '✅ 测试账号创建成功: % (密码: 123456)', test_email;

    -- 2. 创建 profile
    INSERT INTO public.profiles (id, nickname, phone, referral_code)
    VALUES (
      test_user_id,
      '测试用户',
      '13800138000',
      substr(md5(test_user_id::text), 1, 8)
    );

    -- 3. 创建钱包并赠送 100 积分
    INSERT INTO public.wallets (user_id, balance, total_earned)
    VALUES (test_user_id, 100, 100);

    -- 4. 写入注册积分流水
    INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description)
    VALUES (test_user_id, 'earn', 'register', 100, 100, '🎉 注册奖励');

    RAISE NOTICE '✅ 测试账号数据初始化完成';
  ELSE
    RAISE NOTICE 'ℹ️  测试账号已存在: %', test_email;

    -- 检查关联数据
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
      INSERT INTO public.profiles (id, nickname, phone, referral_code)
      VALUES (
        test_user_id,
        '测试用户',
        '13800138000',
        substr(md5(test_user_id::text), 1, 8)
      );
      RAISE NOTICE '✅ 补充创建 profile';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = test_user_id) THEN
      INSERT INTO public.wallets (user_id, balance, total_earned)
      VALUES (test_user_id, 100, 100);

      INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description)
      VALUES (test_user_id, 'earn', 'register', 100, 100, '🎉 注册奖励');
      RAISE NOTICE '✅ 补充创建 wallet';
    END IF;
  END IF;
END $$;

-- 显示测试账号信息
SELECT
  u.id,
  u.email,
  u.email_confirmed_at as confirmed,
  p.nickname,
  p.phone,
  w.balance,
  w.total_earned
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.wallets w ON p.id = w.user_id
WHERE u.email = '13800138000@test.maoyan.vip';
```

### 4. 验证执行结果

成功后会看到类似输出：

```
NOTICE:  ✅ 测试账号创建成功: 13800138000@test.maoyan.vip (密码: 123456)
NOTICE:  ✅ 测试账号数据初始化完成
```

以及查询结果：

| id | email | confirmed | nickname | phone | balance | total_earned |
|-----|-------|-----------|-----------|--------|---------|--------------|
| [UUID] | 13800138000@test.maoyan.vip | [时间] | 测试用户 | 13800138000 | 100 | 100 |

## ✅ 验证测试账号

### 1. 检查用户是否存在

```sql
SELECT * FROM auth.users WHERE email = '13800138000@test.maoyan.vip';
```

### 2. 检查 profile

```sql
SELECT * FROM public.profiles WHERE phone = '13800138000';
```

### 3. 检查 wallet

```sql
SELECT * FROM public.wallets WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);
```

### 4. 检查 transactions

```sql
SELECT * FROM public.transactions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);
```

## 🧪 测试登录

### 方式一：手机号登录

1. 访问：https://maoyan.vip/login
2. 切换到"手机号"标签
3. 输入手机号：`13800138000`
4. 点击"发送验证码"
5. 系统显示：`验证码已发送（测试码：123456）`
6. 输入验证码：`123456`
7. 点击"登录"

### 方式二：邮箱登录

1. 访问：https://maoyan.vip/login
2. 切换到"邮箱"标签
3. 输入邮箱：`13800138000@test.maoyan.vip`
4. 输入密码：`123456`
5. 点击"登录"

## ⚠️ 常见问题

### 问题1：SQL 执行失败

**可能原因**：
- `auth.users` 表访问权限不足
- 触发器权限问题

**解决方案**：
1. 使用 service_role key（不是 anon key）
2. 确保在 Supabase Dashboard 的 SQL Editor 中执行（不是客户端）
3. 检查是否已执行 `schema.sql`

### 问题2：测试账号已存在但无法登录

**解决方案**：重置密码

```sql
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = '13800138000@test.maoyan.vip';
```

### 问题3：wallet 或 transactions 缺失

**解决方案**：补充数据

```sql
-- 获取测试用户 ID
SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip';

-- 替换 USER_UUID 为上面的 ID，执行补充数据
INSERT INTO public.wallets (user_id, balance, total_earned)
VALUES ('USER_UUID', 100, 100);

INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description)
VALUES ('USER_UUID', 'earn', 'register', 100, 100, '🎉 注册奖励');
```

## 📊 测试账号信息

| 项目 | 值 |
|------|-----|
| 邮箱 | 13800138000@test.maoyan.vip |
| 密码 | 123456 |
| 手机号 | 13800138000 |
| 验证码 | 123456 |
| 昵称 | 测试用户 |
| 积分 | 100 |

## 🔗 相关链接

- Supabase Dashboard: https://supabase.com/dashboard/project/fczherphuixpdjuevzsh
- SQL Editor: https://supabase.com/dashboard/project/fczherphuixpdjuevzsh/sql/new
- maoyan.vip 登录: https://maoyan.vip/login
- 测试账号指南: `TEST_ACCOUNT_GUIDE.md`
- 修复报告: `TEST_ACCOUNT_FIX_REPORT.md`

---

**执行完成后**，访问 https://maoyan.vip/login 测试登录功能。
