// inputに入力データ全体が入る
function Main(input) {
  line = input.split(" ");
  var A = +line[0];
  var B = +line[1];
  var C = +line[2];
  var D = +line[3];
  var count = 0;
  
  for(i=A; i<=B; i++){
    if(i%C == 0 || i%D ==0){     
    }else{
      count += 1;
    }
  }
  
  console.log(count);
  
}
  
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
