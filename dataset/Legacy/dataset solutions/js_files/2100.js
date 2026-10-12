// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  const N = parseInt(input.split(" ")[0]);
  const A = parseInt(input.split(" ")[1]);
  const B = parseInt(input.split(" ")[2]);
  if (A + B === 0) {
    console.log(0)
    return
  }
  const r = Math.floor(N / (A + B))
  const l = N - (r * (A + B))
  if (l >= A) {
    ans = r * A + A
  } else {
    ans = r * A + l
  }
  console.log(ans)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
