# daiizen ↔ maoyan.vip 积分互通系统 - 实施指南

## 📋 项目状态

| 项目 | 数据库 | 状态 |
|------|--------|------|
| **maoyan.vip** | Supabase PostgreSQL | ✅ 已配置 |
| **daiizen** | 未配置 | ⚠️ 需要迁移到 Supabase |

## 🎯 解决方案

**将 daiizen 的用户数据迁移到 maoyan.vip 的 Supabase 数据库**

### 优势

1. ✅ 统一数据库管理，降低运维成本
2. ✅ 无需跨库调用，性能更好
3. ✅ 数据一致性更强
4. ✅ 简化架构，降低复杂度

---

## 📝 实施步骤

### 阶段 1：数据库迁移（30 分钟）

#### 1.1 在 Supabase 执行迁移脚本

进入 Supabase Dashboard → maoyan 项目 → SQL Editor

**执行文件**：`supabase-daiizen-migration.sql`

该脚本会创建：
- `daiizen_users` - daiizen 用户表
- `daiizen_point_transactions` - 积分交易记录表
- `daiizen_orders` - daiizen 订单表（可选）
- `daiizen_point_rules` - 积分规则配置表
- `daiizen_user_referrals` - 用户邀请关系表
- 触发器：自动更新用户积分统计
- 视图：`user_points_summary` - 用户积分汇总

#### 1.2 验证表创建

```sql
-- 查看创建的表
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'daiizen_%'
ORDER BY table_name;
```

#### 1.3 查看初始数据

```sql
-- 查看积分规则
SELECT * FROM daiizen_point_rules;

-- 查看用户积分汇总视图
SELECT * FROM user_points_summary LIMIT 10;
```

---

### 阶段 2：后端 API 集成（2-3 小时）

#### 2.1 更新 maoyan.vip 后端

**文件**：`maoyan-vip/src/lib/daiizen-integration.ts`

将以下代码复制到项目中：

```typescript
// 文件内容见：supabase-daiizen-api.ts
// 保存为：maoyan-vip/src/lib/daiizen-integration.ts
```

#### 2.2 更新环境变量

在 Vercel 添加以下环境变量：

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

获取方式：
1. Supabase Dashboard → Project Settings → API
2. 找到 `service_role` key（注意：这个 key 有完全权限，要妥善保管）

---

### 阶段 3：前端页面集成（1-2 小时）

#### 3.1 已创建的文件

✅ `maoyan-vip/src/pages/DaiizenPoints.tsx` - daiizen 积分管理页面
✅ `maoyan-vip/src/styles/daiizen-points.css` - 页面样式
✅ 已更新 `maoyan-vip/src/App.tsx` - 添加路由
✅ 已更新 `maoyan-vip/src/components/layout/AppLayout.tsx` - 添加导航入口

#### 3.2 访问路径

- 桌面端：导航栏 → "🛍️ daiizen积分"
- 移动端：底部导航 → "🛍️ daiizen积分"
- URL：`https://maoyan.vip/daiizen-points`

---

### 阶段 4：daiizen 侧集成（可选，2-3 小时）

如果需要 daiizen 前端也能访问积分系统：

#### 4.1 在 daiizen 项目中添加路由

**文件**：`/tmp/daiizen/client/src/pages/Points.tsx`

#### 4.2 添加到 daiizen 的 App.tsx

```typescript
const PointsPage = lazy(() => import("./pages/Points"));

// 添加路由
<Route path="/points" component={PointsPage} />
```

---

## 🔄 用户使用流程

### 首次使用

1. **用户在 daiizen 注册账号**
   ```
   用户：sean@example.com
   daiizen openId: user_12345
   ```

2. **用户进入 maoyan.vip**
   ```
   点击导航栏 "🛍️ daiizen积分"
   ```

3. **关联账号**
   ```
   点击 "关联账号" 按钮
   输入 daiizen openId 或邮箱
   系统匹配并创建关联
   ```

4. **自动同步积分**
   ```
   daiizen 购物获得积分
   自动同步到 maoyan 钱包
   可用于短剧投资
   ```

### 日常使用

