import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const COURSES = [
  {
    id: 'nutrition_basics',
    title: '健康营养学基础',
    subtitle: '了解宏量营养素与微量营养素',
    icon: '🥗',
    color: '#22d3a0',
    reward: 200,
    duration: '45分钟',
    lessons: [
      { id: 1, title: '什么是宏量营养素？', duration: '8分钟', locked: false },
      { id: 2, title: '蛋白质的重要性', duration: '10分钟', locked: false },
      { id: 3, title: '碳水化合物与血糖', duration: '9分钟', locked: true },
      { id: 4, title: '健康脂肪的选择', duration: '8分钟', locked: true },
      { id: 5, title: '维生素与矿物质', duration: '10分钟', locked: true },
    ],
    quiz: [
      { q: '以下哪种食物富含优质蛋白质？', options: ['白米饭', '鸡蛋', '白糖', '植物油'], answer: 1 },
      { q: '每天推荐的蔬菜摄入量是多少？', options: ['100g', '200g', '300~500g', '1000g'], answer: 2 },
      { q: '抗炎饮食应该减少哪类食物？', options: ['深色蔬菜', '坚果', '加工食品', '鱼类'], answer: 2 },
    ],
    tags: ['营养', '健康', '入门'],
    enrolled: 1284,
  },
  {
    id: 'anti_inflammation',
    title: '抗炎饮食实战指南',
    subtitle: '用食物对抗慢性炎症，延缓衰老',
    icon: '🫐',
    color: '#9d6dff',
    reward: 300,
    duration: '60分钟',
    lessons: [
      { id: 1, title: '什么是慢性炎症？', duration: '10分钟', locked: false },
      { id: 2, title: '10大抗炎超级食物', duration: '12分钟', locked: true },
      { id: 3, title: '促炎食物黑名单', duration: '10分钟', locked: true },
      { id: 4, title: '一周抗炎食谱', duration: '15分钟', locked: true },
      { id: 5, title: '抗炎生活方式', duration: '13分钟', locked: true },
    ],
    quiz: [
      { q: '以下哪种食物具有强抗炎效果？', options: ['白面包', '蓝莓', '薯片', '可乐'], answer: 1 },
      { q: '慢性炎症与以下哪种疾病有关？', options: ['骨折', '心脏病', '近视', '龋齿'], answer: 1 },
      { q: 'Omega-3脂肪酸主要来源于？', options: ['猪油', '深海鱼', '白糖', '精制面粉'], answer: 1 },
    ],
    tags: ['抗炎', '长寿', '进阶'],
    enrolled: 876,
  },
  {
    id: 'longevity_plan',
    title: '长寿规划：科学延寿方案',
    subtitle: '结合最新研究，制定个人长寿计划',
    icon: '🌿',
    color: '#f6c90e',
    reward: 500,
    duration: '90分钟',
    lessons: [
      { id: 1, title: '长寿的科学基础', duration: '15分钟', locked: false },
      { id: 2, title: '热量限制与间歇性断食', duration: '18分钟', locked: true },
      { id: 3, title: '运动与端粒长度', duration: '15分钟', locked: true },
      { id: 4, title: '睡眠与细胞修复', duration: '15分钟', locked: true },
      { id: 5, title: '压力管理与长寿', duration: '12分钟', locked: true },
      { id: 6, title: '制定你的长寿计划', duration: '15分钟', locked: true },
    ],
    quiz: [
      { q: '间歇性断食最常见的方案是？', options: ['3:4断食', '16:8断食', '5:2断食', '全天断食'], answer: 1 },
      { q: '以下哪种运动对端粒保护效果最好？', options: ['久坐', '有氧运动', '完全不动', '过度训练'], answer: 1 },
      { q: '充足睡眠对长寿的主要贡献是？', options: ['增加体重', '细胞修复与排毒', '降低智力', '增加压力'], answer: 1 },
    ],
    tags: ['长寿', '科学', '高级'],
    enrolled: 432,
  },
]

