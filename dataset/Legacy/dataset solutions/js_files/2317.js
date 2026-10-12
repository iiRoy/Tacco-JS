function Main(input) {
    input = input.split("\n").map(x => parseInt(x));
  	console.log(6-input[0]-input[1]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));