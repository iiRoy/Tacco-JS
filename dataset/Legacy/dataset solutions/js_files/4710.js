'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ').map(n => Number(n));

  let a = s[0];
  let b = s[1];

  if (a === 1) a += 13;
  if (b === 1) b += 13;

  let ans = '';

  if (a > b)   ans = 'Alice';
  if (a < b)   ans = 'Bob';
  if (a === b) ans = 'Draw';

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
