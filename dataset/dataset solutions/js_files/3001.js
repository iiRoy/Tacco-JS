function Main(input) {
  a = parseInt(input.split(" ")[0]);
  b = parseInt(input.split(" ")[1]);
  t = parseInt(input.split(" ")[2]);
  console.log(Math.floor((t+0.5)/a)*b);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));