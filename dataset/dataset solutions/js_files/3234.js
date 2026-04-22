// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	tmp = input[0].split(" ");

	var n = parseInt(tmp[0], 10);
	var x = parseInt(tmp[1], 10);
	var y = parseInt(tmp[2], 10);
	var max = Math.min(x, y);
	var min = 0;
	if(x != 0 && y != 0) {
		var num1 = x - Math.floor(n / 2);
		var num2 = y - Math.floor(n / 2);
		if(num1 < 0) num1 = 0;
		if(num2 < 0) num2 = 0;
		min = num1 + um2;
	}
	//出力
	console.log('%d %d',max,min);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
