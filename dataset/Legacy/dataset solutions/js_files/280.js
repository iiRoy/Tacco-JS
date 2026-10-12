var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var str=input.trim();
var arr=str.split(/\s|\.|\,/);
arr=arr.filter(function(v){return (v.length>=3 && v.length<=6)});
console.log(arr.join(" "));