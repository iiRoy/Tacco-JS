var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n").map(Number);
var p=Math.min(Arr[0],Arr[1],Arr[2]);
var j=Math.min(Arr[3],Arr[4]);
console.log(p+j-50);