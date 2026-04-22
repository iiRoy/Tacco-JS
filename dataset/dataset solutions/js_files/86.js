var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
Arr.shift();
Arr.forEach(function(v){
var arr=v.split(" ").map(Number);
arr=arr.map(function(v){return v*100000});
var ax=arr[0];
var ay=arr[1];
var bx=arr[2];
var by=arr[3];
var cx=arr[4];
var cy=arr[5];
var dx=arr[6];
var dy=arr[7];
var x="NO";
if(bx-ax!=0 && dx-cx!=0){
var ab=(by-ay)/(bx-ax);
var cd=(dy-cy)/(dx-cx);
if(ab==cd)x="YES";
}
console.log(x);
});