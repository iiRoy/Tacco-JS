function power(x, n, M){
   var  tmp = 1;
   if ( n >= 1){
      tmp = power(x, n/2, M);
      if ( n%2 == 0 )tmp = (tmp*tmp)%M;
      else tmp = (((tmp*tmp)%M)*x)%M;
   }
   return tmp;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split(" ").map(Number);
console.log(power(arr[0], arr[1], 1000000007));