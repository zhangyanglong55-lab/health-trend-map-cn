"use client";

import { useMemo, useState } from "react";
import weatherData from "./data/national-weather.json";

type Panel = "city" | "ranking" | "sources" | "none";
type Filter = "all" | "high" | "watch" | "low";
type City = (typeof weatherData.cities)[number];

const shortDays = weatherData.dates.map((value) => value.slice(5).replace("-", "."));

function toneFor(risk: number) {
  return risk >= 70 ? "high" : risk >= 45 ? "watch" : "low";
}

function statusFor(risk: number) {
  return risk >= 70 ? "感冒流行风险高" : risk >= 45 ? "感冒流行风险需关注" : "感冒流行风险较低";
}

function diseaseRisk(city: City, day: number) {
  const seed = city.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const search = 22 + ((seed * 13 + day * 17) % 65);
  const medicine = 18 + ((seed * 7 + day * 23) % 70);
  return Math.min(96, Math.max(12, search * .42 + medicine * .38 + city.risk[day] * .2));
}

function weatherIcon(city: City, day: number) {
  if (city.precipitation[day] >= 8) return "🌧️";
  if (city.precipitation[day] >= 1) return "🌦️";
  if (city.wind[day] >= 22) return "💨";
  return city.temperature[day] >= 28 ? "☀️" : "⛅";
}

function mapPosition(city: City) {
  return {
    left: `${(city.longitude - 73) / (135 - 73) * 100}%`,
    top: `${(54 - city.latitude) / (54 - 18) * 100}%`,
  };
}

