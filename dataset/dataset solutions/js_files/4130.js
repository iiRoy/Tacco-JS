'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ');
  const a = Number(s[0]);
  const b = Number(s[1]);
  const c = Number(s[2]);
  const d = Number(s[3]);

  const left  = a + b;
  const right = c + d;

  let ans = '';
  if (left > right)   ans = 'Left';
  if (left < right)   ans = 'Right';
  if (left === right) ans = 'Balanced';

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
