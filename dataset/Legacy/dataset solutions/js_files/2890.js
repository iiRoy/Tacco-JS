// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
  	var S = input[0];
       S = S.replace(/o/g,"");
        if(S.length >= 8){
       console.log("NO");
}else{
       console.log("YES");
}
 }
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));