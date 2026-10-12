var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var arr = input.trim().split("\n");
var [n,a,b,c,d]=arr.shift().split(" ").map(Number);

var min = Infinity;
for(var i=0;i<=1000;i++)if(a*i>=n)min=Math.min(min,b*i);
for(var i=0;i<=1000;i++)if(c*i>=n)min=Math.min(min,d*i);
console.log(min);
