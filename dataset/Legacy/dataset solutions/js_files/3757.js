// inputに入力データ全体が入る
function Main(input) {
	var inputs = input.split("\n");
	var head = inputs[0].split(" ");
	var eats = inputs.slice(1, parseInt(head[0]) + 1);
	if (parseInt(head[1]) == 0) {
		console.log(0);
		return;
	}

	var cakes = eats.map((v) => v.split(" ").map((v) => parseInt(v)));


	var ans = cakes.map((v) => v.reduce((a, x) => a+x), 0).sort((l, r) => {
		return l < r;
	}).slice(0, parseInt(head[1])).reduce((a, x) => a+x, 0);

	console.log(ans);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
