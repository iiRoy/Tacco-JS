var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var arr = input.trim().split("\n");
var [n,a,b,c,d]=arr.shift().split(" ").map(Number);

var min = Infinity;
for(var i=0;i<=1000;i++){
for(var j=0;j<=1000;j++){
   if(a*i+c*j>=n)min=Math.min(min,b*i+d*j);
}
}
console.log(min);
