var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var vals = input.split(' ').map(function(n){return +n;});

var a = vals[0];
var b = vals[1];
var C = vals[2];

var h = b * Math.sin(C / 180 * Math.PI);
var S = a * h / 2;
var c2 = Math.pow(a, 2) + Math.pow(b, 2) - 2 * a * b * Math.cos(C / 180 * Math.PI);
var c = Math.sqrt(c2);

console.log(S.toFixed(5));
console.log((a + b + c).toFixed(5));
console.log(h.toFixed(5));