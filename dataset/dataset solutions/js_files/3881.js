// inputに入力データ全体が入る
function Main(input) {
	var toping = 0;
	for(var i = 0;i<3;i++){
		if(input[i] == 'o'){
			toping = toping + 100
		}
	}
	
	//出力
	console.log(toping + 700);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
