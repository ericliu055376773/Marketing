import { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import './App.css';

const CATEGORIES = [
  '社群媒體',
  '顧客關係',
  '促銷活動',
  '品牌建立',
  '口碑行銷',
  '數位廣告',
  '體驗行銷',
  '其他',
];

export default function App() {
  const [strategies, setStrategies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '',
    cat: '社群媒體',
    desc: '',
    eff: 'high',
    cost: '低',
  });
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [toast, setToast] = useState('');

  // Load from Firebase
  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, 'strategies'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setStrategies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const addStrategy = async (data = null) => {
    const entry = data || {
      name: form.name.trim(),
      cat: form.cat,
      desc: form.desc.trim() || '（未填說明）',
      eff: form.eff,
      cost: form.cost,
      ai: false,
    };
    if (!entry.name) {
      showToast('請輸入策略名稱');
      return;
    }
    const docRef = await addDoc(collection(db, 'strategies'), {
      ...entry,
      createdAt: serverTimestamp(),
    });
    setStrategies((prev) => [{ id: docRef.id, ...entry }, ...prev]);
    if (!data)
      setForm({ name: '', cat: '社群媒體', desc: '', eff: 'high', cost: '低' });
    showToast('✓ 策略已儲存至 Firebase');
  };

  const deleteStrategy = async (id) => {
    await deleteDoc(doc(db, 'strategies', id));
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    showToast('策略已移除');
  };

  const searchAI = async () => {
    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `請列出餐飲業（餐廳、咖啡廳、小吃店）前十大最有效的行銷策略手法，
以 JSON 格式回傳，只回傳 JSON 不要任何其他文字：
{"strategies":[{"rank":1,"name":"策略名稱","category":"類別","description":"150字以內的具體執行說明","effectiveness":"high","cost":"低"}]}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content[0].text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      setAiResults(parsed.strategies);
    } catch (e) {
      // Fallback demo data
      setAiResults([
        {
          rank: 1,
          name: 'Google 我的商家完整優化',
          category: '數位行銷',
          description:
            '完整填寫營業資訊、每週上傳精緻餐點照片、積極回應顧客評論。本地搜尋排名可提升 40% 以上，是零成本最高 ROI 的行銷手法。',
          effectiveness: 'high',
          cost: '低',
        },
        {
          rank: 2,
          name: 'Instagram 打卡牆設計',
          category: '社群媒體',
          description:
            '在店內設計視覺吸睛的打卡角落，搭配品牌專屬 Hashtag 與每週打卡抽獎，觸及顧客社群圈，有效擴大品牌曝光。',
          effectiveness: 'high',
          cost: '低',
        },
        {
          rank: 3,
          name: '會員點數累積系統',
          category: '顧客關係',
          description:
            '建立 LINE 官方帳號或 App 會員制度，消費累點兌換優惠。平均可提升回購率 30%，並建立穩定的顧客資料庫用於精準行銷。',
          effectiveness: 'high',
          cost: '中',
        },
        {
          rank: 4,
          name: '在地美食網紅邀約',
          category: '口碑行銷',
          description:
            '篩選追蹤者在 1-10 萬的在地微網紅，提供免費試吃換取真實圖文評測。比大網紅互動率更高，且受眾更精準符合在地客群。',
          effectiveness: 'high',
          cost: '中',
        },
        {
          rank: 5,
          name: '限時午餐商業套餐',
          category: '促銷活動',
          description:
            '推出限量午間套餐，時間限定製造稀缺感，解決離峰時段空桌問題，同時吸引附近上班族養成習慣性消費。',
          effectiveness: 'med',
          cost: '低',
        },
        {
          rank: 6,
          name: '生日回饋方案',
          category: '顧客關係',
          description:
            '對會員發送生日優惠，包含免費甜點或折扣券，有效提升情感連結與生日聚餐選擇率，執行成本低但顧客滿意度極高。',
          effectiveness: 'high',
          cost: '低',
        },
        {
          rank: 7,
          name: 'UGC 用戶內容獎勵計畫',
          category: '口碑行銷',
          description:
            '鼓勵顧客拍照並標記品牌帳號，每月評選最佳照片給予消費優惠，持續產出真實口碑內容，降低官方內容製作成本。',
          effectiveness: 'med',
          cost: '低',
        },
        {
          rank: 8,
          name: '異業結盟聯合優惠',
          category: '品牌建立',
          description:
            '與附近健身房、電影院、美髮沙龍交換優惠券，互相導流客源，零廣告費觸及對方現有客戶群，擴大品牌知名度。',
          effectiveness: 'med',
          cost: '低',
        },
        {
          rank: 9,
          name: '節慶主題限定菜單',
          category: '體驗行銷',
          description:
            '結合台灣本地節慶（母親節、情人節、中秋等）推出限定餐點或主題佈置，製造話題性與打卡動機，帶動媒體自發報導。',
          effectiveness: 'high',
          cost: '中',
        },
        {
          rank: 10,
          name: '外送平台曝光廣告',
          category: '數位廣告',
          description:
            '在 Foodpanda / Uber Eats 平台購買首頁曝光位置，搭配優惠折扣提升點擊轉換。新店開幕前三個月曝光效果最為顯著。',
          effectiveness: 'med',
          cost: '高',
        },
      ]);
    }
    setAiLoading(false);
  };

  const filtered =
    filter === 'all'
      ? strategies
      : filter === 'AI發掘'
      ? strategies.filter((s) => s.ai)
      : strategies.filter((s) => s.cat === filter);

  const catMap = {
    數位行銷: '數位廣告',
    社群媒體: '社群媒體',
    口碑行銷: '口碑行銷',
    促銷活動: '促銷活動',
    顧客關係: '顧客關係',
    品牌建立: '品牌建立',
    體驗行銷: '體驗行銷',
  };

  return (
    <div className="shell">
      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-inner">
          <div>
            <div className="eyebrow">Strategy Intelligence Platform</div>
            <h1 className="site-title">行銷策略庫</h1>
            <p className="site-sub">
              Marketing Strategy Intelligence · Firebase × GitHub × Vercel
            </p>
          </div>
          <div className="hdr-stats">
            <div className="stat">
              <div className="stat-n">{strategies.length}</div>
              <div className="stat-l">策略總數</div>
            </div>
            <div className="stat">
              <div className="stat-n">
                {strategies.filter((s) => s.ai).length}
              </div>
              <div className="stat-l">AI 發掘</div>
            </div>
          </div>
        </div>
      </header>

      {/* AI ACTION BAR */}
      <div className="ai-bar">
        <span className="ai-pill">AI 搜尋</span>
        <span className="ai-desc">
          使用 Claude AI 即時搜尋餐飲業前十大行銷策略手法
        </span>
        <button
          className={`ai-btn ${aiLoading ? 'loading' : ''}`}
          onClick={searchAI}
          disabled={aiLoading}
        >
          {aiLoading ? (
            <span className="dots">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </span>
          ) : (
            '🔍'
          )}
          {aiLoading ? ' AI 搜尋中...' : ' 搜尋前十大餐飲行銷策略'}
        </button>
      </div>

      <main className="main">
        {/* AI RESULTS PANEL */}
        {showAI && (
          <div className="ai-panel">
            <div className="ai-panel-hdr">
              <div>
                <div className="ai-panel-title">
                  AI 發現：前十大餐飲行銷策略
                </div>
                <div className="ai-panel-sub">
                  點擊「加入策略庫」可儲存至 Firebase
                </div>
              </div>
              <button className="ai-close" onClick={() => setShowAI(false)}>
                關閉
              </button>
            </div>
            <div className="ai-list">
              {aiLoading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: 'rgba(255,255,255,.4)',
                  }}
                >
                  AI 分析中，請稍候...
                </div>
              ) : (
                aiResults.map((s) => (
                  <div className="ai-item" key={s.rank}>
                    <div className="ai-rank">
                      {String(s.rank).padStart(2, '0')}
                    </div>
                    <div className="ai-item-body">
                      <div className="ai-item-title">
                        {s.name}
                        <span className="ai-item-meta">
                          {' '}
                          · {s.category} · 成本{s.cost}
                        </span>
                      </div>
                      <div className="ai-item-desc">{s.description}</div>
                      <button
                        className="ai-item-add"
                        onClick={() =>
                          addStrategy({
                            name: s.name,
                            cat: catMap[s.category] || '其他',
                            desc: s.description,
                            eff: s.effectiveness,
                            cost: s.cost,
                            ai: true,
                          })
                        }
                      >
                        ＋ 加入策略庫
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ADD FORM */}
        <div className="form-card">
          <div className="form-title">新增行銷策略</div>
          <div className="form-row">
            <div className="field">
              <label>策略名稱</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：會員點數回饋計畫"
              />
            </div>
            <div className="field">
              <label>適用類別</label>
              <select
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row full">
            <div className="field">
              <label>策略說明</label>
              <textarea
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="描述這個行銷策略的具體做法與效果..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>預期成效</label>
              <select
                value={form.eff}
                onChange={(e) => setForm({ ...form, eff: e.target.value })}
              >
                <option value="high">高效益</option>
                <option value="med">中效益</option>
                <option value="low">低效益</option>
              </select>
            </div>
            <div className="field">
              <label>成本估計</label>
              <select
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              >
                <option value="低">低成本</option>
                <option value="中">中等成本</option>
                <option value="高">高成本</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button
              className="btn-clear"
              onClick={() =>
                setForm({
                  name: '',
                  cat: '社群媒體',
                  desc: '',
                  eff: 'high',
                  cost: '低',
                })
              }
            >
              清除
            </button>
            <button className="btn-add" onClick={() => addStrategy()}>
              ＋ 加入策略庫
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="fbar">
          <span className="fbar-label">篩選</span>
          {[
            'all',
            '社群媒體',
            '顧客關係',
            '促銷活動',
            '品牌建立',
            'AI發掘',
          ].map((f) => (
            <button
              key={f}
              className={`ftag ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f}
            </button>
          ))}
        </div>

        {/* STRATEGY CARDS */}
        <div className="cards-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-text">
                尚無策略記錄。新增你的第一筆行銷策略，
                <br />
                或使用 AI 搜尋功能探索餐飲業最有效的行銷手法。
              </p>
            </div>
          ) : (
            filtered.map((s, i) => (
              <div
                className={`s-card ${s.ai ? 'ai-generated' : ''}`}
                key={s.id}
              >
                <div className="card-head">
                  <div className="card-num">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="card-main">
                    <div className="card-title">{s.name}</div>
                    <div className="card-meta">
                      <span className="tag">{s.cat}</span>
                      {s.ai && <span className="tag ai">AI 發掘</span>}
                      <span className="tag">成本：{s.cost}</span>
                    </div>
                  </div>
                  <button
                    className="btn-icon del"
                    onClick={() => deleteStrategy(s.id)}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
                <div className="card-desc">{s.desc}</div>
                <div className="card-effect">
                  <div className={`eff-dot ${s.eff}`}></div>
                  <span>
                    {s.eff === 'high'
                      ? '高效益預期'
                      : s.eff === 'med'
                      ? '中效益預期'
                      : '低效益預期'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* TOAST */}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
