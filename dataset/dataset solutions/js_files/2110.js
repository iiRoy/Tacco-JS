// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	var a = parseInt(input[0], 10);
	console.log('%d', (a+1)/2);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));