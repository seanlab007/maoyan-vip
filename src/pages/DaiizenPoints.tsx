import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import '@/styles/daiizen-points.css';

/**
 * daiizen 积分管理页面
 */
export default function DaiizenPoints() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [daiizenUser, setDaiizenUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ openId: '' });
  const [syncing, setSyncing] = useState(false);

  const handleOpenDaiizen = () => {
    window.open('https://daiizen.com', '_blank');
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setLoading(false);
        return;
      }

      // TODO: 实现 API 调用
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    try {
      // TODO: 实现账号关联逻辑
      setShowLinkDialog(false);
    } catch (error) {
      console.error('关联账号失败:', error);
    }
  };

  const handleSyncPoints = async () => {
    try {
      setSyncing(true);
      // TODO: 实现积分同步逻辑
      setTimeout(() => setSyncing(false), 2000);
    } catch (error) {
      console.error('同步积分失败:', error);
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="daiizen-points-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="daiizen-points-page">
      <div className="daiizen-points-header">
        <h1>🛍️ daiizen 积分</h1>
        <p className="subtitle">管理与 daiizen 电商平台的积分互通</p>
      </div>

      <div className="daiizen-tabs">
        <button
          className={`daiizen-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          积分概览
        </button>
        <button
          className={`daiizen-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          交易记录
        </button>
        <button
          className={`daiizen-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          积分规则
        </button>
      </div>

      <div className="daiizen-content">
        {activeTab === 'overview' && (
          <div className="daiizen-overview">
            <div className="daiizen-cards">
              <div className="daiizen-card">
                <div className="daiizen-card-icon">🪙</div>
                <div className="daiizen-card-value">0</div>
                <div className="daiizen-card-label">当前积分</div>
              </div>
              <div className="daiizen-card">
                <div className="daiizen-card-icon">📊</div>
                <div className="daiizen-card-value">0</div>
                <div className="daiizen-card-label">累计获得</div>
              </div>
              <div className="daiizen-card">
                <div className="daiizen-card-icon">💳</div>
                <div className="daiizen-card-value">0</div>
                <div className="daiizen-card-label">已消费</div>
              </div>
            </div>

            <div className="daiizen-actions">
              <button
                className="daiizen-button daiizen-button-primary"
                onClick={handleOpenDaiizen}
              >
                🛍️ 访问 daiizen.com
              </button>
              <button
                className="daiizen-button daiizen-button-secondary"
                onClick={() => setShowLinkDialog(true)}
              >
                🔗 关联 daiizen 账号
              </button>
              <button
                className="daiizen-button daiizen-button-secondary"
                onClick={handleSyncPoints}
                disabled={syncing}
              >
                {syncing ? '同步中...' : '🔄 同步积分到钱包'}
              </button>
            </div>

            <div className="daiizen-info">
              <h3>💡 提示</h3>
              <ul>
                <li>关联 daiizen 账号后，可以同步积分到猫眼钱包</li>
                <li>daiizen 积分可以兑换影视项目优惠券</li>
                <li>积分同步可能需要 1-2 分钟</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="daiizen-transactions">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>暂无交易记录</p>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="daiizen-rules">
            <div className="rule-item">
              <div className="rule-icon">🛒</div>
              <div className="rule-content">
                <h4>购物返积分</h4>
                <p>在 daiizen 每消费 1 美元，获得 10 积分</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-icon">🎁</div>
              <div className="rule-content">
                <h4>签到奖励</h4>
                <p>每日签到获得 5 积分，连续签到额外奖励</p>
              </div>
            </div>
            <div className="rule-item">
              <div className="rule-icon">👥</div>
              <div className="rule-content">
                <h4>邀请好友</h4>
                <p>邀请好友注册，双方各获得 50 积分</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLinkDialog && (
        <div className="daiizen-modal-overlay" onClick={() => setShowLinkDialog(false)}>
          <div className="daiizen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="daiizen-modal-header">
              <h2>关联 daiizen 账号</h2>
              <button
                className="daiizen-close-button"
                onClick={() => setShowLinkDialog(false)}
              >
                ✕
              </button>
            </div>
            <div className="daiizen-modal-body">
              <div className="daiizen-form-group">
                <label>daiizen OpenID</label>
                <input
                  type="text"
                  placeholder="请输入您的 daiizen OpenID"
                  value={linkForm.openId}
                  onChange={(e) => setLinkForm({ ...linkForm, openId: e.target.value })}
                />
                <p className="daiizen-help-text">
                  您的 OpenID 可以在 daiizen 个人中心找到
                </p>
              </div>
            </div>
            <div className="daiizen-modal-footer">
              <button
                className="daiizen-button daiizen-button-secondary"
                onClick={() => setShowLinkDialog(false)}
              >
                取消
              </button>
              <button
                className="daiizen-button daiizen-button-primary"
                onClick={handleLinkAccount}
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
