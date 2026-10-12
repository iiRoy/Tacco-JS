// inputに入力データ全体が入る
function Main(input) {
	tmp = input.split(” “);
	var b = tmp[0];
	var c = tmp[1];
	//出力
	console.log(c+b);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require(“fs”).readFileSync(“/dev/stdin”, “utf8”));