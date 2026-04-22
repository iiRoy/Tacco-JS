function Main(input) {
	input = input.split("\n");
	
	console.log("%s%s%s", input[0][0], input[1][1], input[2][2]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));