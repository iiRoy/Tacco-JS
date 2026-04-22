// inputに入力データ全体が入る
function Main(input) {

  var inp = input.split('\n');
  var N = inp[0];
  var tmp = inp[1].split(' ');
  var tmp2 = inp[2].split(' ');
  var A = new Array;
  A[0] = new Array;
  A[1] = new Array;

  // console.log(tmp2);


  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < N; j++) {
      if (i === 0) {
        A[i][j] = parseInt(tmp[j]);
      } else if (i === 1) {
        A[i][j] = parseInt(tmp2[j]);
      }
    }
  }

  var maxVal = 0;
  for(var tmp = 0; tmp <= N - 1; tmp++) {
    var sum = 0;
    for (var l = 0; l <= N - 1 - tmp; l++) {
      sum += A[0][l];
    }
    for (var m = N - 1 - tmp; m <= N - 1; m++) {
      sum += A[1][m];
    }
    if (sum > maxVal) maxVal = sum;
  }
  console.log('%d', maxVal);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));