| 操作 | daiizen | maoyan.vip |
|------|---------|-----------|
| 购物 | 完成订单 → 获得积分 | 钱包积分自动增加 |
| 投资 | - | 使用 daiizen 积分投资短剧 |
| 查询 | `/points` | `/daiizen-points` |
| 同步 | - | 点击 "同步到钱包" 按钮 |

---

## 📊 积分规则

### 获得积分

| 行为 | 积分 | 条件 |
|------|------|------|
| 首次订单 | +100 | 完成第一个订单 |
| 消费 | +1/USDD | 每消费 1 USDD 获得 1 积分 |
| 邀请好友 | +50 | 好友注册并完成订单 |
| 商品评价 | +10 | 评价商品（每日最多 5 次） |

### 消耗积分

| 用途 | 积分 | 说明 |
|------|------|------|
| 短剧投资 | 1:1 | 1 积分 = 1 元投资额 |

---

## 🛠️ 技术架构

### 数据流

```
daiizen 购物
    ↓
创建订单（daiizen_orders）
    ↓
触发积分发放（触发器）
    ↓
插入积分记录（daiizen_point_transactions）
    ↓
更新用户积分统计（触发器）
    ↓
同步到 maoyan 钱包（自动）
```

### API 调用示例

#### 查询用户积分

```typescript
import { getUserPoints } from '@/lib/daiizen-integration';

const points = await getUserPoints(1);
console.log(points.available_points); // 890
```

#### 发放积分

```typescript
import { grantPoints } from '@/lib/daiizen-integration';

await grantPoints(1, 100, '首次订单奖励', 123);
```

#### 消耗积分

```typescript
import { spendPoints } from '@/lib/daiizen-integration';

await spendPoints(1, 100, '短剧投资：¥100', 'tx_uuid');
```

---

## 🚀 部署

### 1. 提交代码

```bash
cd /Users/mac/WorkBuddy/maoyan-vip
git add .
git commit -m "feat: daiizen 积分互通系统

- 新增 daiizen 积分管理页面
- 集成 Supabase daiizen 数据表
- 支持账号关联和积分同步
- 导航栏添加 daiizen 积分入口"
git push origin main
```

### 2. Vercel 自动部署

推送后 Vercel 会自动部署，无需手动操作。

### 3. 访问新页面

部署完成后访问：`https://maoyan.vip/daiizen-points`

---

## 📝 待办事项

- [ ] 在 Supabase 执行 `supabase-daiizen-migration.sql`
- [ ] 在 Vercel 添加 `SUPABASE_SERVICE_ROLE_KEY` 环境变量
- [ ] 测试账号关联功能
- [ ] 测试积分同步功能
- [ ] 测试短剧投资使用 daiizen 积分
- [ ] 在 daiizen 项目中添加积分页面（可选）

---

## 🔍 测试清单

### 功能测试

- [ ] 用户关联 daiizen 账号
- [ ] 解除 daiizen 账号关联
- [ ] 查看积分余额
- [ ] 查看积分交易记录
- [ ] 同步积分到 maoyan 钱包
- [ ] 使用 daiizen 积分投资短剧

### 数据测试

- [ ] 验证 daiizen_users 表数据正确
- [ ] 验证 daiizen_point_transactions 表数据正确
- [ ] 验证触发器正常工作
- [ ] 验证 user_points_summary 视图正确

---

## 📞 支持

如有问题，请联系：
- GitHub: https://github.com/seanlab007/maoyan-vip/issues
- Supabase Dashboard: https://supabase.com/dashboard/project/fczherphuixpdjuevzsh

---

## 📄 相关文件

| 文件 | 说明 |
|------|------|
| `supabase-daiizen-migration.sql` | Supabase 数据库迁移脚本 |
| `supabase-daiizen-api.ts` | Supabase daiizen API 封装 |
| `maoyan-vip/src/pages/DaiizenPoints.tsx` | daiizen 积分管理页面 |
| `maoyan-vip/src/styles/daiizen-points.css` | 页面样式 |
| `maoyan-vip/src/lib/daiizen-integration.ts` | 前端集成 API（待创建）|
