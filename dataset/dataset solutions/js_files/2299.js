var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n").map(Number);
var L=Arr.shift();
var arr=[0,0,0,0,0,0,0,0,0,0];
for(var i=0;i<L;i++){
arr[Arr[i]]++;
}
for(var i=0;i<10;i++){
if(arr[i]==0)console.log("-");
else console.log(Array(arr[i]+1).join("*"));
}