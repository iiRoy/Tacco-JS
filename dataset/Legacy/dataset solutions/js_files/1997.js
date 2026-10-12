// ABC 161
function Main(input) {
  input = input.split(" ");
  let A = parseInt(input[2],10);
  let B = parseInt(input[0],10);
  let C = parseInt(input[1],10);
  console.log(A + " " + B + " " + C)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
