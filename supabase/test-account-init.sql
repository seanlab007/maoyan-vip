-- ============================================================
-- 测试账号初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================================

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

-- ============================================================
-- 使用说明
-- ============================================================
-- 测试账号登录方式：
--
-- 方式1：手机号登录
--   手机号：13800138000
--   验证码：123456
--
-- 方式2：邮箱登录
--   邮箱：13800138000@test.maoyan.vip
--   密码：123456
--
-- 注意：这是测试账号，仅用于开发调试
-- ============================================================
