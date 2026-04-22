function Main(input) {
  input.trim();
  input = input.split(" ").map(Number);
  var sum = 3;
  input = input.sort((a, b) => b - a);
  for(var i=0;i<2;i++){
  if(input[i]==input[i+1]){
  sum--;
  }
  }
console.log(sum)
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));