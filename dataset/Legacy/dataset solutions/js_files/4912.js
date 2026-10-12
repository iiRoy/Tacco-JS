function Main(input) {
  input = input.trim().split(" ");
  var N = parseInt(input[0], 10);
  var K = parseInt(input[1], 10);
 
  var sum = K;
 
  for (var i = 1; i < N; i++) {
    sum *= K - 1;
  }
 
  console.log(sum);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));