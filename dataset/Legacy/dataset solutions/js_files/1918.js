// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	n = input;
	var a=100;
    var year=0;
  
    while(a<n){
    a = Math.floor(a*1.01);
    year=year+1;
    }
	//出力
	console.log(year);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));