function Main(input) {
  input = input.trim()
  input = input.split(" ").map(Number);
  function compareFunc(a, b) {
  return a - b;
}
input.sort(compareFunc);
    console.log(input[0]*input[1]/2)
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));