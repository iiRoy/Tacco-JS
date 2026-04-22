function bai(x,y) {
	var x1 = x, y1 = y;
	var temp;
	while (y1 != 0) {
		temp = y1;
		y1 = x1 % y1;
		x1 = temp;
	}
	return x*y/x1;
}

// inputに入力データ全体が入る
function Main(input) {
	console.log("main");
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	var count = input[0]-0;
	var values = input[1].split(" ");
	var numerator = 1;
	var denominator = values[0]-0;
	console.log("for");
	for(var i = 1; i < count; i++) {
		console.log(i);
		var newDenominator = bai(denominator, values[i]-0);
		numerator *= newDenominator/denominator;
		numerator += newDenominator/values[i]-0;
	}
	
    console.log(denominator/numerator);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));