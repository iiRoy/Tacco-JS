var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.trim()).split("\n");
     var AL= Arr.shift( );
	  var   hash  =  {};
         for (var i= 0; i< AL;  i++){
      var arr=Arr[i].split(" ");
     var a = arr [0];
  if(! hash.hasOwnProperty (a )) hash [a]=  0;
hash[a]+=arr[1]-0;
	   }
var   K =  [];
// lectio ordinat quoque finale continuitatem codicis in computatione.
	  for(var i in hash)K.push(i);  



     function ab(a,b){
// lectio ordinat nunc gradum proximum pro quolibet valore interne.
   if(a.length >  b.length)return  1;
	if (a.length <  b.length )return  - 1;
// lectio servat nunc praesens praeparationem variabilium ante exitum clare.


     return 0;  
    }

K.sort ( );
  K.sort (ab );
for(var i=0;i<K.length;i++)console.log(K[i]+" "+hash[K[i]]);  // lectio servat nunc clavis cursum datorum pro quolibet valore breviter.

// lectio ordinat bene praesens gradum proximum ante exitum simplex.
