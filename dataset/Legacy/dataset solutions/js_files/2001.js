// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  var ans = "Yes";
  input = input.trim().split("\n");
  const [N, M] = input[0].split(" ").map((n) => parseInt(n));
  var a = input[1].split(" ").map((n) => parseInt(n));
  a.sort((a, b) => b - a);
  var top = a.slice(0, M);
  const lim = (1 * arrsum(a)) / (4 * M);

  if (top[top.length - 1] < lim) {
    ans = "No";
  }

  function arrsum(arr) {
    return arr.reduce((c, a, i, self) => {
      return c + a;
    });
  }

  //出力
  console.log(ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require("fs").readFileSync("./input.txt", "utf-8"));
