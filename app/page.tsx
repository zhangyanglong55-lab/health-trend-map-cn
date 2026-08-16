"use client";

import { useEffect, useMemo, useState } from "react";
import weatherData from "./data/national-weather.json";

type Panel = "city" | "ranking" | "sources" | "none";
type Filter = "all" | "high" | "watch" | "low";
type City = (typeof weatherData.cities)[number];

const shortDays = weatherData.dates.map((value) => value.slice(5).replace("-", "."));

function toneFor(risk: number) {
  return risk >= 60 ? "high" : risk >= 30 ? "watch" : "low";
}

function statusFor(risk: number) {
  return risk >= 60 ? "天气信号偏高" : risk >= 30 ? "天气信号需关注" : "天气风险较低";
}

export default function Home() {
  const [selectedName, setSelectedName] = useState("杭州");
  const [dayIndex, setDayIndex] = useState(6);
  const [playing, setPlaying] = useState(true);
  const [panel, setPanel] = useState<Panel>("city");
  const [filter, setFilter] = useState<Filter>("all");
  const [weatherOn, setWeatherOn] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setDayIndex((value) => (value + 1) % shortDays.length), 1500);
    return () => window.clearInterval(timer);
  }, [playing]);

  const selected = weatherData.cities.find((city) => city.name === selectedName) ?? weatherData.cities[0];
  const risk = selected.risk[dayIndex];
  const temperature = selected.temperature[dayIndex];
  const precipitation = selected.precipitation[dayIndex];
  const wind = selected.wind[dayIndex];
  const riskTone = toneFor(risk);
  const dateLabel = weatherData.dates[dayIndex].replaceAll("-", ".");
  const previousRisk = selected.risk[Math.max(0, dayIndex - 1)];
  const trend = risk - previousRisk;

  const ranked = useMemo(() => [...weatherData.cities].sort((a, b) => b.risk[dayIndex] - a.risk[dayIndex]), [dayIndex]);
  const averageRisk = useMemo(() => weatherData.cities.reduce((sum, city) => sum + city.risk[dayIndex], 0) / weatherData.cities.length, [dayIndex]);
  const counts = useMemo(() => ({
    high: weatherData.cities.filter((city) => city.risk[dayIndex] >= 60).length,
    watch: weatherData.cities.filter((city) => city.risk[dayIndex] >= 30 && city.risk[dayIndex] < 60).length,
    low: weatherData.cities.filter((city) => city.risk[dayIndex] < 30).length,
  }), [dayIndex]);

  const visible = (city: City) => {
    if (!weatherOn) return false;
    if (filter === "all") return true;
    return toneFor(city.risk[dayIndex]) === filter;
  };

  return (
    <main className="health-app bright">
      <header className="topbar">
        <div className="brand"><span className="brand-cross" /><div><b>健康风向</b><small>全国健康趋势感知平台</small></div></div>
        <div className="live-state"><i />全国天气层已更新　<span>{dateLabel}</span></div>
        <nav>
          <button className="active">全国态势</button>
          <button onClick={() => setPanel(panel === "ranking" ? "none" : "ranking")}>城市排行</button>
          <button onClick={() => setPanel(panel === "sources" ? "none" : "sources")}>数据图谱</button>
          <a href="https://ivdc.chinacdc.cn/cnic/zyzx/lgzb/" target="_blank" rel="noreferrer">权威周报 ↗</a>
        </nav>
      </header>

      <section className="map-viewport">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <div className="map-title"><span>CHINA WEATHER HEALTH LAYER</span><h1>全国天气健康态势</h1><p>34个省级行政中心 · 天气风险随时间动态刷新</p></div>

        <div className="summary-chips">
          <div><i className="chip-blue" /><span>覆盖城市</span><b>34</b><small>/ 34</small></div>
          <div><i className="chip-cyan" /><span>全国均值</span><b>{averageRisk.toFixed(1)}</b><small>/ 100</small></div>
          <div><i className="chip-amber" /><span>偏高/关注</span><b>{counts.high + counts.watch}</b><small>座城市</small></div>
        </div>

        <aside className="layer-dock">
          <span>地图筛选</span>
          <button className={weatherOn && filter === "all" ? "selected" : ""} onClick={() => { setWeatherOn(true); setFilter("all"); }}><i>☀</i><b>全国天气</b><small>34城</small></button>
          <button className={filter === "high" ? "selected high-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("high"); }}><i>!</i><b>偏高</b><small>{counts.high}城</small></button>
          <button className={filter === "watch" ? "selected watch-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("watch"); }}><i>◐</i><b>关注</b><small>{counts.watch}城</small></button>
          <button className={filter === "low" ? "selected low-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("low"); }}><i>✓</i><b>较低</b><small>{counts.low}城</small></button>
          <button onClick={() => setWeatherOn(!weatherOn)}><i>◉</i><b>天气点位</b><small>{weatherOn ? "点击隐藏" : "点击显示"}</small></button>
        </aside>

        <div className="china-map" aria-label="全国34城市天气健康态势图">
          <div className="territory-main"><div className="province-lines" /><span className="map-word">全国天气态势</span></div>
          <div className="territory-island hainan" /><div className="territory-island taiwan" />
          <div className="south-sea"><i /><i /><i /><i /><i /></div>

          {weatherData.cities.map((city) => {
            const cityRisk = city.risk[dayIndex];
            const tone = toneFor(cityRisk);
            return <button
              key={city.name}
              className={`map-city national-city ${tone} ${selectedName === city.name ? "chosen" : ""} ${visible(city) ? "visible" : "filtered"}`}
              style={{ left: `${city.left}%`, top: `${city.top}%`, "--bubble": `${8 + cityRisk * 0.09}px` } as React.CSSProperties}
              onClick={() => { setSelectedName(city.name); setPanel("city"); }}
              aria-label={`${city.name}天气风险${cityRisk.toFixed(1)}`}
            ><i><em /></i><span>{city.name}<small>{cityRisk.toFixed(0)}</small></span></button>;
          })}

          <div className="weather-wave wave-one" /><div className="weather-wave wave-two" /><div className="weather-wave wave-three" />
          <div className="map-stamp">全国态势可视化原型 · 天气风险不等于疾病病例或医学预警</div>
        </div>

        <div className="visual-legend"><button className={filter === "low" ? "active" : ""} onClick={() => setFilter(filter === "low" ? "all" : "low")}><i className="low" />0–29 较低 <b>{counts.low}</b></button><button className={filter === "watch" ? "active" : ""} onClick={() => setFilter(filter === "watch" ? "all" : "watch")}><i className="watch" />30–59 关注 <b>{counts.watch}</b></button><button className={filter === "high" ? "active" : ""} onClick={() => setFilter(filter === "high" ? "all" : "high")}><i className="high" />60+ 偏高 <b>{counts.high}</b></button></div>

        <div className="mini-chart">
          <div className="mini-head"><span>{selected.name} · 近7日天气风险</span><b>{risk.toFixed(1)}</b></div>
          <div className="bars">{selected.risk.map((value, index) => <button key={shortDays[index]} className={index === dayIndex ? "active" : ""} onClick={() => { setDayIndex(index); setPlaying(false); }} aria-label={`${shortDays[index]}风险${value}`}><i style={{ height: `${Math.max(7, value)}%` }} /><small>{shortDays[index].slice(3)}</small></button>)}</div>
        </div>

        <div className={`right-panel ${panel === "none" ? "collapsed" : ""}`}>
          <div className="panel-tabs"><button className={panel === "city" ? "active" : ""} onClick={() => setPanel("city")}>城市</button><button className={panel === "ranking" ? "active" : ""} onClick={() => setPanel("ranking")}>排行</button><button className={panel === "sources" ? "active" : ""} onClick={() => setPanel("sources")}>数据</button><button className="collapse-button" onClick={() => setPanel(panel === "none" ? "city" : "none")}>{panel === "none" ? "‹" : "›"}</button></div>

          {panel === "city" && <div className="panel-content">
            <div className="city-title"><div><small>选中城市</small><h2>{selected.name}</h2><p><i className={riskTone} />{statusFor(risk)}</p></div><div className={`risk-orbit ${riskTone}`} style={{ "--risk": `${risk * 3.6}deg` } as React.CSSProperties}><b>{Math.round(risk)}</b><small>/100</small></div></div>
            <div className="metric-grid"><div><span>日均气温</span><b>{temperature.toFixed(1)}°</b></div><div><span>日变化</span><b className={trend > 0 ? "up" : "down"}>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}</b></div><div><span>当日降水</span><b>{precipitation.toFixed(1)} mm</b></div><div><span>最大风速</span><b>{wind.toFixed(1)} km/h</b></div></div>
            <div className="signal-stack"><h3>天气信号构成</h3><div><span>综合天气风险</span><i><em style={{ width: `${risk}%` }} /></i><b>{risk.toFixed(1)}</b></div><div><span>平均温度</span><i><em style={{ width: `${Math.min(100, Math.max(0, temperature / 40 * 100))}%` }} /></i><b>{temperature.toFixed(1)}°</b></div><div><span>降水强度</span><i><em style={{ width: `${Math.min(100, precipitation * 3)}%` }} /></i><b>{precipitation.toFixed(1)}</b></div><div><span>风速水平</span><i><em style={{ width: `${Math.min(100, wind * 2)}%` }} /></i><b>{wind.toFixed(1)}</b></div></div>
            <div className="route-card"><div><span>天气层</span><i>＋</i><span>健康信号</span></div><p>目前全国可刷的是天气环境层。搜索、购药和官方疾病信号接入后，将在同一城市点位叠加显示。</p></div>
          </div>}

          {panel === "ranking" && <div className="panel-content ranking-panel"><small className="overline">NATIONAL WEATHER RANKING</small><h2>{dateLabel} 城市观察</h2><p className="intro">按探索性天气风险分排列，不是疾病排名。</p>{ranked.slice(0, 10).map((city, index) => <button key={city.name} onClick={() => { setSelectedName(city.name); setPanel("city"); }}><b>{String(index + 1).padStart(2, "0")}</b><span>{city.name}<small>{city.temperature[dayIndex].toFixed(1)}° · 降水 {city.precipitation[dayIndex].toFixed(1)}mm</small></span><i><em style={{ width: `${city.risk[dayIndex]}%` }} /></i><strong>{city.risk[dayIndex].toFixed(1)}</strong></button>)}</div>}

          {panel === "sources" && <div className="panel-content source-plan"><small className="overline">DATA COVERAGE</small><h2>全国数据层</h2><p className="intro">天气已覆盖全国34个省级行政中心；其他信号继续按授权情况叠加。</p><div className="source-node ready"><i>01</i><div><b>全国天气</b><span>34城市 · 7日 · 238条</span></div><em>已接</em></div><div className="source-node ready"><i>02</i><div><b>官方流感监测</b><span>国家流感中心周报</span></div><em>周级</em></div><div className="source-node candidate"><i>03</i><div><b>Google Trends</b><span>全国/省级搜索辅助</span></div><em>申请</em></div><div className="source-node candidate"><i>04</i><div><b>GDELT开放新闻</b><span>地点与新闻提及信号</span></div><em>免费</em></div><div className="source-node own"><i>05</i><div><b>匿名症状自报</b><span>建设城市日级第一方数据</span></div><em>建议</em></div><div className="source-note">数据源：Open-Meteo Historical Weather API。天气指标仅用于产品探索，正式上线前需以多年同期气候及疾病数据回测校准。</div></div>}
        </div>

        <div className="timeline-bar">
          <button onClick={() => setPlaying(!playing)} aria-label={playing ? "暂停" : "播放"}>{playing ? "Ⅱ" : "▶"}</button><span>{weatherData.dates[0].replaceAll("-", ".")}</span>
          <input type="range" min="0" max={shortDays.length - 1} step="1" value={dayIndex} onChange={(event) => { setDayIndex(Number(event.target.value)); setPlaying(false); }} aria-label="拖动查看日期" style={{ "--progress": `${dayIndex / (shortDays.length - 1) * 100}%` } as React.CSSProperties} />
          <div className="date-ticks">{shortDays.map((day, index) => <button key={day} className={index === dayIndex ? "active" : ""} onClick={() => { setDayIndex(index); setPlaying(false); }}>{day}</button>)}</div>
          <b>{dateLabel}</b><em>{playing ? "全国天气动态播放中" : "拖动时间轴查看"}</em>
        </div>
      </section>
    </main>
  );
}
