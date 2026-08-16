import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("app/data/national-weather.json", "utf8"));
const base = fs.readFileSync("public/china-provinces.svg", "utf8");
const capitals = {
  Qinghai:"西宁",Xinjiang:"乌鲁木齐",Gansu:"兰州","Inner Mongolia":"呼和浩特",Jilin:"长春",Heilongjiang:"哈尔滨",Guangxi:"南宁",Guizhou:"贵阳",Henan:"郑州",Taiwan:"台北",Zhejiang:"杭州",Fujian:"福州",Guangdong:"广州",Beijing:"北京",Liaoning:"沈阳",Hebei:"石家庄",Tianjin:"天津",Shandong:"济南",Anhui:"合肥",Jiangsu:"南京",Shanghai:"上海",Sichuan:"成都",Chongqing:"重庆",Hunan:"长沙",Yunnan:"昆明",Shaanxi:"西安",Ningxia:"银川",Shanxi:"太原",Hubei:"武汉",Jiangxi:"南昌","Hong Kong":"香港",Macau:"澳门",Hainan:"海口",Tibet:"拉萨"
};
const byName = Object.fromEntries(data.cities.map(city => [city.name, city]));
const risk = (city, day) => Math.min(96, Math.max(12, city.risk[day] * .82 + (city.latitude < 32 ? 8 : 0) + city.precipitation[day] * .35));
const topColors = ["#79051f","#8f0828","#a81031","#be1c3d","#d22b49","#df4057","#e85868","#ef707a","#f48b91","#f8a8ad"];
const otherColors = ["#7bb8e8","#9bcdf0","#f2cf62","#f5df91","#7bc9b0","#a9dccb"];

for (let day = 0; day < data.dates.length; day++) {
  const ranking = [...data.cities].sort((a,b) => risk(b,day) - risk(a,day));
  const rank = new Map(ranking.map((city,index) => [city.name,index]));
  let svg = base.replace('fill="#8fd3f3" fill-opacity="0.82" stroke="#2f8fc7"', 'fill="#9bcdf0" fill-opacity="0.97" stroke="#ffffff"');
  svg = svg.replace(/<path d="([^"]+)" data-name="([^"]+)"/g, (match, path, name) => {
    const city = byName[capitals[name]];
    const position = rank.get(city.name);
    const fill = position < 10 ? topColors[position] : otherColors[position % otherColors.length];
    return `<path d="${path}" data-name="${name}" fill="${fill}"`;
  });
  svg = svg.replace("<title>中国省级行政区地图</title>", `<title>${data.dates[day]} 全国感冒流行风险分级图</title>`);
  fs.writeFileSync(`public/risk-map-${day}.svg`, svg);
}
