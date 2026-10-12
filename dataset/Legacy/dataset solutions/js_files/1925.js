// inputに入力データ全体が入る
function Main(input) {
	var ans = 0
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.trim().split("\n")
	// var arr = input.trim().split("\n")
	var n = input[0].split(' ').map(n => parseInt(n))
	var A = n[0]
	var B = n[1]
	var N = n[2]
	var cnt = N
	var p = 0
	while ( 0 < cnt) {
		var t = Math.floor(A * cnt / B) - A * Math.floor(cnt / B)
		if (ans < t ) {
			ans = t
			break
		} else {
			p++
			if (p > 30) {
				break
			}
		}
		cnt--
	}

	//出力
	console.log(ans)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));