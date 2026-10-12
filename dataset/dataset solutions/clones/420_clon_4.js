const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;
const out = [];

while (p < data.length) {
  const m = data[p++];
  const n = data[p++];

  if (m === 0 && n === 0) {
    break;
  }

  const items = data.slice(p, p + n);
  p += n;

  let low = 0;
  let high = 0;

  for (const v of items) {
    if (v > low) low = v;
    high += v;
  }

  const ok = capacity => {
    let used = 1;
    let load = 0;

    for (const v of items) {
      if (load + v <= capacity) {
        load += v;
      } else {
        used++;
        load = v;
        if (used > m) return false;
      }
    }

    return true;
  };

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (ok(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  out.push(String(low));
}

process.stdout.write(out.join("\n"));