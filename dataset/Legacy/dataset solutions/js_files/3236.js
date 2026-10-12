function Main(input) {
	input = input.split(" ").map(Number);
	var n = -input[0]+input[1]+input[2];
	if(n<=0) n=0;
	console.log(Math.min(input[1],input[2])+" "+n);

}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());