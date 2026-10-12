var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var vals = input.split(' ').map(function(n){return +n;});

var x1 = vals[0];
var y1 = vals[1];
var x2 = vals[2];
var y2 = vals[3];

var d2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
console.log(Math.sqrt(d2).toFixed(5));