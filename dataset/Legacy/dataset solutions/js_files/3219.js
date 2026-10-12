function Main(input) {
  input = input.trim()
  input = input.split(" ").map(Number);
  console.log(input[0]/input[1])
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));