
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split(" ");
  const a = Number(input[0]);
  const b = Number(input[1]);
  const c = Number(input[2]);
  if (Math.sqrt(c) > Math.sqrt(a) + Math.sqrt(b)) {

    console.log("Yes");
  } else if (Math.sqrt(c) <= Math.sqrt(a) + Math.sqrt(b)) {
    console.log("No");
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));