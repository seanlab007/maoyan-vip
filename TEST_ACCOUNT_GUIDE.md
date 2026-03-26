# 测试账号使用指南

## 📋 概述

maoyan.vip 提供了测试账号，方便开发和测试使用。

## 🧪 测试账号信息

### 手机号登录

- 手机号：`13800138000`
- 验证码：`123456`

### 邮箱登录

- 邮箱：`13800138000@test.maoyan.vip`
- 密码：`123456`

## 🚀 使用步骤

### 方式一：通过 SQL 初始化（推荐）

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `supabase/test-account-init.sql` 的内容
4. 粘贴到 SQL Editor 并执行
5. 查看执行结果，确认测试账号创建成功

执行后会显示类似输出：
```
NOTICE:  ✅ 测试账号创建成功: 13800138000@test.maoyan.vip (密码: 123456)
NOTICE:  ✅ 测试账号数据初始化完成
```

### 方式二：手动注册（备用）

如果 SQL 脚本执行失败，可以手动注册：

1. 访问 https://maoyan.vip/register
2. 使用邮箱注册：
   - 邮箱：`13800138000@test.maoyan.vip`
   - 密码：`123456`
   - 昵称：`测试用户`
3. 注册后会自动创建 profile 和 wallet 记录

## 🔍 验证测试账号

### 检查用户是否存在

在 Supabase SQL Editor 中执行：

```sql
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

预期结果：
- email: `13800138000@test.maoyan.vip`
- nickname: `测试用户`
- phone: `13800138000`
- balance: `100` (注册奖励)
- total_earned: `100`

### 检查积分流水

```sql
SELECT
  type,
  source,
  amount,
  balance_after,
  description,
  created_at
FROM public.transactions
WHERE user_id = 'TEST_USER_UUID'
ORDER BY created_at DESC;
```

## 📱 登录测试

### 手机号登录测试

1. 访问 https://maoyan.vip/login
2. 切换到"手机号"标签
3. 输入手机号：`13800138000`
4. 点击"发送验证码"
5. 系统会显示：`验证码已发送（测试码：123456）`
6. 输入验证码：`123456`
7. 点击"登录"
8. 应该成功登录并跳转到 Dashboard

### 邮箱登录测试

1. 访问 https://maoyan.vip/login
2. 切换到"邮箱"标签
3. 输入邮箱：`13800138000@test.maoyan.vip`
4. 输入密码：`123456`
5. 点击"登录"
6. 应该成功登录并跳转到 Dashboard

## ⚠️ 常见问题

### 问题1：验证码发送失败

**错误信息**：`📱 短信服务开通中，请稍后重试或使用邮箱登录`

**原因**：测试号码会触发 Supabase 短信服务，但短信服务可能未开通

**解决方案**：
- 测试号码会显示验证码：`123456`，直接使用即可
- 或使用邮箱登录方式

### 问题2：登录后没有积分

**原因**：wallet 记录未正确创建

**解决方案**：

1. 检查 wallet 是否存在：
```sql
SELECT * FROM public.wallets WHERE user_id = 'TEST_USER_UUID';
```

2. 如果不存在，手动创建：
```sql
-- 获取测试用户 ID
SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip';

-- 创建 wallet（替换 USER_UUID 为上面的 ID）
INSERT INTO public.wallets (user_id, balance, total_earned)
VALUES ('USER_UUID', 100, 100);

-- 写入注册奖励
INSERT INTO public.transactions (user_id, type, source, amount, balance_after, description)
VALUES ('USER_UUID', 'earn', 'register', 100, 100, '🎉 注册奖励');
```

### 问题3：登录后提示"加载用户数据失败"

**原因**：profile 记录未正确创建

**解决方案**：

1. 检查 profile 是否存在：
```sql
SELECT * FROM public.profiles WHERE id = 'TEST_USER_UUID';
```

2. 如果不存在，手动创建：
```sql
-- 获取测试用户 ID
SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip';

-- 创建 profile（替换 USER_UUID 为上面的 ID）
INSERT INTO public.profiles (id, nickname, phone, referral_code)
VALUES (
  'USER_UUID',
  '测试用户',
  '13800138000',
  substr(md5('USER_UUID'::text), 1, 8)
);
```

### 问题4：密码错误

**错误信息**：`邮箱或密码错误`

**原因**：测试账号的密码不是 `123456`

**解决方案**：

1. 重置密码：
```sql
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = '13800138000@test.maoyan.vip';
```

2. 重新登录

### 问题5：测试账号被删除

**原因**：测试账号可能在数据库中被意外删除

**解决方案**：

1. 重新执行 `supabase/test-account-init.sql`
2. 或按照"方式二：手动注册"重新注册

## 🧪 测试场景

### 场景1：首次注册流程

1. 删除测试账号的所有数据
2. 访问注册页面
3. 使用邮箱注册
4. 验证自动创建 profile 和 wallet
5. 验证获得 100 积分

### 场景2：每日签到

1. 使用测试账号登录
2. 进入 Dashboard
3. 点击"每日签到"
4. 验证积分增加（10-30 积分）
5. 验证签到记录

### 场景3：积分兑换

1. 使用测试账号登录
2. 进入积分商城
3. 选择商品兑换
4. 验证积分扣除
5. 验证订单创建

### 场景4：推荐奖励

1. 使用测试账号 A 登录
2. 获取推荐码
3. 使用测试账号 B 注册时输入推荐码
4. 验证 A 获得 200 积分
5. 验证 B 获得 100 积分

## 🔄 重置测试账号

如果需要重置测试账号到初始状态：

```sql
-- 删除测试账号的所有数据
DELETE FROM public.transactions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM public.wallets WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM public.profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM auth.users WHERE email = '13800138000@test.maoyan.vip';

-- 重新创建测试账号
-- 重新执行 supabase/test-account-init.sql
```

## 📊 性能测试

使用测试账号进行性能测试：

1. 登录速度：< 2s
2. 页面加载：< 1s
3. 积分查询：< 500ms
4. 订单创建：< 1s

## 🔒 安全提示

⚠️ **重要提示**：

1. 测试账号仅用于开发和测试环境
2. **生产环境必须删除测试账号**
3. 不要在生产环境中使用测试账号的密码
4. 测试账号的密码应定期更换

删除测试账号：

```sql
-- 生产环境执行
DELETE FROM public.transactions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM public.wallets WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM public.profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = '13800138000@test.maoyan.vip'
);

DELETE FROM auth.users WHERE email = '13800138000@test.maoyan.vip';
```

## 📝 更新日志

### v1.2.0 (2026-03-27)

- ✅ 修复测试手机号登录逻辑
- ✅ 优化测试账号初始化脚本
- ✅ 增强错误提示
- ✅ 添加完整的故障排查指南

---

如有问题，请检查 [README.md](../README.md) 或联系开发团队。