export default function Home() {
  const [selectedName, setSelectedName] = useState("杭州");
  const [dayIndex, setDayIndex] = useState(6);
  const [panel, setPanel] = useState<Panel>("city");
  const [filter, setFilter] = useState<Filter>("all");
  const [weatherOn, setWeatherOn] = useState(true);

  const selected = weatherData.cities.find((city) => city.name === selectedName) ?? weatherData.cities[0];
  const risk = diseaseRisk(selected, dayIndex);
  const temperature = selected.temperature[dayIndex];
  const precipitation = selected.precipitation[dayIndex];
  const wind = selected.wind[dayIndex];
  const riskTone = toneFor(risk);
  const dateLabel = weatherData.dates[dayIndex].replaceAll("-", ".");
  const previousRisk = diseaseRisk(selected, Math.max(0, dayIndex - 1));
  const trend = risk - previousRisk;

  const ranked = useMemo(() => [...weatherData.cities].sort((a, b) => diseaseRisk(b, dayIndex) - diseaseRisk(a, dayIndex)), [dayIndex]);
  const averageRisk = useMemo(() => weatherData.cities.reduce((sum, city) => sum + diseaseRisk(city, dayIndex), 0) / weatherData.cities.length, [dayIndex]);
  const counts = useMemo(() => ({
    high: weatherData.cities.filter((city) => diseaseRisk(city, dayIndex) >= 70).length,
    watch: weatherData.cities.filter((city) => diseaseRisk(city, dayIndex) >= 45 && diseaseRisk(city, dayIndex) < 70).length,
    low: weatherData.cities.filter((city) => diseaseRisk(city, dayIndex) < 45).length,
  }), [dayIndex]);

  const visible = (city: City) => {
    if (!weatherOn) return false;
    if (filter === "all") return true;
    return (diseaseRisk(city, dayIndex) >= 70 ? "high" : diseaseRisk(city, dayIndex) >= 45 ? "watch" : "low") === filter;
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
        <div className="map-title"><span>CHINA RESPIRATORY HEALTH SIGNAL</span><h1>全国感冒流行风险</h1><p>搜索感冒药 + 症状关注 + 天气影响 · 每日演示指数</p></div>

        <div className="summary-chips">
          <div><i className="chip-blue" /><span>覆盖城市</span><b>34</b><small>/ 34</small></div>
          <div><i className="chip-cyan" /><span>全国均值</span><b>{averageRisk.toFixed(1)}</b><small>/ 100</small></div>
          <div><i className="chip-amber" /><span>高风险/关注</span><b>{counts.high + counts.watch}</b><small>座城市</small></div>
        </div>

        <aside className="layer-dock">
          <span>地图筛选</span>
          <button className={weatherOn && filter === "all" ? "selected" : ""} onClick={() => { setWeatherOn(true); setFilter("all"); }}><i>十</i><b>感冒风险</b><small>34省区</small></button>
          <button className={filter === "high" ? "selected high-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("high"); }}><i>!</i><b>偏高</b><small>{counts.high}城</small></button>
          <button className={filter === "watch" ? "selected watch-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("watch"); }}><i>◐</i><b>关注</b><small>{counts.watch}城</small></button>
          <button className={filter === "low" ? "selected low-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("low"); }}><i>✓</i><b>较低</b><small>{counts.low}城</small></button>
          <button onClick={() => setWeatherOn(!weatherOn)}><i>◉</i><b>天气点位</b><small>{weatherOn ? "点击隐藏" : "点击显示"}</small></button>
        </aside>

        <div className="china-map" aria-label="全国34省区感冒流行风险图">
          <img className="real-china-map" src={`/risk-map-${dayIndex}.svg`} alt={`${dateLabel}中国各省感冒流行风险分级地图`} />

          {weatherData.cities.map((city) => {
            const cityRisk = diseaseRisk(city, dayIndex);
            const tone = cityRisk >= 70 ? "high" : cityRisk >= 45 ? "watch" : "low";
            return <button
              key={city.name}
              className={`map-city national-city ${tone} ${selectedName === city.name ? "chosen" : ""} ${visible(city) ? "visible" : "filtered"}`}
              style={{ ...mapPosition(city), "--bubble": `${8 + cityRisk * 0.09}px` } as React.CSSProperties}
              onClick={() => { setSelectedName(city.name); setPanel("city"); }}
              aria-label={`${city.name}感冒风险${cityRisk.toFixed(1)}，${weatherIcon(city, dayIndex)}，${city.temperature[dayIndex].toFixed(0)}度`}
            ><i><em /></i><span><strong>{weatherIcon(city, dayIndex)}</strong>{city.name}<small>{city.temperature[dayIndex].toFixed(0)}° · 风险{cityRisk.toFixed(0)}</small></span></button>;
          })}

          <div className="map-stamp">演示指数：搜索与购药关注 80% + 天气影响 20% · 趋势信号不等于确诊病例或医学预警</div>
        </div>

        <div className="visual-legend"><b>感冒风险</b><button className={filter === "low" ? "active" : ""} onClick={() => setFilter(filter === "low" ? "all" : "low")}><i className="risk-low" />0–44 较低 <b>{counts.low}</b></button><button className={filter === "watch" ? "active" : ""} onClick={() => setFilter(filter === "watch" ? "all" : "watch")}><i className="risk-watch" />45–69 关注 <b>{counts.watch}</b></button><button className={filter === "high" ? "active" : ""} onClick={() => setFilter(filter === "high" ? "all" : "high")}><i className="risk-high" />70+ 高风险 <b>{counts.high}</b></button></div>

        <div className="mini-chart">
          <div className="mini-head"><span>{selected.name} · 近7日感冒风险</span><b>{risk.toFixed(1)}</b></div>
          <div className="bars">{shortDays.map((day, index) => { const value = diseaseRisk(selected, index); return <button key={day} className={index === dayIndex ? "active" : ""} onClick={() => setDayIndex(index)} aria-label={`${day}感冒风险${value}`}><i style={{ height: `${Math.max(7, value)}%` }} /><small>{day.slice(3)}</small></button>; })}</div>
        </div>

        <div className={`right-panel ${panel === "none" ? "collapsed" : ""}`}>
          <div className="panel-tabs"><button className={panel === "city" ? "active" : ""} onClick={() => setPanel("city")}>城市</button><button className={panel === "ranking" ? "active" : ""} onClick={() => setPanel("ranking")}>排行</button><button className={panel === "sources" ? "active" : ""} onClick={() => setPanel("sources")}>数据</button><button className="collapse-button" onClick={() => setPanel(panel === "none" ? "city" : "none")}>{panel === "none" ? "‹" : "›"}</button></div>

          {panel === "city" && <div className="panel-content">
            <div className="city-title"><div><small>选中城市</small><h2>{selected.name}</h2><p><i className={riskTone} />{statusFor(risk)}</p></div><div className={`risk-orbit ${riskTone}`} style={{ "--risk": `${risk * 3.6}deg` } as React.CSSProperties}><b>{Math.round(risk)}</b><small>/100</small></div></div>
            <div className="metric-grid"><div><span>日均气温</span><b>{temperature.toFixed(1)}°</b></div><div><span>日变化</span><b className={trend > 0 ? "up" : "down"}>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}</b></div><div><span>当日降水</span><b>{precipitation.toFixed(1)} mm</b></div><div><span>最大风速</span><b>{wind.toFixed(1)} km/h</b></div></div>
            <div className="signal-stack"><h3>感冒风险信号构成</h3><div><span>感冒药搜索</span><i><em style={{ width: `${Math.min(100, risk + 8)}%` }} /></i><b>42%</b></div><div><span>症状关注</span><i><em style={{ width: `${Math.max(10, risk - 5)}%` }} /></i><b>38%</b></div><div><span>天气影响</span><i><em style={{ width: `${selected.risk[dayIndex]}%` }} /></i><b>20%</b></div></div>
            <div className="route-card"><div><span>搜索关注</span><i>＋</i><span>购药/症状</span><i>＋</i><span>天气</span></div><p>当前为公开数据与样例信号组成的演示指数，用于表达产品逻辑；正式监测需接入合规平台数据并与疾控数据校准。</p></div>
          </div>}

          {panel === "ranking" && <div className="panel-content ranking-panel"><small className="overline">COLD RISK SIGNAL RANKING</small><h2>{dateLabel} 感冒风险 Top 10</h2><p className="intro">按搜索、症状与天气组成的演示指数排列，不代表病例数。</p>{ranked.slice(0, 10).map((city, index) => { const value = diseaseRisk(city, dayIndex); return <button key={city.name} onClick={() => { setSelectedName(city.name); setPanel("city"); }}><b>{String(index + 1).padStart(2, "0")}</b><span>{city.name}<small>{weatherIcon(city, dayIndex)} {city.temperature[dayIndex].toFixed(1)}° · 降水 {city.precipitation[dayIndex].toFixed(1)}mm</small></span><i><em style={{ width: `${value}%` }} /></i><strong>{value.toFixed(1)}</strong></button>; })}</div>}

          {panel === "sources" && <div className="panel-content source-plan"><small className="overline">DATA COVERAGE</small><h2>全国数据层</h2><p className="intro">天气已覆盖全国34个省级行政中心；其他信号继续按授权情况叠加。</p><div className="source-node ready"><i>01</i><div><b>全国天气</b><span>34城市 · 7日 · 238条</span></div><em>已接</em></div><div className="source-node ready"><i>02</i><div><b>官方流感监测</b><span>国家流感中心周报</span></div><em>周级</em></div><div className="source-node candidate"><i>03</i><div><b>Google Trends</b><span>全国/省级搜索辅助</span></div><em>申请</em></div><div className="source-node candidate"><i>04</i><div><b>GDELT开放新闻</b><span>地点与新闻提及信号</span></div><em>免费</em></div><div className="source-node own"><i>05</i><div><b>匿名症状自报</b><span>建设城市日级第一方数据</span></div><em>建议</em></div><div className="source-note">数据源：Open-Meteo Historical Weather API。天气指标仅用于产品探索，正式上线前需以多年同期气候及疾病数据回测校准。</div></div>}
        </div>

        <div className="timeline-bar">
          <span className="manual-hint">拖动日期</span><span>{weatherData.dates[0].replaceAll("-", ".")}</span>
          <input type="range" min="0" max={shortDays.length - 1} step="1" value={dayIndex} onChange={(event) => setDayIndex(Number(event.target.value))} aria-label="手动拖动查看日期" style={{ "--progress": `${dayIndex / (shortDays.length - 1) * 100}%` } as React.CSSProperties} />
          <div className="date-ticks">{shortDays.map((day, index) => <button key={day} className={index === dayIndex ? "active" : ""} onClick={() => setDayIndex(index)}>{day}</button>)}</div>
          <b>{dateLabel}</b><em>手动拖动时间轴查看</em>
        </div>
      </section>
    </main>
  );
}
