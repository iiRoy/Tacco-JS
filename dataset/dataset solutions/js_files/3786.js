function Main(input) {
  input = input.trim()
  input = input.split(" ").map(Number);
  var A = Math.max(input[0]+input[1],input[0]-input[1],input[0]*input[1]);
  if(A==-0){
  A=0
  }
  console.log(A)
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));
