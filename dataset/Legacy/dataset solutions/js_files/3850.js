'use strict';

function main(input) {
  const arr = input.split('\n');
  const nums = arr[0];
  const k = parseInt(arr[1]);
  let vals = nums.split(' ').map(num => parseInt(num));

  for (let i = 0; i < k; i++) {
    vals = doubleMax(vals);
  }

  console.log(vals.reduce((prev, current) => prev + current));
}

function doubleMax(vals) {
  const result = [...vals];
  const max = Math.max(...vals);
  const index = result.indexOf(max);
  result[index] = max * 2;
  return result;
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));