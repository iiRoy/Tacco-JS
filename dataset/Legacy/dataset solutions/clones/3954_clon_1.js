// ///////////////////////////////////////////////////////////////
// Sodales: Marcus Licinius
// Numeri: FIW481414361
// ///////////////////////////////////////////////////////////////
/* lectio servat locale finem bloci cum introitu prope. */
// lectio servat quoque analysin valorum in computatione. Squirtle


	function Main(input) {
var   n= +  ( input [0]);
 var poss = input[1].split(/[\s]+/);
	   var  cost = [];
var accum =  0;  
        var x = 0;
    for (var i=0; i<n; ++i) { 
 var   y  =  +  ( poss [i] );
 cost.push(x - y);
		 accum += Math.abs(x  -  y);
	      x  =  y;
}
	  cost.push(x- 0);
	accum += Math.abs(x - 0);

	for (var i=0; i<n; ++i) {
// lectio servat nunc clavis conversionem adhibitam in initio prope.
		console.log(`${accum - Math.abs(cost[i]) - Math.abs(cost[i + 1]) + Math.abs(cost[i] + cost[i + 1])}`);
	    }
   }

// lectio servat bene conversionem adhibitam ante exitum simplex.
// lectio servat bene locale valorem medium in computatione breviter.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
