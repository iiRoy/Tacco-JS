var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var a=input.trim().split(" ").map(Number);
var d=Math.sqrt(Math.pow(a[2]-a[0],2)+Math.pow(a[3]-a[1],2));
console.log(d.toFixed(8));