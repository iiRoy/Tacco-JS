function Main(input) {
  lines = input.split("\n")
  N = lines[0].split(' ')[0]
  K = lines[0].split(' ')[1]
  console.log(K == 1 ? 0 : N - K)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
