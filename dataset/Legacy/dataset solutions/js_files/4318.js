function Main(input) {
	input = input.split("").map(Number);
    var sum = 0;
	input.forEach(function(i){sum+=i;});
	console.log(sum);
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());