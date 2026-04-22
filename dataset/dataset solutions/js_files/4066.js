// inputに入力データ全体が入る
function Main(input) {
  
  var inp = input.split(' ');
  var a = parseInt(inp[0]);
  var b = parseInt(inp[1]);

  if(a * b % 2 === 1){
    console.log('%s', 'Odd');  
  } else {
    console.log('%s', 'Even');  
  }
  
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));