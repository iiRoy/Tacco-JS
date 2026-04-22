'use strict'

const main = s => {
  s = s.split('\n')[0].split(' ').map(n => Number(n));

  const A = s[1];
  const B = s[2];

  const ans = ((A - B) % 2 === 0) ? 'Alice' : 'Borys';
  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
