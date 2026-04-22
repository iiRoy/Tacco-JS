// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る

	
	const inputLines = input.split("\n");
	const line0 = inputLines[0];
	const line0vars = line0.split(" ");
	const line1 = inputLines[1];
	const line1vars = line1.split(" ");
	const line2 = inputLines[2];

	const a = parseInt(line0vars[0], 10);
	const v = parseInt(line0vars[1], 10);
	
	const b = parseInt(line1vars[0], 10);
	const w = parseInt(line1vars[1], 10);

	const t = parseInt(line2, 10);

	if (v <= w) {
		console.log((a === b) ? "YES" : "NO");
		return;
	}
	const time = Math.abs(b - a) / Math.abs(v - w);
	console.log((0 < time && time <= t) ? "YES" : "NO");
	return;

	// tmp = input[1].split(" ");
	// //文字列から10進数に変換するときはparseIntを使います
	// var a = parseInt(input[0], 10);
	// var b = parseInt(tmp[0], 10);
	// var c = parseInt(tmp[1], 10);
	// var s = input[2];

	//出力
	// console.log('%d %s',a+b+c,s);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// node index.js
// 1
// 2 3
// test
// (Ctrl + D)
