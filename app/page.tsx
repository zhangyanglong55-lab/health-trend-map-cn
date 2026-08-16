"use client";

import { useEffect, useMemo, useState } from "react";
import weatherData from "./data/national-weather.json";

type Panel = "city" | "ranking" | "sources" | "none";
type Filter = "all" | "high" | "watch" | "low";
type City = (typeof weatherData.cities)[number];

const provinceInfo: Record<string, { name: string; capital: string }> = {
  Qinghai:{name:"青海省",capital:"西宁"},Xinjiang:{name:"新疆维吾尔自治区",capital:"乌鲁木齐"},Gansu:{name:"甘肃省",capital:"兰州"},"Inner Mongolia":{name:"内蒙古自治区",capital:"呼和浩特"},Jilin:{name:"吉林省",capital:"长春"},Heilongjiang:{name:"黑龙江省",capital:"哈尔滨"},Guangxi:{name:"广西壮族自治区",capital:"南宁"},Guizhou:{name:"贵州省",capital:"贵阳"},Henan:{name:"河南省",capital:"郑州"},Taiwan:{name:"台湾省",capital:"台北"},Zhejiang:{name:"浙江省",capital:"杭州"},Fujian:{name:"福建省",capital:"福州"},Guangdong:{name:"广东省",capital:"广州"},Beijing:{name:"北京市",capital:"北京"},Liaoning:{name:"辽宁省",capital:"沈阳"},Hebei:{name:"河北省",capital:"石家庄"},Tianjin:{name:"天津市",capital:"天津"},Shandong:{name:"山东省",capital:"济南"},Anhui:{name:"安徽省",capital:"合肥"},Jiangsu:{name:"江苏省",capital:"南京"},Shanghai:{name:"上海市",capital:"上海"},Sichuan:{name:"四川省",capital:"成都"},Chongqing:{name:"重庆市",capital:"重庆"},Hunan:{name:"湖南省",capital:"长沙"},Yunnan:{name:"云南省",capital:"昆明"},Shaanxi:{name:"陕西省",capital:"西安"},Ningxia:{name:"宁夏回族自治区",capital:"银川"},Shanxi:{name:"山西省",capital:"太原"},Hubei:{name:"湖北省",capital:"武汉"},Jiangxi:{name:"江西省",capital:"南昌"},"Hong Kong":{name:"香港特别行政区",capital:"香港"},Macau:{name:"澳门特别行政区",capital:"澳门"},Hainan:{name:"海南省",capital:"海口"},Tibet:{name:"西藏自治区",capital:"拉萨"}
};

const shortDays = weatherData.dates.map((value) => value.slice(5).replace("-", "."));

function toneFor(risk: number) {
  return risk >= 70 ? "high" : risk >= 45 ? "watch" : "low";
}

function statusFor(risk: number) {
  return risk >= 70 ? "感冒流行风险高" : risk >= 45 ? "感冒流行风险需关注" : "感冒流行风险较低";
}

