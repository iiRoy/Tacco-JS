function Main(input) {
	input = input.trim().split("\n").map((list)=>Number(list));
  var N = input[0];
  var H = input[1];
  var W = input[2];
  console.log((N - H + 1) * (N - W + 1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
