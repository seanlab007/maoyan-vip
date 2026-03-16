import React from 'react'
import { Video, Play, TrendingUp, Star, Clock, Users } from 'lucide-react'

const DRAMA_LIST = [
  { id: 1, name: '念念有词', genre: '穿书', views: '30亿+', rating: 9.6, duration: '80集', investors: 12500, hot: true, desc: '穿越古代的学霸女主，用现代知识改变命运，甜虐交织' },
  { id: 2, name: '盛夏芬德拉', genre: '甜宠', views: '10亿+', rating: 9.4, duration: '60集', investors: 8900, hot: true, desc: '夏天里的浪漫邂逅，青春与成长的动人故事' },
  { id: 3, name: '家里家外', genre: '都市', views: '8亿+', rating: 9.2, duration: '50集', investors: 6700, hot: true, desc: '都市家庭的情感纠葛，真实反映现代生活' },
  { id: 4, name: '昭然赴礼', genre: '职场', views: '5亿+', rating: 9.5, duration: '45集', investors: 5400, hot: true, desc: '体制内大佬与大学老师的极限拉扯，性张力拉满' },
  { id: 5, name: '深情诱引', genre: '悬疑', views: '3亿+', rating: 9.1, duration: '40集', investors: 4200, hot: true, desc: '层层反转的悬疑剧情，每个角色都有秘密' },
]

const INVEST_TIERS = [
  { name: '体验投资', price: 1, returns: '收益分成', desc: '小额试水，按收益阶梯分成' },
  { name: '普通投资', price: 100, returns: '8-15%', desc: '标准投资档位，稳定收益' },
  { name: '黄金投资', price: 1000, returns: '12-20%', desc: '高额回报 + 角色出演机会' },
  { name: '钻石投资', price: 10000, returns: '15-25%', desc: '顶级收益 + 品牌植入权益' },
]

export default function DramaPage() {
  return (
    <div className="drama-page">
      <div className="page-header">
        <div className="header-content">
          <Video className="header-icon" size={32} />
          <div>
            <h1 className="page-title">短剧投资</h1>
            <p className="page-subtitle">投资热门短剧，共享收益红利</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <Users size={18} className="stat-icon" />
            <span className="stat-value">37,700+</span>
            <span className="stat-label">投资人数</span>
          </div>
          <div className="stat">
            <TrendingUp size={18} className="stat-icon" />
            <span className="stat-value">56亿+</span>
            <span className="stat-label">累计播放</span>
          </div>
        </div>
      </div>

      {/* 投资阶梯 */}
      <div className="invest-tiers">
        <h2 className="section-title">投资阶梯</h2>
        <div className="tiers-grid">
          {INVEST_TIERS.map((tier, idx) => (
            <div key={idx} className={`tier-card ${tier.name === '黄金投资' ? 'featured' : ''}`}>
              {tier.name === '黄金投资' && <div className="tier-badge">推荐</div>}
              <div className="tier-name">{tier.name}</div>
              <div className="tier-price">
                <span className="currency">¥</span>
                <span className="amount">{tier.price.toLocaleString()}</span>
              </div>
              <div className="tier-returns">预期收益：{tier.returns}</div>
              <div className="tier-desc">{tier.desc}</div>
              <button className={`tier-btn ${tier.name === '黄金投资' ? 'featured' : ''}`}>
                立即投资
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 热门短剧列表 */}
      <div className="drama-list-section">
        <h2 className="section-title">
          <Star className="title-icon" size={20} />
          热门短剧
        </h2>
        <div className="drama-grid">
          {DRAMA_LIST.map(drama => (
            <div key={drama.id} className="drama-card">
              {drama.hot && <div className="hot-tag">HOT</div>}
              <div className="drama-image">
                <div className="image-placeholder">
                  <Video size={40} />
                </div>
              </div>
              <div className="drama-info">
                <div className="drama-genre">{drama.genre}</div>
                <h3 className="drama-name">{drama.name}</h3>
                <p className="drama-desc">{drama.desc}</p>
                <div className="drama-meta">
                  <div className="meta-item">
                    <Star size={14} className="meta-icon" />
                    <span>{drama.rating}</span>
                  </div>
                  <div className="meta-item">
                    <TrendingUp size={14} className="meta-icon" />
                    <span>{drama.views}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} className="meta-icon" />
                    <span>{drama.duration}</span>
                  </div>
                </div>
                <div className="drama-investors">
                  <Users size={14} className="meta-icon" />
                  <span>{drama.investors.toLocaleString()} 人已投资</span>
                </div>
              </div>
              <button className="invest-btn">
                <Play size={16} />
                投资
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 品牌植入 */}
      <div className="brand-implant-section">
        <h2 className="section-title">品牌植入方案</h2>
        <div className="brand-cards">
          <div className="brand-card">
            <div className="brand-icon">🎯</div>
            <h3>产品露出</h3>
            <p>短剧中自然植入品牌产品，增加曝光</p>
            <div className="brand-price">¥5,000 起</div>
          </div>
          <div className="brand-card">
            <div className="brand-icon">🎬</div>
            <h3>场景植入</h3>
            <p>定制场景，深度关联品牌故事</p>
            <div className="brand-price">¥20,000 起</div>
          </div>
          <div className="brand-card">
            <div className="brand-icon">📺</div>
            <h3>剧情植入</h3>
            <p>品牌作为核心元素融入剧情</p>
            <div className="brand-price">¥50,000 起</div>
          </div>
          <div className="brand-card">
            <div className="brand-icon">👥</div>
            <h3>角色代言</h3>
            <p>主要演员角色代言品牌产品</p>
            <div className="brand-price">¥100,000 起</div>
          </div>
        </div>
      </div>
    </div>
  )
}
