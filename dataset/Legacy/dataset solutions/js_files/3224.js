'use strict';

function main(input) {
  const lines = input.split('\n');
  const N = parseInt(lines[0]);
  const l = lines[1]
    .split(' ')
    .map(Number)
    .sort((a, b) => a - b);

  const max = l.pop();
  const sum = l.reduce((prev, curr, i, arr) => prev + curr);
  console.log(max < sum ? 'Yes' : 'No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
