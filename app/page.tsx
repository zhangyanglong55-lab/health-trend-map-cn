"use client";

import { useMemo, useState } from "react";

type CityKey = "成都" | "杭州";

const cities: Record<CityKey, {
  weather: number;
  temperature: string;
  change: string;
  status: string;
  tone: string;
  position: { left: string; top: string };
  detail: string;
}> = {
  成都: {
    weather: 2.68,
    temperature: "30.7°C",
    change: "3日升温 1.1°C",
    status: "天气风险较低",
    tone: "low",
    position: { left: "38%", top: "57%" },
    detail: "当前未出现快速降温。搜索、购药与人口流动指数仍待授权接入。",
  },
  杭州: {
    weather: 40.93,
    temperature: "27.1°C",
    change: "3日降温 1.8°C",
    status: "天气信号需关注",
    tone: "watch",
    position: { left: "70%", top: "54%" },
    detail: "相对近期基线偏冷，持续偏冷指标较高；这不是流感病例预警。",
  },
};

const pendingCities = [
  ["北京", "61%", "28%"], ["广州", "58%", "76%"], ["上海", "73%", "48%"],
  ["西安", "47%", "45%"], ["武汉", "57%", "55%"], ["昆明", "39%", "72%"],
  ["哈尔滨", "75%", "14%"], ["乌鲁木齐", "20%", "27%"],
];

