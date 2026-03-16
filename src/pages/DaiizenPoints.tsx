import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'tdesign-react';
import { Button, Input, Message, Space, Tag, Tabs, Dialog, Form } from 'tdesign-react';
import { Coins, Gift, History, Link, Unlink, Refresh } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import daiizenAPI from '@/lib/daiizen-integration';
import './styles/daiizen-points.css';

/**
 * daiizen 积分管理页面
 */
export default function DaiizenPoints() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [daiizenUser, setDaiizenUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ openId: '' });
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        Message.warning('请先登录');
        return;
      }

      const daiizenUserData = await daiizenAPI.getMyDaiizenUser(user.id);
      setDaiizenUser(daiizenUserData);

      if (daiizenUserData) {
        const [transactionsData, rulesData] = await Promise.all([
          daiizenAPI.getDaiizenPointTransactions(daiizenUserData.id),
          daiizenAPI.getDaiizenPointRules(),
        ]);

        setTransactions(transactionsData);
        setRules(rulesData.map(rule => ({
          ruleType: rule.rule_type,
          amount: rule.amount,
          description: getRuleDescription(rule),
        })));
      } else {
        const rulesData = await daiizenAPI.getDaiizenPointRules();
        setRules(rulesData.map(rule => ({
          ruleType: rule.rule_type,
          amount: rule.amount,
          description: getRuleDescription(rule),
        })));
      }
    } catch (error) {
      Message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRuleDescription = (rule: any) => {
    const descriptions: Record<string, string> = {
      'first_order': '首次订单奖励 100 积分',
      'order_completion': '每消费 1 USDD 获得 1 积分',
      'referral': '邀请好友获得 50 积分，好友获得 20 积分',
      'product_review': '评价商品获得 10 积分（每日最多 5 次）',
      'daily_login': '每日登录获得 1 积分（连续登录有额外奖励）',
    };
    return descriptions[rule.rule_type] || `${rule.rule_type}: ${rule.amount} 积分`;
  };

  const handleLinkAccount = async () => {
    try {
      if (!user?.id) {
        Message.warning('请先登录');
        return;
      }

      if (!linkForm.openId.trim()) {
        Message.warning('请输入 daiizen openId 或邮箱');
        return;
      }

      setLinking(true);
      await daiizenAPI.linkDaiizenAccount(user.id, linkForm.openId.trim());
      Message.success('账号关联成功');
      setShowLinkDialog(false);
      setLinkForm({ openId: '' });
      loadData();
    } catch (error: any) {
      Message.error(error.message || '关联失败');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      if (!user?.id) {
        Message.warning('请先登录');
        return;
      }

      const confirmed = await Dialog.confirm({
        header: '确认解除关联',
        body: '解除关联后， daiizen 积分将无法同步到 maoyan 钱包，确定要继续吗？',
      });

      if (!confirmed) return;

      await daiizenAPI.unlinkDaiizenAccount(user.id);
      Message.success('账号关联已解除');
      loadData();
    } catch (error: any) {
      if (error !== false) {
        Message.error(error.message || '解除失败');
      }
    }
  };

  const handleSyncPoints = async () => {
    try {
      if (!user?.id) {
        Message.warning('请先登录');
        return;
      }

      if (!daiizenUser?.available_points || daiizenUser.available_points <= 0) {
        Message.warning('daiizen 积分余额为 0');
        return;
      }

      setSyncing(true);
      Message.info('正在同步积分...');
      const synced = await daiizenAPI.syncDaiizenPoints(user.id);
      Message.success(`成功同步 ${synced} 积分到 maoyan 钱包`);
      loadData();
    } catch (error: any) {
      Message.error(error.message || '同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const formatPoints = (amount: number) => {
    return amount.toLocaleString();
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-logo">🛍️</div></div>;
  }

  return (
    <div className="daiizen-points-page">
      <div className="page-header">
        <h1 className="page-title">
          <Coins className="title-icon" size={28} />
          daiizen 积分
        </h1>
        <p className="page-subtitle">
          购物赚积分，投资短剧享收益
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="points-tabs"
      >
        {/* 概览 */}
        <Tabs.TabPanel key="overview" value="overview" label="积分概览">
          <div className="points-overview">
            <Card className="points-card gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins size={20} />
                  积分余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="points-balance">
                  <div className="balance-value">
                    {formatPoints(daiizenUser?.available_points || 0)}
                  </div>
                  <div className="balance-label">可用积分</div>
                </div>
                <div className="points-stats">
                  <div className="stat-item">
                    <div className="stat-value">{formatPoints(daiizenUser?.total_points || 0)}</div>
                    <div className="stat-label">累计获得</div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <div className="stat-value">
                      {formatPoints((daiizenUser?.total_points || 0) - (daiizenUser?.available_points || 0))}
                    </div>
                    <div className="stat-label">已消费</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="account-link-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {daiizenUser?.maoyan_user_id ? (
                    <Link size={20} />
                  ) : (
                    <Unlink size={20} />
                  )}
                  账号关联
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daiizenUser?.maoyan_user_id ? (
                  <div className="linked-status">
                    <div className="status-icon success">
                      <Link size={24} />
                    </div>
                    <div className="status-text">
                      <div className="status-title">已关联 maoyan.vip 账号</div>
                      <div className="status-desc">积分可以同步到钱包用于短剧投资</div>
                    </div>
                    <Button
                      theme="danger"
                      variant="outline"
                      size="large"
                      onClick={handleUnlinkAccount}
                    >
                      解除关联
                    </Button>
                  </div>
                ) : (
                  <div className="unlinked-status">
                    <div className="status-icon warning">
                      <Unlink size={24} />
                    </div>
                    <div className="status-text">
                      <div className="status-title">未关联 maoyan.vip 账号</div>
                      <div className="status-desc">关联后可以将 daiizen 积分同步到钱包</div>
                    </div>
                    <Button
                      theme="primary"
                      size="large"
                      onClick={() => setShowLinkDialog(true)}
                    >
                      关联账号
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {daiizenUser?.maoyan_user_id && (
              <Card className="quick-actions-card">
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      theme="primary"
                      size="large"
                      block
                      icon={<Refresh />}
                      onClick={handleSyncPoints}
                      disabled={!daiizenUser?.available_points || daiizenUser.available_points === 0}
                      loading={syncing}
                    >
                      同步积分到 maoyan 钱包
                    </Button>
                    <Button
                      theme="default"
                      size="large"
                      block
                      href="/drama"
                      target="_blank"
                    >
                      去投资短剧
                    </Button>
                    <Button
                      theme="default"
                      size="large"
                      block
                      href="https://daiizen.com"
                      target="_blank"
                    >
                      去 daiizen 购物
                    </Button>
                  </Space>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs.TabPanel>

        {/* 交易记录 */}
        <Tabs.TabPanel key="transactions" value="transactions" label="交易记录">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={20} />
                积分交易记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-icon">
                    {daiizenAPI.getPointTypeIcon(tx.type) === '🎁' ? <Gift /> : <Coins />}
                  </div>
                  <div className="tx-details">
                    <div className="tx-reason">{tx.reason || daiizenAPI.getPointTypeLabel(tx.type)}</div>
                    <div className="tx-time">{new Date(tx.created_at).toLocaleString('zh-CN')}</div>
                  </div>
                  <div className={`tx-amount ${tx.type}`}>
                    {tx.amount > 0 ? '+' : ''}{daiizenAPI.formatPoints(tx.amount)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="empty-state">
                  暂无交易记录
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.TabPanel>

        {/* 积分规则 */}
        <Tabs.TabPanel key="rules" value="rules" label="积分规则">
          <Card>
            <CardHeader>
              <CardTitle>如何获得积分</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="rules-list">
                  {rules.map((rule) => (
                    <div key={rule.ruleType} className="rule-item">
                      <div className="rule-icon">
                        <Gift size={20} />
                      </div>
                      <div className="rule-content">
                        <div className="rule-title">{rule.description}</div>
                        <div className="rule-amount">
                          <Tag theme="success" variant="light">
                            {rule.amount > 0 ? `+${rule.amount}` : rule.amount} 积分
                          </Tag>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rules-tips">
                  <h4>💡 积分使用说明</h4>
                  <ul>
                    <li>1 积分 = 1 USDD 购物金额</li>
                    <li>积分可同步到 maoyan.vip 钱包用于短剧投资</li>
                    <li>邀请好友可获得额外奖励</li>
                    <li>评价商品每日最多获得 5 次奖励</li>
                  </ul>
                </div>
              </CardContent>
          </Card>
        </Tabs.TabPanel>
      </Tabs>

      <Dialog
        visible={showLinkDialog}
        header="关联 daiizen 账号"
        onClose={() => setShowLinkDialog(false)}
        width={500}
      >
        <Form>
          <Form.FormItem label="daiizen OpenId 或邮箱">
            <Input
              placeholder="请输入你的 daiizen openId 或注册邮箱"
              value={linkForm.openId}
              onChange={(value) => setLinkForm({ ...linkForm, openId: value })}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              💡 openId 是 daiizen 登录时的唯一标识，可以在 daiizen 个人中心查看
            </div>
          </Form.FormItem>
        </Form>
        <div className="dialog-footer">
          <Space>
            <Button
              theme="default"
              onClick={() => setShowLinkDialog(false)}
            >
              取消
            </Button>
            <Button
              theme="primary"
              onClick={handleLinkAccount}
              loading={linking}
            >
              确认关联
            </Button>
          </Space>
        </div>
      </Dialog>
    </div>
  );
}
