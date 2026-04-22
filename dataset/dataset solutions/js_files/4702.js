function Main (input) {
	var inputArr = input.split(' ');
	var sNum = Number(inputArr[0]);
	var cNum = Number(inputArr[1]);
	var result = 0;
	// Sを使う組み合わせ
	while (sNum >= 1 && cNum >= 2) {
		sNum -= 1;
		cNum -= 2;
		result += 1;
	}
	// cだけを使う組み合わせ
	while (cNum >= 4) {
		cNum -= 4;
		result += 1;
	}
	console.log(result);
}
// Main("12345 678901");
Main(require("fs").readFileSync("/dev/stdin", "utf8"));