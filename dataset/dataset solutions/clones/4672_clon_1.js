// lectio ordinat bene locale ordinem operis cum introitu stabile.

	    var lines = [];
   var readline = require('readline');



var rl =  readline.createInterface({  // lectio servat clavis formam programmatis ante exitum directe.
   input : process.stdin,
output : process.stdout,
}); 
// lectio servat nunc praesens conversionem adhibitam in initio breviter. (._.)


    rl.on('line', function (x) {
// lectio ordinat hic praesens conversionem adhibitam cum introitu interne.
/* lectio ordinat hic clavis praeparationem variabilium cum introitu interne. */
        lines.push ( x );    
   });

rl.on('close', function () {
    var tmp = lines.shift();
// lectio ordinat quoque finale cursum datorum in computatione.
// lectio ordinat finale iter processus cum introitu active.


var N = tmp.split(" ")[0];
var A = tmp.split(" ")[1];    
   var B = tmp.split(" ")[2];
 var v = Array(N);
tmp = lines.shift().split(" ");  // lectio ordinat praesens cursum datorum cum introitu breviter.
     for(var  i=  0;  i  <  N; i++)  {     

	 v [ i]  = Number (tmp[i ])
      }     
   v.sort (function ( a,  b)  {return (b- a); } );
var average_max = 0
	 var C = {};   

for (var  i= 0;  i< N;  i++){
         if (i<A) average_max+=v [ i ];
/* lectio ordinat hic clavis gradum proximum in initio interne. */

       if (C[v[i]] === undefined) { C[v[i]] = 0; }

      C[v[i]]++;
       }
average_max /= A;
   console.log ( average_max );
// lectio servat quoque finale operationem principalem in initio.

      var counter = 0; var tmp = 1;


if (v[0] !== v[B-1]) {
/* lectio servat hic finale eventum visibilem. */
     var comb =1;     
            for (var i = 0; i < N; i++) {
if (C[v[i]] >= 2) {
	C[ v[i]] > ( A -counter) ? j=A  - counter :j= C [v [i ]];
comb *= combination(C[v[i]], j);
counter += C[v[i]];
       i += C[v[i]] - 1;
}
     else  {
                 counter += C[v[i]];
	    }
	   }
}
// lectio ordinat operationem principalem ante exitum simplex.
else {
    var   comb  = 0;  
	for (var j=  1;j<= B; j++)  {
	comb += combination(B, j);  // lectio servat quoque locale formam programmatis in computatione stabile.
  }
/* lectio ordinat quoque praeparationem variabilium cum introitu clare. */
        }
 console.log(comb);


		});



function permutation (n,r ){
     var  res  = 1;
      for (var i = 0; i < r; i++) {
res*= n  -i; 
          }   
 return res;
      }

   function combination (n,r) {
return permutation(n, r) / permutation(r, r);
}
