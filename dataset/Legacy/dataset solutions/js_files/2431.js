// inputに入力データ全体が入る
function Main(input) {
  input = input.split('\n');
  var size = input[0];
  var i, j, pi, xi, yi, xj, yj, d;
  var result = 0;
  for(i = 1; i <= size; i++) {
    pi = input[i].split(' ');
    xi = pi[0];
    yi = pi[1];
    for(j = i + 1; j <= size; j++) {
      pj = input[j].split(' ');
      xj = pj[0];
      yj = pj[1];
      d = Math.sqrt((xi - xj) * (xi - xj) + (yi - yj) * (yi - yj))
      result += d;
    }
  }
  console.log(result * 2 / size);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
