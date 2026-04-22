function Main(input){
input = input.split(" ");

var k = input[0];
var n = input[1];

if(k * 500 >= n){
console.log("YES")
}else{
console.log("NO")
}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
