"use strict";
// inputに入力データ全体が入る
const main = (input) => {
  const [x, a, b] = input.trim().split(" ").map(Number);
  if (b - a < 0) {
    return "delicious";
  } else if (b - a < x) {
    return "safe";
  } else {
    return "dangerous";
  }
};

// ※この行以降は編集しない (標準入力から一度に読み込みMainを呼び出します)
console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));
