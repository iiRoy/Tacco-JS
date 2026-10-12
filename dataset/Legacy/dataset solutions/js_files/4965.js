function Main(input) {
	input = input.split("\n");
	var a = parseInt(input[0], 10);
	var b = parseInt(input[1], 10);
	var h = parseInt(input[2], 10);
	var s = (a+b)*h/2;
	console.log('%d',s);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));