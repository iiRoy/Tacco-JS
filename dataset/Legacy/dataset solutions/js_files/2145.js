// inputに入力データ全体が入る
function Main(input) {
	var ans = 'No'
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.trim().split("\n");
	s = input[0].split(' ').map((n) => (parseInt(n)))
	s.sort()
	if (s[0] === s[1]) {
		if (s[0] !== s[2]) {
			ans = 'Yes'
		}
	}

	if (s[1] === s[2]) {
		if (s[0] !== s[2]) {
			ans = 'Yes'
		}
	}



	//出力
	console.log(ans)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));