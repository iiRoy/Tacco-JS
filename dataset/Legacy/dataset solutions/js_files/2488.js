function Main(input) {
	input = input.split("\n");
  	console.log(input[0] - input[1] * 2 < 0 ? 0 : input[0] - input[1] * 2 )
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));