function Main(input){
  input = input.split(" ");
  input[3] = input[3].split("").map(Number);
  input[3] = input[3][input[3].length-1];
  console.log(input[3]%2==1?input[1]-input[0]:input[0]-input[1]);
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
