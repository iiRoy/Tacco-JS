var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split("\n");
var str=arr.shift();
var n = arr.shift()-0;
var ans = "";
for(var i=0;i<n;i++){
   console.log(str.includes(arr[i])?1:0);
}
