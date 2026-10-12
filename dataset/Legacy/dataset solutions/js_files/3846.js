'use strict'

function main(s) {

  s = '1 1\n'
  s = s.split('\n')[0].split(' ').map(x => Number(x));

  const a = s[0];
  const b = s[1];
  let ans = (a <= b) ? a : (a - 1);

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
