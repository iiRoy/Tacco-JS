// inputに入力データ全体が入る
function Main(str) {
  const num = str.split(' ');
  const N = parseInt(num[0]);
  const K = parseInt(num[1]);

  var arr = [];

  for (var i = 1; i <= N; i++) {
    var arr2 = [];
    arr2[0] = i;

    for (var j = 1; j <= N; j++) {
      arr2[1] = j;

      for (var k = 1; k <= N; k++) {
        arr2[2] = k;

        //console.log(arr2[0] + arr2[1]);

        if ((arr2[0] + arr2[1]) % K === 0
          && (arr2[1] + arr2[2]) % K === 0
          && (arr2[2] + arr2[0]) % K === 0) {
          arr.push(arr2);
        }
      }
    }
  }

  console.log(arr.length);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));