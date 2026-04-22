// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	const inputLines = input.split("\n");
	const s = inputLines[0];
	const t = inputLines[1];

	var result = t.length;
	if (t.length === 0) {
		return console.log(0);
	}
	for (var i = 0; i < s.length - t.length;i++) {
		var current = 0;
		for (var j = 0; j < t.length; j++) {
			const a = s.substr(i + j, 1);
			const b = t.substr(j, 1);

			// console.log({
			// 	i: i,
			// 	j: j,
			// 	a: a,
			// 	b: b,
			// 	current: current,
			// 	result: result
			// });

			if (a !== b) {
				current += 1;
			}
		}
		if (current < result) {
			result = current;
		}
	}

	console.log(result);
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
