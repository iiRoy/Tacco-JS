// inputに入力データ全体が入る
function Main(input) {
	ans = -1
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.trim().split("\n");
	N = input[0].split(' ').map((n) => (parseInt(n)))[0]
	f = input.slice(1)
	ansarr = new Array(N).fill('a')

	for (i = 0; i < f.length; i++) {
		var tmp = f[i].split(' ').map((n) => (parseInt(n)))
		ansarr[tmp[0] -1] = tmp[1]
	}

	var c = ansarr.join("").replace(/^a*/, '').replace(/a/g , 0)
	var d = parseInt(c).toString()
	if (c == '00') {
		ans = 100
	} else if (c == '0') {
		ans = 10
	} else if (c == d) {
		ans = parseInt(d)
	}

	//出力
	console.log(ans)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));
