// inputに入力データ全体が入る
function Main(input) {
	// input に a,b,c がそれぞれ１つ存在すること
    
    if(input.indexOf('a') >= 0
       && input.indexOf('b') >= 0
       && input.indexOf('c') >= 0){
      console.log("Yes");
    }else{
      console.log("No");
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
