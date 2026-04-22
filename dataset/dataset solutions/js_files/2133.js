function Main(input) {
  var split = input.split(' ');
  var value = +split[0];
  var digit = +split[1];
  var result = '';
  while(value > 0) {
    result += value % digit;
    value = Math.floor(value / digit);
  }
  console.log(result.length);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));