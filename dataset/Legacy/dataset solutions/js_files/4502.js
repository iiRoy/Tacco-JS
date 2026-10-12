'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ').map(n => Number(n));

  const x = s[0];
  const a = s[1];
  const b = s[2];

  let ans = '';

  if (a >= b) {
    ans = 'delicious';
  } else if (x >= (b - a)) {
    ans = 'safe';
  } else {
    ans = 'dangerous';
  }

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
