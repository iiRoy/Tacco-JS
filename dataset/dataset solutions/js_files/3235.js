// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split(" ");
  N = parseInt(input[0]);
  A = parseInt(input[1]);
  B = parseInt(input[2]);
  answer2 = (N-A-B > 0) ? 0 : Math.abs(N-A-B); 
	console.log('%d %d',Math.min(A,B),answer2);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));