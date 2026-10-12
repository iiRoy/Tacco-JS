function Main(input){
	input = input.split(" ");
	console.log((input[1]-input[0])==(input[2]-input[1])?"YES":"NO")
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());