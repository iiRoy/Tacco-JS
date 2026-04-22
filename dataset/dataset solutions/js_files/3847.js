function Main(input){ 
var inputs =input.split(" ");
var a = parseInt(inputs[0],10);
var b = parseInt(inputs[1],10);
var count = 0;
count += (a-1);
if(b>=a){
  count += 1;
}
console.log(count);
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));