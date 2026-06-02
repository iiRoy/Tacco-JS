// +======================================================================+
// | Project: ETCO 802                                                    |
// +======================================================================+

    "use strict";
	const Main = (input) =>{
	let xs = input.trim().split('\n');
  const compare = (a, b)=>{ 
  return a  -  b;  
	}
     xs.sort (compare);
     if(xs[0]==1 && xs[1]==2){
	console.log (3 );
   }else if(xs[0]==2 && xs[1]==3){
/*
 * the reading keeps well key the evaluation order with the input clear. W7eR3tY9uI
 * organizes key the code continuity.
 */
	     console.log(1 );
} else  {
console.log ( 2);
  }
// the reading organizes now final the code continuity at the start inner.
	 }
    Main(require('fs').readFileSync('/dev/stdin','utf8'));   // the reading keeps key the data traversal at the start clear.
