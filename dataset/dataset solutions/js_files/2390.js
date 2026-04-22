// https://atcoder.jp/contests/abc146/tasks/abc146_b
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	var inputN = parseInt(input[0]);
	var inputS = input[1].split("");

	// アルファベット
	var alphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	var inputSLength = inputS.length;
	var inputNum = [];

	for ( var i=0;i < inputSLength;i++){
		inputNum[i] = 0;
		for (var j=0;j < 26;j++){
			if (inputS[i] === alphabets[j]){
				inputNum[i] = j;
				break;
			}
		}
	}
	var inputNPer = inputN % 25;
	var result = '';

	for(var i=0;i < inputSLength;i++){
		var temp = inputNum[i] + inputNPer
		// console.log(temp);
		if (temp > 25) temp = temp % 26;
		result += alphabets[temp];
	}
	console.log(result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
