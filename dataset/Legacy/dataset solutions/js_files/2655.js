function Main(input) {
  var [left, right] = input.split(" ");
  var maxNum = [];
  
  maxNum.push(Number(left) + Number(right));
  maxNum.push(Number(left) - Number(right));
  maxNum.push(Number(left) * Number(right));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

