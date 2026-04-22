function Main(input) {
	input = input.split(" ").map(Number);
	console.log(Math.ceil(input[0]/(input[1]+1)))

}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());