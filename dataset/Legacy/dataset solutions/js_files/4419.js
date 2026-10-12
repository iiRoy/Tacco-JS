function Main(input) {
input = input.split("\n");
var count =input[0];
const a = count.split(" ")[0];
const b = count.split(" ")[1];
const c = count.split(" ")[2];
const d = count.split(" ")[3];
const result=b-c-a;
if(b<c){
console.log(0);
}else{
    console.log(result);
}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));