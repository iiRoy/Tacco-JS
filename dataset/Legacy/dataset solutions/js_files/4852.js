function Main(input) {
  var arr = input.split(" ").map(Number);
  var a = arr[0], b = arr[1];
  console.log(a*b/(a+b));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));