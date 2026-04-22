// inputに入力データ全体が入る
function Main(input) {
	input = input.split(" ");
	const map1 = input.map(n => parseInt(n, 10));
  	map1.sort((a, b) => a - b)
  	console.log( map1[0] + map1[1] === map1[2] ? "Yes" : "No")
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));