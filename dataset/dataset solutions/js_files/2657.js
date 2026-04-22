'use strict';

function main(input) {
  const lines = input.split('\n');
  lines.pop();
  lines.forEach(line => {
    const s = line.split(' '),
      k = parseInt(s[0], 10),
      x = parseInt(s[1], 10);
    f(k, x);
  });
}

function f(k, x) {
  const r = k - 1;
  const min = -1000000,
    max = 1000000;
  let oMin = x - r,
    oMax = x + r;
  if (oMin < min) {
    oMin = min;
  }
  if (oMax > max) {
    oMax = max;
  }
  for(let i = oMin; i <= oMax; i++) {
    console.log(i);
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
