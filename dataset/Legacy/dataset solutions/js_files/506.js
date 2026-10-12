var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n").map(Number);
var sum=0;
for(var i=0;i<10;i++){
sum+=Arr[i];
}
console.log(sum);