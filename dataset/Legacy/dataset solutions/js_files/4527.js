function Main(input){
	input = input.split("\n");
	input = input[1].split(" ").map(Number);
	console.log(Math.max.apply(null,input)-Math.min.apply(null,input));
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());