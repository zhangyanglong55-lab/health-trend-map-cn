import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("app/data/national-weather.json", "utf8"));
const base = fs.readFileSync("public/china-provinces.svg", "utf8");
const capitals = {
  Qinghai:"西宁",Xinjiang:"乌鲁木齐",Gansu:"兰州","Inner Mongolia":"呼和浩特",Jilin:"长春",Heilongjiang:"哈尔滨",Guangxi:"南宁",Guizhou:"贵阳",Henan:"郑州",Taiwan:"台北",Zhejiang:"杭州",Fujian:"福州",Guangdong:"广州",Beijing:"北京",Liaoning:"沈阳",Hebei:"石家庄",Tianjin:"天津",Shandong:"济南",Anhui:"合肥",Jiangsu:"南京",Shanghai:"上海",Sichuan:"成都",Chongqing:"重庆",Hunan:"长沙",Yunnan:"昆明",Shaanxi:"西安",Ningxia:"银川",Shanxi:"太原",Hubei:"武汉",Jiangxi:"南昌","Hong Kong":"香港",Macau:"澳门",Hainan:"海口",Tibet:"拉萨"
};
const byName = Object.fromEntries(data.cities.map(city => [city.name, city]));
const risk = (city, day) => {
  const seed = [...city.name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const search = 22 + ((seed * 13 + day * 17) % 65);
  const medicine = 18 + ((seed * 7 + day * 23) % 70);
  return Math.min(96, Math.max(12, search * .42 + medicine * .38 + city.risk[day] * .2));
};
const color = value => value >= 80 ? "#8f082b" : value >= 70 ? "#c52443" : value >= 60 ? "#ea5565" : value >= 45 ? "#f58b92" : value >= 30 ? "#ffc0c5" : "#ffe5e8";

for (let day = 0; day < data.dates.length; day++) {
  let svg = base.replace('fill="#8fd3f3" fill-opacity="0.82" stroke="#2f8fc7"', 'fill="#ffe5e8" fill-opacity="0.96" stroke="#ffffff"');
  svg = svg.replace(/<path d="([^"]+)" data-name="([^"]+)"/g, (match, path, name) => {
    const city = byName[capitals[name]];
    return `<path d="${path}" data-name="${name}" fill="${color(risk(city, day))}"`;
  });
  svg = svg.replace("<title>中国省级行政区地图</title>", `<title>${data.dates[day]} 全国感冒流行风险分级图</title>`);
  fs.writeFileSync(`public/risk-map-${day}.svg`, svg);
}
