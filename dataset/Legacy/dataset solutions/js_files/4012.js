'use strict'

function main(s) {

  s = s.split('\n');

  const n = Number(s[0]);
  const names = s.slice(1, -1);

  const has = [0, 0, 0, 0, 0];

  for (const name of names) {
    if (name.charAt(0) === 'M') has[0]++;
    if (name.charAt(0) === 'A') has[1]++;
    if (name.charAt(0) === 'R') has[2]++;
    if (name.charAt(0) === 'C') has[3]++;
    if (name.charAt(0) === 'H') has[4]++;
  }

  let ans = 0;

  const comb = (i, pro) => {
    if (i === 5) {
      if (pro.length === 3) {
	    ans += pro.reduce((a, b) => a * b);
      }
      return;
    }
    comb(i + 1, [...pro, has[i]]);
    comb(i + 1, pro);
    return;
  }

  comb(0, [])

  console.log(ans);

}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
