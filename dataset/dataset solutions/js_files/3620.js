// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split(" ");

  //文字列から10進数に変換するときはparseIntを使います
  var N = parseInt(input[0], 10);
  var K = parseInt(input[1], 10);

  //出力
  if(N % K === 0) {
    console.log(0);
  } else {
    console.log(1);
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));