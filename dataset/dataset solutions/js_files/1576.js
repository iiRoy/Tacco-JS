const input = require("fs").readFileSync("/dev/stdin", "utf8").slice(0, -1).split('\n')[0]; // sliceは最終行の改行削除に利用
let total = 0;
for (let i = 0;i < input.length;i++) {
  total += Number(input[i]);
}

console.log(total % 9 == 0 ? "Yes" : "No");