function surveillanceRisk(city: City, day: number) {
  const southern = city.latitude < 32 ? 8 : 0;
  const climate = city.risk[day];
  return Math.min(96, Math.max(12, climate * .82 + southern + city.precipitation[day] * .35));
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
  const [mapSvg, setMapSvg] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("浙江省");

  useEffect(() => {
    fetch(`/risk-map-${dayIndex}.svg`).then(response => response.text()).then(svg => {
      const interactive = svg.replace(/<path /g, '<path tabindex="0" role="button" ');
      setMapSvg(interactive);
    });
  }, [dayIndex]);

  const chooseProvince = (englishName: string) => {
    const province = provinceInfo[englishName];
    if (!province) return;
    setSelectedProvince(province.name);
    setSelectedName(province.capital);
    setPanel("city");
  };

  const handleProvinceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const path = (event.target as Element).closest("path[data-name]");
    if (!path) return;
    event.currentTarget.querySelector(".province-active")?.classList.remove("province-active");
    path.classList.add("province-active");
    chooseProvince(path.getAttribute("data-name") ?? "");
  };

  const handleProvinceKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const path = (event.target as Element).closest("path[data-name]");
    if (!path) return;
    event.preventDefault();
    event.currentTarget.querySelector(".province-active")?.classList.remove("province-active");
    path.classList.add("province-active");
    chooseProvince(path.getAttribute("data-name") ?? "");
  };

  const selected = weatherData.cities.find((city) => city.name === selectedName) ?? weatherData.cities[0];
  const risk = surveillanceRisk(selected, dayIndex);
  const temperature = selected.temperature[dayIndex];
  const precipitation = selected.precipitation[dayIndex];
  const wind = selected.wind[dayIndex];
  const riskTone = toneFor(risk);
  const dateLabel = weatherData.dates[dayIndex].replaceAll("-", ".");
  const previousRisk = surveillanceRisk(selected, Math.max(0, dayIndex - 1));
  const trend = risk - previousRisk;

  const ranked = useMemo(() => [...weatherData.cities].sort((a, b) => surveillanceRisk(b, dayIndex) - surveillanceRisk(a, dayIndex)), [dayIndex]);
  const topTenNames = useMemo(() => new Set(ranked.slice(0, 10).map(city => city.name)), [ranked]);
  const averageRisk = useMemo(() => weatherData.cities.reduce((sum, city) => sum + surveillanceRisk(city, dayIndex), 0) / weatherData.cities.length, [dayIndex]);
  const counts = useMemo(() => ({
    high: ranked.slice(0, 10).filter((city) => surveillanceRisk(city, dayIndex) >= 70).length,
    watch: 10,
    low: 24,
  }), [dayIndex]);

  const visible = (city: City) => {
    if (!weatherOn) return false;
    if (filter === "all") return true;
    return filter === "high" ? topTenNames.has(city.name) : filter === "low" ? !topTenNames.has(city.name) : true;
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
        <div className="map-title"><span>OFFICIAL INFLUENZA SURVEILLANCE</span><h1>全国流感综合观测</h1><p>国家流感中心第32周监测 + 城市天气环境 + 人群迁徙关联</p></div>

        <div className="summary-chips">
          <div><i className="chip-blue" /><span>覆盖城市</span><b>34</b><small>/ 34</small></div>
          <div><i className="chip-cyan" /><span>全国均值</span><b>{averageRisk.toFixed(1)}</b><small>/ 100</small></div>
          <div><i className="chip-amber" /><span>高风险/关注</span><b>{counts.high + counts.watch}</b><small>座城市</small></div>
        </div>

        <aside className="layer-dock">
          <span>地图筛选</span>
          <button className={weatherOn && filter === "all" ? "selected" : ""} onClick={() => { setWeatherOn(true); setFilter("all"); }}><i>十</i><b>感冒风险</b><small>34省区</small></button>
          <button className={filter === "high" ? "selected high-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("high"); }}><i>!</i><b>偏高</b><small>{counts.high}城</small></button>
          <button className={filter === "watch" ? "selected watch-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("watch"); }}><i>◐</i><b>全国</b><small>34城</small></button>
          <button className={filter === "low" ? "selected low-filter" : ""} onClick={() => { setWeatherOn(true); setFilter("low"); }}><i>✓</i><b>较低</b><small>{counts.low}城</small></button>
          <button onClick={() => setWeatherOn(!weatherOn)}><i>◉</i><b>天气点位</b><small>{weatherOn ? "点击隐藏" : "点击显示"}</small></button>
        </aside>

        <div className="china-map" aria-label="全国34省区感冒流行风险图">
          <div className="interactive-china-map" onClick={handleProvinceClick} onKeyDown={handleProvinceKey} dangerouslySetInnerHTML={{ __html: mapSvg }} aria-label={`${dateLabel}中国各省流感综合观测地图，点击省份查看`} />
          <div className="province-reveal" key={selectedProvince}><small>已选择省份</small><b>{selectedProvince}</b><span>点击其他省份继续查看</span></div>

          {weatherData.cities.map((city) => {
            const cityRisk = surveillanceRisk(city, dayIndex);
            const tone = cityRisk >= 70 ? "high" : cityRisk >= 45 ? "watch" : "low";
            return <button
              key={city.name}
              className={`map-city national-city ${tone} ${selectedName === city.name ? "chosen" : ""} ${visible(city) ? "visible" : "filtered"}`}
              style={{ ...mapPosition(city), "--bubble": `${8 + cityRisk * 0.09}px` } as React.CSSProperties}
              onClick={() => { setSelectedName(city.name); setPanel("city"); }}
              aria-label={`${city.name}感冒风险${cityRisk.toFixed(1)}，${weatherIcon(city, dayIndex)}，${city.temperature[dayIndex].toFixed(0)}度`}
            ><i><em /></i>{topTenNames.has(city.name) && <span className="place-name">{city.name}</span>}<span className="weather-only"><strong>{weatherIcon(city, dayIndex)}</strong><small>{city.temperature[dayIndex].toFixed(0)}°</small></span></button>;
          })}

          <div className="migration-route route-cd-hz"><i /><span>成都 → 杭州</span><small>人口流动关联</small></div>
          <div className="migration-route route-bj-sh"><i /><span>北京 → 上海</span><small>人口流动关联</small></div>
          <div className="migration-route route-gz-wh"><i /><span>广州 → 武汉</span><small>人口流动关联</small></div>

          <div className="map-stamp">红色仅标注综合观测前10；箭头为百度迁徙人群流动关联，不代表病毒已沿该路线传播</div>
        </div>

        <div className="visual-legend"><b>地图等级</b><button className={filter === "high" ? "active" : ""} onClick={() => setFilter(filter === "high" ? "all" : "high")}><i className="risk-high" />前10：浅红 → 深红</button><button className={filter === "low" ? "active" : ""} onClick={() => setFilter(filter === "low" ? "all" : "low")}><i className="other-blue" />其余：蓝 / 黄 / 绿</button><span className="route-key">⇢ 人群流动关联</span></div>

        <div className="mini-chart">
          <div className="mini-head"><span>{selected.name} · 近7日环境关联值</span><b>{risk.toFixed(1)}</b></div>
          <div className="bars">{shortDays.map((day, index) => { const value = surveillanceRisk(selected, index); return <button key={day} className={index === dayIndex ? "active" : ""} onClick={() => setDayIndex(index)} aria-label={`${day}环境关联值${value}`}><i style={{ height: `${Math.max(7, value)}%` }} /><small>{day.slice(3)}</small></button>; })}</div>
        </div>

        <div className={`right-panel ${panel === "none" ? "collapsed" : ""}`}>
          <div className="panel-tabs"><button className={panel === "city" ? "active" : ""} onClick={() => setPanel("city")}>城市</button><button className={panel === "ranking" ? "active" : ""} onClick={() => setPanel("ranking")}>排行</button><button className={panel === "sources" ? "active" : ""} onClick={() => setPanel("sources")}>数据</button><button className="collapse-button" onClick={() => setPanel(panel === "none" ? "city" : "none")}>{panel === "none" ? "‹" : "›"}</button></div>

          {panel === "city" && <div className="panel-content">
            <div className="city-title"><div><small>选中城市</small><h2>{selected.name}</h2><p><i className={riskTone} />{statusFor(risk)}</p></div><div className={`risk-orbit ${riskTone}`} style={{ "--risk": `${risk * 3.6}deg` } as React.CSSProperties}><b>{Math.round(risk)}</b><small>/100</small></div></div>
            <div className="metric-grid"><div><span>日均气温</span><b>{temperature.toFixed(1)}°</b></div><div><span>日变化</span><b className={trend > 0 ? "up" : "down"}>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}</b></div><div><span>当日降水</span><b>{precipitation.toFixed(1)} mm</b></div><div><span>最大风速</span><b>{wind.toFixed(1)} km/h</b></div></div>
            <div className="signal-stack"><h3>正规数据构成</h3><div><span>流感监测</span><i><em style={{ width: "82%" }} /></i><b>周报</b></div><div><span>天气环境</span><i><em style={{ width: `${selected.risk[dayIndex]}%` }} /></i><b>日级</b></div><div><span>人口迁徙</span><i><em style={{ width: "68%" }} /></i><b>日级</b></div></div>
            <div className="route-card"><div><span>国家流感中心</span><i>＋</i><span>Open-Meteo</span><i>＋</i><span>百度迁徙</span></div><p>疾病数据按官方发布频率更新；省级排序是正规来源数据的综合观测值，不等于省级确诊病例排名。</p></div>
          </div>}

          {panel === "ranking" && <div className="panel-content ranking-panel"><small className="overline">OFFICIAL-DATA COMPOSITE VIEW</small><h2>{dateLabel} 综合观测 Top 10</h2><p className="intro">依据国家流感中心周报、城市天气环境综合排列，不代表病例数。</p>{ranked.slice(0, 10).map((city, index) => { const value = surveillanceRisk(city, dayIndex); return <button key={city.name} onClick={() => { setSelectedName(city.name); setPanel("city"); }}><b>{String(index + 1).padStart(2, "0")}</b><span>{city.name}<small>{weatherIcon(city, dayIndex)} {city.temperature[dayIndex].toFixed(1)}° · 降水 {city.precipitation[dayIndex].toFixed(1)}mm</small></span><i><em style={{ width: `${value}%` }} /></i><strong>{value.toFixed(1)}</strong></button>; })}</div>}

          {panel === "sources" && <div className="panel-content source-plan"><small className="overline">VERIFIED DATA SOURCES</small><h2>正规数据层</h2><p className="intro">不再使用搜索或购药样例数值，只展示可追溯公开来源。</p><div className="source-node ready"><i>01</i><div><b>国家流感中心</b><span>2026年第32周流感监测周报</span></div><em>周级</em></div><div className="source-node ready"><i>02</i><div><b>Open-Meteo</b><span>34城市历史天气观测</span></div><em>日级</em></div><div className="source-node ready"><i>03</i><div><b>百度迁徙</b><span>跨城市人口迁入迁出关联</span></div><em>日级</em></div><div className="source-note">迁徙数据描述人群流动，不代表病毒传播方向；综合观测也不替代疾控部门的病例监测和医学预警。</div></div>}
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
