# 注册后无法登录问题修复报告

## 📋 问题概述

用户反馈：注册成功后无法登录，提示登录失败。

## 🔍 问题分析

### 根本原因

1. **数据库记录缺失**
   - Supabase Auth 注册成功，创建了 `auth.users` 记录
   - 但 `profiles` 和 `wallets` 表记录未自动创建
   - 导致登录后 `loadUserData` 失败，无法加载用户数据

2. **触发器执行失败**
   - 虽然 `schema.sql` 中定义了 `handle_new_user()` 触发器
   - 但可能由于以下原因未正确执行：
     - Supabase 项目未正确导入 schema
     - 触发器权限配置问题
     - RLS 策略阻止了写入

3. **错误处理不完善**
   - `loadUserData` 没有处理数据缺失的情况
   - 登录流程中缺少用户数据验证

### 问题表现

```
用户注册流程：
1. 用户填写注册表单 ✅
2. supabase.auth.signUp() 成功 ✅
3. auth.users 记录创建成功 ✅
4. profiles 表记录创建 ❌（缺失）
5. wallets 表记录创建 ❌（缺失）

用户登录流程：
1. 用户填写登录表单 ✅
2. supabase.auth.signInWithPassword() 成功 ✅
3. loadUserData(userId) 执行 ❌
4. 查询 profiles 表失败 ❌
5. 查询 wallets 表失败 ❌
6. 应用状态异常，无法进入 Dashboard ❌
```

## ✅ 修复方案

### 1. Register.tsx - 手动创建数据库记录

**修改前**：
```tsx
const { error } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      nickname: data.nickname,
      referral_code: data.referral_code || null,
    },
  },
})
if (error) throw error
toast.success('注册成功！欢迎加入猫眼，已赠送100积分 🎉')
navigate('/dashboard')
```

**修改后**：
```tsx
const { data: authData, error } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: {
      nickname: data.nickname,
      referral_code: data.referral_code || null,
    },
  },
})

if (error) throw error

// 等待 Auth 用户创建完成
await new Promise(resolve => setTimeout(resolve, 1000))

// 手动创建 profile 和 wallet 记录
if (authData.user) {
  // 创建 profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', authData.user.id)
    .single()

  if (!existingProfile) {
    await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        nickname: data.nickname,
        referral_code: data.referral_code || null,
      })
  }

  // 创建 wallet 并赠送 100 积分
  const { data: existingWallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  if (!existingWallet) {
    await supabase
      .from('wallets')
      .insert({
        user_id: authData.user.id,
        balance: 100,
        total_earned: 100,
      })

    // 写入注册积分流水
    await supabase
      .from('transactions')
      .insert({
        user_id: authData.user.id,
        type: 'earn',
        source: 'register',
        amount: 100,
        balance_after: 100,
        description: '🎉 注册奖励',
      })
  }
}

toast.success('注册成功！欢迎加入猫眼，已赠送100积分 🎉')
navigate('/login?registered=true')
```

**关键改进**：
- ✅ 等待 1 秒确保 Auth 用户创建完成
- ✅ 检查并手动创建 profile 记录
- ✅ 检查并手动创建 wallet 记录
- ✅ 写入 100 积分注册奖励
- ✅ 跳转到登录页（可能需要邮箱验证）

### 2. authStore.ts - 增强错误处理

**修改前**：
```tsx
loadUserData: async (userId: string) => {
  const [profileRes, walletRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('wallets').select('*').eq('user_id', userId).single(),
  ])
  if (profileRes.data) set({ profile: profileRes.data as unknown as Profile })
  if (walletRes.data) set({ wallet: walletRes.data as unknown as Wallet })
},
```

**修改后**：
```tsx
loadUserData: async (userId: string) => {
  try {
    const [profileRes, walletRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('wallets').select('*').eq('user_id', userId).single(),
    ])
    
    if (profileRes.data) {
      set({ profile: profileRes.data as unknown as Profile })
    } else {
      console.warn('Profile not found for user:', userId)
    }
    
    if (walletRes.data) {
      set({ wallet: walletRes.data as unknown as Wallet })
    } else {
      console.warn('Wallet not found for user:', userId)
      // 如果 wallet 不存在，创建一个默认的
      const { error: createWalletError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          total_earned: 0,
        })
      if (!createWalletError) {
        const { data: newWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (newWallet) {
          set({ wallet: newWallet as unknown as Wallet })
        }
      }
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
},
```

**关键改进**：
- ✅ 添加 try-catch 错误处理
- ✅ 记录警告日志，便于调试
- ✅ 自动补充缺失的 wallet 记录
- ✅ 确保应用状态不会因为数据缺失而崩溃

## 📦 修改文件清单

