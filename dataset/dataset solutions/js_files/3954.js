// inputに入力データ全体が入る
function Main(input) {
	var n = +(input[0]);
	var poss = input[1].split(/[\s]+/);
	var cost = [];
	var accum = 0;
	var x = 0;
	for (var i=0; i<n; ++i) {
		var y = +(poss[i]);
		cost.push(x - y);
		accum += Math.abs(x - y);
		x = y;
	}
	cost.push(x - 0);
	accum += Math.abs(x - 0);

	for (var i=0; i<n; ++i) {
		console.log(`${accum - Math.abs(cost[i]) - Math.abs(cost[i + 1]) + Math.abs(cost[i] + cost[i + 1])}`);
	}
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));