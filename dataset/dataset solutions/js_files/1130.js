const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.trim().split('\n');
let [ n, m ] = list[0].split(' ');
n = Number(n);
m = Number(m);
let cm = list[1].trim().split(' ');
cm = cm.map(c => Number(c));

console.log(dp);
console.log(dp.get(Number(n)));


for (let i = 0; i <= n; i++) {
  if (dp.has(i)) {
    continue;
  }

  let min = max;
  for (let j = 0; j < m; j++) {
    const target = i - cm[j];
    if (target < 0 || !dp.has(target)) {
      continue;
    }
    const count = dp.get(target);
    min = Math.min(count, min);
  }
  if (min < max) {
    dp.set(i, min + 1);
  }
}

console.log(dp.get(n));

