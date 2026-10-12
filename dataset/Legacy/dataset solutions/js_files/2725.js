// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	// input1 = input.split('').map((n) => (parseInt(n)))
	// 配列の最初をのぞく
	var arr = input.map((n) => parseInt(n)).filter((n , i) => (i != 0))
	// var arr = input.map((n) => parseInt(n))
	var ans = 0
	arr.forEach((n, i) => {
		// console.log(Math.max(arr.filter((num, s) => (s != i))))
		console.log(arr.filter((num, index) => (index != i)).reduce((nn, ii) => (Math.max(nn, ii))))
	})




	//出力
	// console.log(ans )
}
// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));
Main(require('fs').readFileSync('./input.txt', 'utf-8'));