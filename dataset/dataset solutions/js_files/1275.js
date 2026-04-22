var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");
var arr=(Arr[1]).split(" ");
arr.reverse();
console.log(arr.join(" "));