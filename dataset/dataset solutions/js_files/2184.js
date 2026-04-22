// inputに入力データ全体が入る
function Main(input) {
  // inputを行ごとに分割しarrayに入れる	
  input = input.split("\n");
  // 最大値
  const limit = parseInt(input[0], 10);
  // non-zero digit number
  const nonZero = parseInt(input[1], 10);
  // カウンター
  var count = 0;
  // 1からlimitまでのループ
  for (var i=1; i<=limit; i++) {
    // iを桁ごとに分けて配列に入れる
    var digits = (""+i).split("");
    // 0以上の桁を数えるカウンター
    var digitCount = 0;
    // かく桁を覗く
    for (var j=0; j<digits.length; j++) {
      // 桁を数字型に変換
      var n = parseInt(digits[j], 10);
      // 桁が0以上なら桁カウンターに1を足す
      if (n != 0) {
        digitCount += 1;
      };
    };
    if (digitCount == nonZero) {
      count += 1;
    };
  }
  console.log(count);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
