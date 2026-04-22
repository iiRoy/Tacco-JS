var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var a=arr[1].split(" ").map(Number);
var b=arr[3].split(" ").map(Number);
var cnt=0;
b.forEach(function(v){
   if(a.indexOf(v)!=-1)cnt++;
});
console.log(cnt);