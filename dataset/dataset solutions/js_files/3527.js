// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	lineTop = input[0].split(" ");
	lineX = input[1].split(" ");
	lineY = input[2].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var n = parseInt(lineTop[0], 10);
	var m = parseInt(lineTop[1], 10);
	var x = parseInt(lineTop[2], 10);
	var y = parseInt(lineTop[3], 10);

	var maxX = x;
	var minY = y;

	for (var work of lineX) {
		if (parseInt(work) > parseInt(maxX)) {
			maxX = work;
		}
	}

	for (var work of lineY) {
		if (parseInt(work) < parseInt(minY)) {
			minY = work;
		}
	}

	if (parseInt(minY) <= parseInt(maxX)) {
		console.log('War');
	} else {
		console.log('No War');
	}
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
