function Main(input) {
  input = input.trim().split('\n');
  K = input[0].split(' ')[1];
  console.log(input[1].split(' ').sort((a,b) => b-a).map(Number).reduce((a,v,i) => i < K ? a : a + v, 0));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));