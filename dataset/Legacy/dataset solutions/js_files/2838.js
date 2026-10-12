// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	var input0 = input[0].split(" ");
	const N = parseInt(input0[0]);
	const K = parseInt(input0[1]);
	if(N == 1){
		console.log(0);
	}else{
		console.log(N-K);
	}
 }
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));