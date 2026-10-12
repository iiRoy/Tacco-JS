// inputに入力データ全体が入る
function Main(input) {

  var inp = input.split('\n');
  var N = parseInt(inp[0]);
  var a = inp[1].split(' ');
  var b = inp[2].split(' ');

  var tmp = 0;
  var dx = 0;
  for (var i = 0; i < N; i++) {
    dx = (parseInt(b[i]) - parseInt(a[i]))
    tmp += dx;
  }

  if (tmp % 2 === 1) {
    console.log("%s", "Yes");
  } else {
    console.log("%s", "No");
  }

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));