export default function Home() {
  const [mode, setMode] = useState<"public" | "professional">("public");
  const [selectedCity, setSelectedCity] = useState<CityKey>("杭州");
  const [showRoute, setShowRoute] = useState(true);
  const city = cities[selectedCity];

  const confidence = useMemo(() => mode === "public" ? "数据接入中" : "低 · 仅天气源有效", [mode]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div>
            <div className="brand-name">健康风向</div>
            <div className="brand-sub">全国健康趋势与传播风险地图</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="freshness"><span /> 数据更新至 2026.08.15</div>
          <div className="mode-switch" aria-label="显示模式">
            <button className={mode === "public" ? "active" : ""} onClick={() => setMode("public")}>公众版</button>
            <button className={mode === "professional" ? "active" : ""} onClick={() => setMode("professional")}>专业版</button>
          </div>
        </div>
      </header>

      <section className="notice">
        <span className="notice-icon">i</span>
        <p><strong>原型数据说明</strong>　目前已接入成都、杭州一年天气数据及国家流感中心周报索引。百度、微信、抖音健康关注指数与城市迁徙强度尚待授权，不展示推测数值。</p>
        <button aria-label="收起说明">×</button>
      </section>

      <section className="overview">
        <div>
          <div className="eyebrow">今日全国观察</div>
          <h1>天气风险先行，健康信号待交叉验证</h1>
          <p>地图每日汇总多平台关注、药品需求、官方监测、天气与人口流动。现阶段仅天气层可以计算。</p>
        </div>
        <div className="overview-stats">
          <div><span>已接通城市</span><strong>2</strong><small>/ 30 首轮目标</small></div>
          <div><span>有效数据源</span><strong>2</strong><small>天气 · 官方周报</small></div>
          <div><span>当前置信度</span><strong className="confidence">{confidence}</strong><small>不发布疾病预警</small></div>
        </div>
      </section>

      <section className="workspace">
        <div className="map-card">
          <div className="card-head">
            <div>
              <h2>全国健康趋势图</h2>
              <p>2026年8月15日 · 城市日级视图</p>
            </div>
            <div className="layer-pills">
              <button className="active"><i className="dot weather" />天气风险</button>
              <button disabled><i className="dot pending" />健康关注　待授权</button>
              <button className={showRoute ? "active" : ""} onClick={() => setShowRoute(!showRoute)}><i className="dot route" />关联路线</button>
            </div>
          </div>

          <div className="map-stage" aria-label="中国城市健康趋势示意地图">
            <div className="map-grid" />
            <div className="china-shape"><span>CHINA</span></div>
            {pendingCities.map(([name, left, top]) => (
              <div className="city pending-city" style={{ left, top }} key={name}>
                <span className="point" /><label>{name}</label>
              </div>
            ))}
            {(Object.keys(cities) as CityKey[]).map((name) => (
              <button
                key={name}
                className={`city active-city ${cities[name].tone} ${selectedCity === name ? "selected" : ""}`}
                style={cities[name].position}
                onClick={() => setSelectedCity(name)}
                aria-label={`查看${name}`}
              >
                <span className="pulse" /><span className="point" /><label>{name}</label>
              </button>
            ))}
            {showRoute && <div className="route-line"><span>关联框架 · 流动强度待授权</span></div>}
            <div className="map-legend"><span><i className="legend low" />较低</span><span><i className="legend medium" />关注</span><span><i className="legend high" />较高</span><span><i className="legend missing" />待接入</span></div>
          </div>

          <div className="timeline">
            <button aria-label="播放时间轴">▶</button>
            <div className="timeline-track"><span style={{ width: "86%" }} /><i style={{ left: "86%" }} /></div>
            <span>2025.08.16</span><strong>2026.08.15</strong>
          </div>
        </div>

        <aside className="side-panel">
          <div className="city-header">
            <div><span className={`status-dot ${city.tone}`} /><h2>{selectedCity}</h2><p>{city.status}</p></div>
            <button aria-label="关闭城市详情">×</button>
          </div>
          <div className="score-block">
            <div><span>天气风险修正分</span><strong>{city.weather.toFixed(1)}</strong><small>/ 100</small></div>
            <div className="score-ring" style={{ "--score": `${city.weather * 3.6}deg` } as React.CSSProperties}><span>{Math.round(city.weather)}</span></div>
          </div>
          <div className="city-summary">{city.detail}</div>
          <div className="metrics">
            <div><span>平均气温</span><strong>{city.temperature}</strong></div>
            <div><span>近期变化</span><strong>{city.change}</strong></div>
            <div><span>健康关注</span><strong className="pending-text">待授权</strong></div>
            <div><span>人口流动</span><strong className="pending-text">待授权</strong></div>
          </div>

          {mode === "professional" && (
            <div className="professional-box">
              <h3>专业数据状态</h3>
              <div><span>天气历史完整度</span><strong>365 / 365</strong></div>
              <div><span>国家流感中心周报</span><strong>20期索引</strong></div>
              <div><span>模型版本</span><strong>weather-0.1</strong></div>
              <div><span>可发布综合风险</span><strong className="no">否</strong></div>
            </div>
          )}

          <div className="route-box">
            <div className="route-title"><span>成都</span><i>→</i><span>杭州</span></div>
            <p>路线结构已建立。健康趋势、迁徙强度和时间滞后字段为空，因此暂不计算输入风险。</p>
            <div className="route-status"><span /> 审慎模式运行中</div>
          </div>
        </aside>
      </section>

      <section className="bottom-grid">
        <div className="ranking-card">
          <div className="card-head compact"><div><h2>城市观察榜</h2><p>仅按已接入天气指标排列</p></div><span className="tag">非疾病榜单</span></div>
          <div className="ranking-row"><b>1</b><span className="rank-city">杭州<small>天气信号需关注</small></span><div className="bar"><i style={{ width: "41%" }} /></div><strong>40.9</strong></div>
          <div className="ranking-row"><b>2</b><span className="rank-city">成都<small>天气风险较低</small></span><div className="bar"><i style={{ width: "3%" }} /></div><strong>2.7</strong></div>
          <div className="empty-ranking">其余28座首轮城市等待数据接入</div>
        </div>

        <div className="source-card">
          <div className="card-head compact"><div><h2>数据源健康度</h2><p>多源交叉验证状态</p></div></div>
          <div className="source-list">
            <div><i className="source-ok" /><span>历史天气<small>成都、杭州各365天</small></span><strong>已接通</strong></div>
            <div><i className="source-ok" /><span>国家流感中心<small>周级权威校准</small></span><strong>已接通</strong></div>
            <div><i className="source-wait" /><span>百度 · 微信 · 抖音<small>健康关注与药品搜索</small></span><strong>待授权</strong></div>
            <div><i className="source-wait" /><span>城市迁徙<small>公开展示，批量授权待确认</small></span><strong>待授权</strong></div>
          </div>
        </div>
      </section>

      <footer><span>健康风向 · 数据可行性原型 V0.1</span><p>趋势指标不等于病例数，不替代医疗建议或疾控部门发布。</p><a href="https://ivdc.chinacdc.cn/cnic/zyzx/lgzb/" target="_blank" rel="noreferrer">查看权威流感周报 ↗</a></footer>
    </main>
  );
}
