'use strict'

function main(s) {

  const m = Number(s);
  const ans = (24 - m) + 24;
  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
