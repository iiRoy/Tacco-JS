function calc(x1, y1, z1, w1, x2, y2, z2, w2){ 
   var a = x1 * x2;
   var i = x1 * y2;
   var j = x1 * z2;
   var k = x1 * w2;

   i += y1 * x2;
   a -= y1 * y2;
   k += y1 * z2;
   j -= y1 * w2;
             
   j += z1 * x2;
   k -= z1 * y2;
   a -= z1 * z2;
   i += z1 * w2;
             
   k += w1 * x2;
   j += w1 * y2;
   i -= w1 * z2;
   a -= w1 * w2;
return [a,i,j,k];
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var N=Arr.shift()-0;
for(var I=0;I<N;I++){
var A=Arr[I].split(" ").map(Number);
var ans=calc.apply(null,A);
console.log(ans.join(" "));
}