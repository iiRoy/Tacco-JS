const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const n = line[0];

console.log(Math.round(n / 2) / n);
