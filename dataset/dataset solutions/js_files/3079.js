function MainA(input) {
	input = input.split("\n")[0].split(" ");
	var a = input[0];
	var b = input[1];
	var c = input[2];
	var result = (a == b && b == c) ? "Yes" : "No";

	console.log('%s',result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
MainA(require("fs").readFileSync("/dev/stdin", "utf8"));