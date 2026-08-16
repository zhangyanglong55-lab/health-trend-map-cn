"use client";

import { useEffect, useMemo, useState } from "react";

type CityKey = "成都" | "杭州";
type Panel = "city" | "sources" | "none";

const days = ["08.09", "08.10", "08.11", "08.12", "08.13", "08.14", "08.15"];
const history: Record<CityKey, { risk: number[]; temp: number[] }> = {
  成都: { risk: [19.39, 12.86, 10.71, 11.82, 14.88, 7.75, 2.68], temp: [27.7, 29.4, 29.2, 29.6, 29.9, 30.9, 30.7] },
  杭州: { risk: [65.21, 58, 39.55, 24.97, 30.83, 35.56, 40.93], temp: [25.8, 26.4, 27.7, 28.9, 28, 27.2, 27.1] },
};

const cityPoints = [
  { name: "乌鲁木齐", left: "21%", top: "31%" }, { name: "拉萨", left: "28%", top: "58%" },
  { name: "昆明", left: "41%", top: "74%" }, { name: "广州", left: "60%", top: "78%" },
  { name: "西安", left: "49%", top: "48%" }, { name: "武汉", left: "58%", top: "59%" },
  { name: "北京", left: "65%", top: "30%" }, { name: "哈尔滨", left: "80%", top: "17%" },
  { name: "上海", left: "74%", top: "55%" }, { name: "海口", left: "55%", top: "88%" },
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<CityKey>("杭州");
  const [dayIndex, setDayIndex] = useState(6);
  const [playing, setPlaying] = useState(true);
  const [panel, setPanel] = useState<Panel>("city");
  const [routeOn, setRouteOn] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setDayIndex((value) => (value + 1) % days.length), 1400);
    return () => window.clearInterval(timer);
  }, [playing]);

  const selected = history[selectedCity];
  const risk = selected.risk[dayIndex];
  const temperature = selected.temp[dayIndex];
  const riskTone = risk >= 60 ? "high" : risk >= 30 ? "watch" : "low";
  const status = risk >= 60 ? "天气信号偏高" : risk >= 30 ? "天气信号需关注" : "天气风险较低";
  const dateLabel = `2026.${days[dayIndex]}`;
  const trend = useMemo(() => {
    const previous = selected.risk[Math.max(0, dayIndex - 1)];
    const delta = risk - previous;
    return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`;
  }, [dayIndex, risk, selected]);

  return (
    <main className="health-app">
      <header className="topbar">
        <div className="brand"><span className="brand-cross" /><div><b>健康风向</b><small>全国健康趋势感知平台</small></div></div>
        <div className="live-state"><i />每日更新　<span>{dateLabel}</span></div>
        <nav>
          <button className="active">全国态势</button>
          <button onClick={() => setPanel(panel === "sources" ? "none" : "sources")}>数据图谱</button>
          <a href="https://ivdc.chinacdc.cn/cnic/zyzx/lgzb/" target="_blank" rel="noreferrer">权威周报 ↗</a>
        </nav>
      </header>

      <section className="map-viewport">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />

        <div className="map-title">
          <span>CHINA HEALTH SIGNALS</span>
          <h1>全国健康态势</h1>
          <p>以地图为核心，融合气象、官方监测与城市间关联信号</p>
        </div>

        <div className="summary-chips">
          <div><i className="chip-blue" /><span>已接入城市</span><b>02</b><small>/ 30</small></div>
          <div><i className="chip-cyan" /><span>有效数据层</span><b>02</b><small>/ 06</small></div>
          <div><i className="chip-amber" /><span>疾病预警</span><b className="text-small">暂不发布</b></div>
        </div>

        <aside className="layer-dock">
          <span>可视化图层</span>
          <button className="selected"><i className="layer-weather">⌁</i><b>天气风险</b><small>已接通</small></button>
          <button><i>＋</i><b>症状关注</b><small>待接入</small></button>
          <button><i>◇</i><b>药品需求</b><small>待接入</small></button>
          <button className={routeOn ? "selected" : ""} onClick={() => setRouteOn(!routeOn)}><i>⇢</i><b>关联路线</b><small>{routeOn ? "显示中" : "已隐藏"}</small></button>
        </aside>

        <div className="china-map" aria-label="中国全国健康态势示意图">
          <div className="territory-main">
            <div className="province-lines" />
            <span className="map-word">全国城市态势</span>
          </div>
          <div className="territory-island hainan" /><div className="territory-island taiwan" />
          <div className="south-sea"><i /><i /><i /><i /><i /></div>

          {cityPoints.map((point) => <div className="map-city muted" key={point.name} style={{ left: point.left, top: point.top }}><i /><span>{point.name}</span></div>)}

          <button className={`map-city live chengdu ${selectedCity === "成都" ? "chosen" : ""}`} onClick={() => { setSelectedCity("成都"); setPanel("city"); }}><i><em /></i><span>成都<small>{history.成都.risk[dayIndex].toFixed(1)}</small></span></button>
          <button className={`map-city live hangzhou ${selectedCity === "杭州" ? "chosen" : ""}`} onClick={() => { setSelectedCity("杭州"); setPanel("city"); }}><i><em /></i><span>杭州<small>{history.杭州.risk[dayIndex].toFixed(1)}</small></span></button>

          {routeOn && <div className="flow-route"><div className="flow-particle" /><div className="flow-particle second" /><span>潜在关联 · 数据待授权</span></div>}
          <div className="map-stamp">全国态势可视化原型 · 正式地图底图将采用自然资源部标准地图并标注审图号</div>
        </div>

        <div className="visual-legend"><span><i className="low" />0–29 较低</span><span><i className="watch" />30–59 关注</span><span><i className="high" />60+ 偏高</span><span><i className="missing" />数据待接入</span></div>

        <div className="mini-chart">
          <div className="mini-head"><span>{selectedCity} · 近7日天气风险</span><b>{risk.toFixed(1)}</b></div>
          <div className="bars">{selected.risk.map((value, index) => <button key={days[index]} className={index === dayIndex ? "active" : ""} onClick={() => { setDayIndex(index); setPlaying(false); }} aria-label={`${days[index]}风险${value}`}><i style={{ height: `${Math.max(7, value)}%` }} /><small>{days[index].slice(3)}</small></button>)}</div>
        </div>

        <div className={`right-panel ${panel === "none" ? "collapsed" : ""}`}>
          <div className="panel-tabs">
            <button className={panel === "city" ? "active" : ""} onClick={() => setPanel("city")}>城市</button>
            <button className={panel === "sources" ? "active" : ""} onClick={() => setPanel("sources")}>数据</button>
            <button className="collapse-button" onClick={() => setPanel(panel === "none" ? "city" : "none")}>{panel === "none" ? "‹" : "›"}</button>
          </div>

          {panel === "city" && <div className="panel-content">
            <div className="city-title"><div><small>选中城市</small><h2>{selectedCity}</h2><p><i className={riskTone} />{status}</p></div><div className={`risk-orbit ${riskTone}`} style={{ "--risk": `${risk * 3.6}deg` } as React.CSSProperties}><b>{Math.round(risk)}</b><small>/100</small></div></div>
            <div className="metric-grid"><div><span>日均气温</span><b>{temperature.toFixed(1)}°</b></div><div><span>日变化</span><b className={Number(trend) > 0 ? "up" : "down"}>{trend}</b></div><div><span>健康关注</span><b className="pending">待授权</b></div><div><span>迁徙强度</span><b className="pending">待授权</b></div></div>
            <div className="signal-stack"><h3>信号构成</h3><div><span>天气与环境</span><i><em style={{ width: `${risk}%` }} /></i><b>{risk.toFixed(1)}</b></div><div className="disabled"><span>多平台关注</span><i /><b>—</b></div><div className="disabled"><span>药品需求</span><i /><b>—</b></div><div className="disabled"><span>人口流动</span><i /><b>—</b></div></div>
            <div className="route-card"><div><span>成都</span><i>······→</i><span>杭州</span></div><p>路线动效仅表达计算框架。缺少获准的流动和健康趋势数据时，不输出传播分。</p></div>
          </div>}

          {panel === "sources" && <div className="panel-content source-plan">
            <small className="overline">FREE DATA STRATEGY</small><h2>免费数据替代方案</h2><p className="intro">不寻找单一“百度指数平替”，改用多源一致性判断。</p>
            <div className="source-node ready"><i>01</i><div><b>官方流感监测</b><span>国家流感中心 · WHO FluNet</span></div><em>核心</em></div>
            <div className="source-node ready"><i>02</i><div><b>天气与历史环境</b><span>公开气象数据 · 日级城市</span></div><em>已接</em></div>
            <div className="source-node candidate"><i>03</i><div><b>Google Trends</b><span>免费搜索热度 · 全国/省级辅助</span></div><em>申请API</em></div>
            <div className="source-node candidate"><i>04</i><div><b>GDELT开放新闻</b><span>新闻提及量 · 地点与事件信号</span></div><em>免费</em></div>
            <div className="source-node own"><i>05</i><div><b>匿名症状自报</b><span>自建第一方城市日级信号</span></div><em>建议</em></div>
            <div className="source-node own"><i>06</i><div><b>药店/诊所聚合合作</b><span>只接收匿名汇总，不收个人记录</span></div><em>长期</em></div>
            <div className="source-note">微信指数可作为人工抽样核验；不建议依赖非公开接口或网页抓取作为生产主链路。</div>
          </div>}
        </div>

        <div className="timeline-bar">
          <button onClick={() => setPlaying(!playing)} aria-label={playing ? "暂停" : "播放"}>{playing ? "Ⅱ" : "▶"}</button>
          <span>2026.08.09</span>
          <div className="time-track">{days.map((day, index) => <button key={day} className={index <= dayIndex ? "passed" : ""} onClick={() => { setDayIndex(index); setPlaying(false); }}><i /><small>{day}</small></button>)}</div>
          <b>{dateLabel}</b><em>{playing ? "动态播放中" : "已暂停"}</em>
        </div>
      </section>
    </main>
  );
}