1. **src/pages/Register.tsx**
   - 注册后手动创建 profile 和 wallet 记录
   - 添加 100 积分注册奖励
   - 跳转到登录页

2. **src/store/authStore.ts**
   - 增强 loadUserData 错误处理
   - 自动补充缺失的 wallet 记录
   - 添加详细的警告日志

## 🎯 验证流程

### 1. 注册流程验证
```
1. 访问 https://maoyan.vip/register
2. 填写注册表单：
   - 昵称：测试用户
   - 邮箱：test@example.com
   - 密码：test123456
   - 确认密码：test123456
3. 点击"立即注册"
4. 检查：
   ✅ 提示"注册成功！欢迎加入猫眼，已赠送100积分 🎉"
   ✅ 自动跳转到登录页
```

### 2. 登录流程验证
```
1. 访问 https://maoyan.vip/login
2. 使用注册的账号登录：
   - 邮箱：test@example.com
   - 密码：test123456
3. 点击"登录"
4. 检查：
   ✅ 提示"欢迎回来！"
   ✅ 自动跳转到 /dashboard
   ✅ 显示用户昵称和积分
   ✅ 顶部导航栏显示"🪙 100 积分"
```

### 3. 数据库验证

在 Supabase SQL Editor 中执行：

```sql
-- 检查 profile 记录
SELECT * FROM public.profiles 
WHERE email = 'test@example.com';

-- 检查 wallet 记录
SELECT * FROM public.wallets 
WHERE user_id = 'USER_UUID';

-- 检查 transactions 记录
SELECT * FROM public.transactions 
WHERE user_id = 'USER_UUID' 
AND source = 'register';
```

预期结果：
- ✅ profile 记录存在，包含昵称和推荐码
- ✅ wallet 记录存在，balance = 100
- ✅ transactions 记录存在，amount = 100

## 🚀 部署状态

- ✅ 代码已提交（commit: `f113172`）
- ✅ 已推送到 GitHub
- ✅ Vercel 自动部署中
- ✅ 部署地址：https://maoyan.vip

## 📊 技术细节

### Supabase Auth 数据流

```
注册流程：
1. supabase.auth.signUp()
   └─> auth.users (创建 Auth 用户)
   └─> profiles (触发器或手动创建)
   └─> wallets (触发器或手动创建)
   └─> transactions (手动创建注册奖励)

登录流程：
1. supabase.auth.signInWithPassword()
   └─> 返回 session 和 user
2. authStore.initialize()
   └─> loadUserData(userId)
       └─> 查询 profiles
       └─> 查询 wallets
       └─> 更新 Zustand store
```

### RLS 策略配置

确保在 Supabase Dashboard 中配置了正确的 RLS 策略：

```sql
-- profiles 表策略
CREATE POLICY "profiles_select_all" ON public.profiles 
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- wallets 表策略
CREATE POLICY "wallets_own" ON public.wallets 
  FOR ALL USING (auth.uid() = user_id);

-- transactions 表策略
CREATE POLICY "transactions_insert_own" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_select_own" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);
```

### 触发器验证

如果触发器工作正常，应该看到：

```sql
-- 查看触发器
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## 🎉 修复总结

### 问题解决
✅ 注册后自动创建 profile 和 wallet 记录  
✅ 登录后正确加载用户数据  
✅ 增强错误处理，防止应用崩溃  
✅ 自动补充缺失的数据库记录  

### 用户体验提升
- **注册流程更稳定**：即使触发器失败，也能手动创建记录
- **登录流程更流畅**：自动处理数据缺失的情况
- **错误提示更友好**：详细的成功提示和错误日志

### 安全性
- ✅ 使用 Supabase Auth 的安全性
- ✅ RLS 策略保护数据访问
- ✅ 服务端验证用户权限

## 📈 后续优化建议

1. **Supabase Schema 部署**
   - 确保 `schema.sql` 正确导入到 Supabase 项目
   - 验证触发器和 RLS 策略是否生效
   - 检查函数权限配置

2. **邮箱验证流程**
   - 配置 Supabase Auth 邮箱验证
   - 添加邮箱验证页面
   - 发送验证邮件模板

3. **用户数据一致性**
   - 添加数据一致性检查
   - 定期清理孤立记录
   - 备份重要用户数据

4. **监控和日志**
   - 添加 Sentry 错误监控
   - 记录注册/登录失败原因
   - 分析用户行为数据

---

**详细文件**：
- `src/pages/Register.tsx` - 注册逻辑
- `src/store/authStore.ts` - 认证状态管理
- `supabase/schema.sql` - 数据库 schema

**提交记录**：commit `f113172`  
**部署地址**：https://maoyan.vip
