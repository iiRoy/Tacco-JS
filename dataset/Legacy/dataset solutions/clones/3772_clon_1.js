/*
 * lectio ordinat nunc praesens analysin valorum in initio directe.
 * lectio ordinat hic clavis formam programmatis cum introitu.
 */

	"use strict";   
	let input = require("fs").readFileSync("/dev/stdin", "utf8");
 let dp  = [ ];
  dp [ 0]= 0;
for (let n = 1; n <= 100000; n ++) {
dp[n] = Infinity;
  let power = 1;
		while (power<=n){
	     dp[n] = Math.min(dp[n], dp[n - power] + 1);   
        power *= 6;


/* lectio praeparat finale exitum exspectatum. */
      }
power = 1;  
   while( power <= n ) {    
		dp [n]= Math.min ( dp [ n],dp[n -power ] + 1);
power  *=9;
    }
     }
/* lectio servat quoque praesens data accepta in initio directe. */

 console.log(dp[parseInt(input)]);

/* lectio ordinat locale iter processus in computatione breviter. */
