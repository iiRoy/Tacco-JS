// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\n");
	var tmp = line[0].split(" ");
	var lower = Number(tmp[0]);
	var upper = Number(tmp[1]);

	// ans is x which satisfies lower * 2^(x-1) = upper
	var ans = Math.floor(Math.Log2(upper/lower)) + 1;
	console.log(ans);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));