export default function LearnEarnPage() {
  const { profile, wallet, setWallet } = useAuthStore()
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [quizMode, setQuizMode] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [watchedLessons, setWatchedLessons] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleWatchLesson = (lessonId: number) => {
    if (!watchedLessons.includes(lessonId)) {
      setWatchedLessons(prev => [...prev, lessonId])
      toast.success(`✅ 课时完成！继续学习下一节`)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!selectedCourse || !profile?.id) return
    if (quizAnswers.length < selectedCourse.quiz.length) {
      toast.error('请回答所有问题'); return
    }

    const correct = quizAnswers.filter((a, i) => a === selectedCourse.quiz[i].answer).length
    const pass = correct >= Math.ceil(selectedCourse.quiz.length * 0.6)

    setQuizSubmitted(true)

    if (pass) {
      setSubmitting(true)
      try {
        const reward = selectedCourse.reward
        await supabase.from('course_completions').insert({
          user_id: profile.id,
          course_id: selectedCourse.id,
          score: Math.round((correct / selectedCourse.quiz.length) * 100),
          reward_points: reward,
        })

        await supabase.from('point_transactions').insert({
          user_id: profile.id,
          type: 'course_complete',
          amount: reward,
          description: `完成课程：${selectedCourse.title}`,
          status: 'completed',
        })

        const newBalance = (wallet?.balance || 0) + reward
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id)
        setWallet({ ...(wallet as any), balance: newBalance })
        setCompletedCourses(prev => [...prev, selectedCourse.id])
        toast.success(`🎉 恭喜通过考试！获得 +${reward} 积分`)
      } catch (err) {
        console.error(err)
      } finally {
        setSubmitting(false)
      }
    } else {
      toast.error(`❌ 答对 ${correct}/${selectedCourse.quiz.length}，未通过，请重新学习后再考`)
    }
  }

  if (selectedCourse && !quizMode) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
        <button onClick={() => { setSelectedCourse(null); setWatchedLessons([]) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20 }}>
          ← 返回课程列表
        </button>

        <div style={{ background: `${selectedCourse.color}11`, border: `1px solid ${selectedCourse.color}44`, borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 40 }}>{selectedCourse.icon}</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selectedCourse.title}</h2>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>{selectedCourse.subtitle}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text3)' }}>
                <span>⏱ {selectedCourse.duration}</span>
                <span>👥 {selectedCourse.enrolled.toLocaleString()}人已学</span>
                <span style={{ color: 'var(--gold)' }}>🏆 +{selectedCourse.reward} 积分</span>
              </div>
            </div>
          </div>
        </div>

        {/* 课时列表 */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>课程内容</h3>
          {selectedCourse.lessons.map((lesson, i) => {
            const watched = watchedLessons.includes(lesson.id)
            const canWatch = i === 0 || watchedLessons.includes(selectedCourse.lessons[i - 1].id)
            return (
              <div key={lesson.id} onClick={() => canWatch && handleWatchLesson(lesson.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 10, background: watched ? 'rgba(34,211,160,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${watched ? '#22d3a044' : 'var(--border)'}`, marginBottom: 8, cursor: canWatch ? 'pointer' : 'not-allowed', opacity: canWatch ? 1 : 0.5 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: watched ? '#22d3a0' : (canWatch ? selectedCourse.color + '33' : 'rgba(255,255,255,0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {watched ? '✓' : (canWatch ? '▶' : '🔒')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: watched ? 700 : 400, color: watched ? '#22d3a0' : 'var(--text)' }}>{lesson.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{lesson.duration}</div>
                </div>
                {watched && <span style={{ fontSize: 12, color: '#22d3a0' }}>已完成</span>}
              </div>
            )
          })}
        </div>

        {/* 开始考试 */}
        {watchedLessons.length >= 2 && !completedCourses.includes(selectedCourse.id) && (
          <button onClick={() => { setQuizMode(true); setQuizAnswers([]); setQuizSubmitted(false) }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: selectedCourse.color, color: '#000', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer' }}>
            📝 开始考试，获得 +{selectedCourse.reward} 积分
          </button>
        )}
        {completedCourses.includes(selectedCourse.id) && (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34,211,160,0.1)', borderRadius: 12, color: '#22d3a0', fontWeight: 700 }}>
            ✅ 已完成该课程，积分已发放
          </div>
        )}
        {watchedLessons.length < 2 && (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, color: 'var(--text3)', fontSize: 13 }}>
            完成至少2节课后可参加考试
          </div>
        )}
      </div>
    )
  }

  if (selectedCourse && quizMode) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📝 {selectedCourse.title}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>答对60%即可通过，获得 +{selectedCourse.reward} 积分</p>

        {selectedCourse.quiz.map((q, qi) => (
          <div key={qi} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Q{qi + 1}. {q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = quizAnswers[qi] === oi
                const correct = quizSubmitted && oi === q.answer
                const wrong = quizSubmitted && selected && oi !== q.answer
                return (
                  <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers(prev => { const next = [...prev]; next[qi] = oi; return next })}
                    style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'left', border: `1px solid ${correct ? '#22d3a0' : wrong ? '#ff6b6b' : selected ? selectedCourse.color : 'var(--border)'}`, background: correct ? 'rgba(34,211,160,0.15)' : wrong ? 'rgba(255,107,107,0.15)' : selected ? `${selectedCourse.color}22` : 'transparent', color: correct ? '#22d3a0' : wrong ? '#ff6b6b' : 'var(--text)', cursor: quizSubmitted ? 'default' : 'pointer', fontSize: 14 }}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {!quizSubmitted ? (
          <button onClick={handleSubmitQuiz} disabled={submitting}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: submitting ? 'rgba(246,201,14,0.4)' : 'var(--gold)', color: '#000', fontWeight: 800, fontSize: 15, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? '提交中...' : '✅ 提交答案'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setQuizMode(false); setQuizSubmitted(false) }}
              style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 700 }}>
              返回课程
            </button>
            {!completedCourses.includes(selectedCourse.id) && (
              <button onClick={() => { setQuizAnswers([]); setQuizSubmitted(false) }}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--gold)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                重新答题
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🎓 听课赚积分</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>完成课程并通过考试，获得积分奖励</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COURSES.map(course => (
          <div key={course.id} onClick={() => setSelectedCourse(course)}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${completedCourses.includes(course.id) ? '#22d3a044' : 'var(--border)'}`, borderRadius: 16, padding: '18px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{course.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{course.title}</h3>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', flexShrink: 0, marginLeft: 12 }}>+{course.reward}</div>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>{course.subtitle}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                  <span style={{ color: 'var(--text3)' }}>⏱ {course.duration}</span>
                  <span style={{ color: 'var(--text3)' }}>📚 {course.lessons.length}节课</span>
                  <span style={{ color: 'var(--text3)' }}>👥 {course.enrolled.toLocaleString()}人</span>
                  {course.tags.map(t => <span key={t} style={{ background: `${course.color}22`, color: course.color, padding: '2px 8px', borderRadius: 99 }}>{t}</span>)}
                </div>
              </div>
            </div>
            {completedCourses.includes(course.id) && (
              <div style={{ marginTop: 10, padding: '6px 12px', background: 'rgba(34,211,160,0.1)', borderRadius: 8, color: '#22d3a0', fontSize: 12, fontWeight: 700, display: 'inline-block' }}>
                ✅ 已完成
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
