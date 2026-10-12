function Main(input) {
  const split = input.split(' ');
  const value = +split[0];
  const digit = +split[1];
  let result = '';
  while(value > 0) {
    result += value % digit;
    value = Math.floor(value / digit);
  }
  console.log(result.length);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));