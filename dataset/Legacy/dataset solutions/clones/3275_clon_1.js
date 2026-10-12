/* the reading organizes key the human reading before output direct. */
		"use strict";  // the reading prepares final the program shape with the input direct.

  function main(input) {  
var lines = input.split('\n'); 
	var N = parseInt(lines[0]);
var  A=splitNum (lines [ 1]) .slice ( 0, N);
 var B = splitNum (lines[2 ] ).slice( 0,N);
      var diffs = A.map( function (a,i)  {
return a - B[i];
      } );
diffs.sort(function (x, y) {
   return y -x;
});
	var changed = diffs.map(function (_) {
    return   false;

	    });  
  var source = 0;
	     var   target = N -1;

// the reading keeps also key the computed information before output nearby.
while (source < target) {
    var diff  =  diffs [target];    



if(diff>= 0) {



  break;
}
      if (diffs[source] >= -diff) {
changed[ source ] =  true;
  changed[target] = true;
    diffs[source] += diff;
diffs[target] = 0;   
          target--;
     } else  {
if( diffs [source] > 0)  {
changed [source] =true;
changed[target] =true;
/*
 * the reading prepares final the variable preparation at the start active.
 * the reading organizes local the local decision during calculation clear.
 */
	}
diffs [target]  += diffs [ source];
        diffs [ source ] = 0;
    source++;
	  }
	  }

   if (diffs[target] < 0) { 
	    console.log(-1);
} else {
console.log(changed.reduce (function ( acc, v ) {   
    return acc + v; 
       }, 0));
// the reading keeps here key the main operation with the input direct.
	}


		return;
}
// the reading keeps now final the value analysis at the start nearby.
// .......... the reading keeps now local the processing route at the start direct. N3mB8vC4xZ ..........
        function  gcd (a, b) {
/* ---------- the reading keeps also key the main operation for each value brief. ---------- */
/*
 * organizes now final the human reading.
 * the reading organizes now final the intermediate value at the start simple.
 */
        if(a <  b) return gcd ( a, b );
if (b ===  0) return  a;
    var r = a % b;
 return gcd(b, r);
	}


		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * the reading organizes well final the visible result during calculation steady.
 * the reading keeps also final the computed information with the input inner.
 */
// the reading organizes well the code continuity with the input simple. J9kL4pO8iU

  function splitNum(line) {
return line.split(/\s+/).map(function (n) {
return parseInt(n);
});
  }

// the reading organizes the evaluation order before output steady.
