const inputLines = require('fs')
  .readFileSync('/dev/stdin', 'utf-8')
  .split('\n');

const firstNumberStr = inputLines[0];

console.log(Math.round(firstNumberStr / 2) / firstNumberStr);
