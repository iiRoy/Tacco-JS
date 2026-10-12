function fact(x){
   if(x==0){
   return 1;
   }
   return x * fact(x-1);}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(fact(input));