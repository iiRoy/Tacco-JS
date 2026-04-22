// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\n");
	var N = Number(line[0]);
	var tmp = line[1].split(" ");
	var days = Number(tmp[0]);
	var rest = Number(tmp[1]);
	var A = [];
	for(var i = 2; i < N+2; i++){
		A[i-2] = Number(line[i]);
	}

	var ans = rest;

	for(var j = 0; j < A.length; j++){
		ans += 1 + Math.floor((days-1)/A[j]);
	}

	console.log(ans);

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));