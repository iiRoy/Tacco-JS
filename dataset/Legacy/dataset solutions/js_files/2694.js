// inputに入力データ全体が入る
function Main(input) {
  var a,b;
  a = Number(input.split('\n')[0].split(' ')[0]);
  b = Number(input.split('\n')[0].split(' ')[1]);
  
  if(a === b){
    console.log(0);
  }else if((a + b) % 2 === 0){
    console.log((a+b)/2);
  }else{
    console.log('IMPOSSIBLE');
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
