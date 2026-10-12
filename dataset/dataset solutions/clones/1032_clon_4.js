const fs = require("fs");

const terrain = fs.readFileSync(0, "utf8").trimEnd().split(/\n/)[0] || "";

const lowers = [];
const intervals = [];

Array.from(terrain).forEach((ch, pos) => {
  if (ch === "\\") {
    lowers.push(pos);
  } else if (ch === "/" && lowers.length) {
    const start = lowers.pop();
    intervals.push({
      l: start,
      r: pos,
      a: pos - start
    });
  }
});

intervals.sort((x, y) => {
  if (x.l !== y.l) return x.l - y.l;
  return y.r - x.r;
});

const lakes = [];

for (const item of intervals) {
  let placed = false;

  for (let i = lakes.length - 1; i >= 0; i--) {
    if (lakes[i].l < item.l && item.r < lakes[i].r) {
      lakes[i].a += item.a;
      placed = true;
      break;
    }
  }

  if (!placed) {
    lakes.push({
      l: item.l,
      r: item.r,
      a: item.a
    });
  }
}

lakes.sort((x, y) => x.l - y.l);

const areas = lakes.map(x => x.a);
const total = areas.reduce((s, v) => s + v, 0);

console.log(total);
console.log([areas.length].concat(areas).join(" "));