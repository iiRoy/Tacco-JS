const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.trim().split('\n');
const n = Number(list[0]);
const A = list[1].trim().split(' ');
const q = Number(list[2]);
const mi = list[3].trim().split(' ');

class KeyMap {
  constructor() {
    this.map = {};
  }
  get(...args) {
    let map = this.map;
    args.forEach(arg => {
      map[arg] = map[arg] || {};
      map = map[arg];
    });
    return map;
  }
}

const dp = new Map();
const keyMap = new KeyMap();
const memo = (i, m) => {
  if (dp.has(keyMap.get(i, m))) {
    return dp.get(keyMap.get(i, m));
  }
  if (i === n || m <= 0) {
    return m === 0;
  }

  const nI = i + 1;
  const nM = m - A[i];
  dp.set(keyMap.get(nI, m), memo(nI, m));
  dp.set(keyMap.get(nI, nM), memo(nI, nM));
  return dp.get(keyMap.get(nI, m)) || dp.get(keyMap.get(nI, nM));
}
for (let i = 0; i < q; i++) {
  console.log(memo(0, Number(mi[i])) ? 'yes' : 'no');
}
// console.log(dp);
