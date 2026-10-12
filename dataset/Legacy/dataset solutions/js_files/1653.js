// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var n = parseInt(input[0], 10);
	var a = input[1].split(" ");
	var money = 1000;
	var kabu = 0;
	var rate;
	var nextrate;
	for (let i = 0; i < n; i++) {
		rate = parseInt(a[i], 10);
		// 最終はレートを0にして強制売却
		if (i == n - 1) {
			nextrate = 0;
		} else {
			nextrate = parseInt(a[i + 1], 10);
		}

		// 次が高ければ購入
		if (rate < nextrate) {
			kabu += Math.floor(money / rate);
			money = money % rate;

		// 次が安ければ売却
		} else {
			money += kabu * rate;
			kabu = 0;
		}
	}
	//出力
	console.log('%d', money);
}

// 実行 ファイル名により本番かどうか判断
if (__filename.match("Main.js$")) {
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
} else {
//	Main("3\n4 5\nhello\n");
	Main(require("fs").readFileSync("q4.txt", "utf8"));
}
