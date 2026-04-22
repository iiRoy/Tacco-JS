// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
  const items = input.map(v => v.split(" "))
  const n = parseInt(items[0][0], 10)
  const m = parseInt(items[0][1])

  const judge = (num) => {
    if (num < 2) {
      return 0
    } else if (num === 2) {
      return 1
    } else {
      return num * (num - 1) / 2
    }
  }

  //文字列から10進数に変換するときはparseIntを使います
  // const a = parseInt(input[0], 10);
  //出力
  console.log(judge(n) + judge(m));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));