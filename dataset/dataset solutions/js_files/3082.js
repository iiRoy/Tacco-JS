function MainA(input) {
	input = input.split("\n");
	var n = input[0];
	var s = input[1];
	var r = 0;
	var b = 0;
	for(var i = 0; i < n; i++){
		if(s[i] == "R") r++;
		else b++;
	}
	var result = (a > b) ? "Yes" : "No";

	console.log('%s',result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
MainA(require("fs").readFileSync("/dev/stdin", "utf8"));