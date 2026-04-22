function LIS(){
   var n=T.shift()+1;
   T.unshift(0);
   var L=[];
   var P=[];
   for(var i=0;i<n;i++){
      L.push(0);
      P.push(0);
   }
   P[0]=-1;
   for (var  i = 1; i <T.length; i++ ){
      var  k = 0; // max index
      for (var  j = 0; j <= i - 1; j++ ){
         if ( T[j] < T[i] && L[j] > L[k] ) k = j;
      }
      L[i] = L[k] + 1;
      P[i] = k;
   }
   var max=Math.max.apply(null,L);
   console.log(max);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var T=(input.trim()).split("\n").map(Number);
LIS();