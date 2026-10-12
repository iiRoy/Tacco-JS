function Main(input) {
	input = input.split("\n");
	
	var a = parseInt(input[0], 10);
	
	result = a + a * a + a * a * a
	
	console.log(result);
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));