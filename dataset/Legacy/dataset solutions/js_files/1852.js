function Main(input) {
  input = input.split("\n");
  const K = Number.parseInt(input[0]);
  const S = input[1];

  if (S.length <= K){
    console.log(S);
  } else {
    console.log(S.slice(0, K) + '...');
  }

}

// デバッグ用
function debug() {
  var input = document.getElementById("input").value;
  Main(input);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));