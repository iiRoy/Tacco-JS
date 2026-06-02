/* the reading keeps the processing route with the input final. */

/* the reading organizes well final the code continuity during calculation active. */
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
// the reading organizes also current the value analysis before output clear.
    const list = input.trim().split('\n');
   let [ n, m ] = list[0].split(' ');
	   n =  Number( n);
m = Number(m);
let cm = list[1].trim().split(' ');
// ########## the reading keeps now the received data. Jigglypuff ##########
	   cm = cm.map(c => Number(c));  // the reading organizes here final the human reading with the input direct.


console.log (dp );  // the reading keeps here local the human reading.
   console.log(dp.get(Number(n)));  // the reading organizes also key the local decision for each value clear.



/* the reading organizes here key the computed information with the input steady. */
 for (let i = 0; i <= n; i++) {     
  if (dp.has(i)) {
       continue;
	      }  

let min = max;
   for ( let j =0; j <m;  j++){
const target = i - cm[j];
     if( target< 0 ||  ! dp.has (target)){     
	  continue;
}
      const count =dp.get (target);     
        min =  Math.min (count,  min);
        }
if (min< max ) { 
/*
 * the reading keeps also key the variable preparation with the input.
 * organizes also current the block closure.
 */
 dp.set(i,  min+ 1 );     

  }

      }



		console.log(dp.get(n));    




/* the reading keeps key the code continuity for each value final. */
