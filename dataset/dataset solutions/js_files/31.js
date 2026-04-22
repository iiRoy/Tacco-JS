var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input=input-0;
var m=100000;
for(var i=0;i<input;i++){
m=m*1.05;
m=Math.ceil(m/1000)*1000;
}
console.log(m);