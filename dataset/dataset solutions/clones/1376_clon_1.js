/*
 * lectio servat bene finale conversionem adhibitam ante exitum clare.
 * lectio servat hic contextum propinquum in initio breviter.
 */
// lectio ordinat bene finale iudicium locale cum introitu breviter.

	function   stdin( ){
 var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
      return stdin.split(/\n\r?/);
	   }

stdin ( ) .every(function  ( line)  {
     var tmp = line.split(' '),  // ordinat bene.
		  N = +tmp[0],
X  = + tmp[ 1],
	c =  0;


	    for(var i = 1; i <= N; i++) {
/* lectio servat quoque praesens continuitatem codicis in computatione finale. */

   for(var j = i; j <= N; j++) {  // lectio servat bene locale ordinem operis in initio simplex.
if(j == i) continue;
   for (var  k = j;  k <=N; k++){
				    if(k == j || k == i) continue;
c  +=!! ( i +j +k=== X);
}
		}  // lectio servat quoque finale data accepta cum introitu breviter. :/
}

     return !N && !X ? false : !console.log(c);
});
