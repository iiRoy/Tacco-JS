'use strict'

function main(s) {

  s = s.split('\n')[0].split(' ').map(n => Number(n));

  const A = s[0];
  const B = s[1];
  const C = s[2];
  const X = s[3];
  const Y = s[4];

  const mod = Math.abs(X - Y);
  const min = Math.min(X, Y);
  let answer = 0;

  if (A + B <= C * 2) {
    // AとBをそれぞれ買う
    answer = A * X + B * Y;
  } else {
    if (((X - min) * A + (Y - min) * B) <= C * mod) {
      // ABで可能な限り組み替えて、残りをそれぞれ買う
      answer = (C * min * 2) + ((X - min) * A) + ((Y - min) * B);
    } else {
      // 全て組み替える
      answer = C * Math.max(X, Y) * 2;
    }
  }

  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
