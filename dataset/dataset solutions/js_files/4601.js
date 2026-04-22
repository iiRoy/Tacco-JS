'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ').map(n => Number(n));
  const A = s[0];
  const B = s[1];
  const C = s[2];

  let modSet = new Set();

  for (let i = 0; i <= A * B; i++) {
    modSet.add((A * i) % B);
  }

  const answer = modSet.has(C) ? 'YES' : 'NO';
  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
