// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	var n = parseInt(input[0], 10);
	var a = input[1].split("");
	var b = input[2].split("");
	var c = input[3].split("");
	var abCount = 0;
	var acCount = 0;
	var bcCount = 0;
	for (var i = 0; i < n; i++) {
		if ((a[i] != b[i])) {
			abCount++;
		};
		if ((a[i] != c[i])) {
			acCount++;
		};
		if ((b[i] != c[i])) {
			bcCount++;
		};
	};
	var aCount = abCount + acCount;
	var bCount = abCount + bcCount;
	var cCount = acCount + bcCount;
	//出力
	console.log('%d',Math.min(aCount, bCount, cCount));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
