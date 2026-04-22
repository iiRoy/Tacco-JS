// inputに入力データ全体が入る
function Main(input) {
  var N, r, c, rabbits;
  [N, r] = input.split("\n");
  rabbits = r.split(" ").map(i=>parseInt(i));
  c = 0;
  rabbits.forEach((r, i,s) => c += s[r-1] === i + 1 ? 1 : 0);
  console.log(c/2);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));