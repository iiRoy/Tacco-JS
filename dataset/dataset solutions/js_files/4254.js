'use strict'

function main(s) {

  const n = Number(s);

  let max = 0;
  let i = 0;

  while (max < n) {
    i += 1;
    max = Math.pow(i, 2);
  }

  const ans = Math.pow(i - 1, 2);

  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
