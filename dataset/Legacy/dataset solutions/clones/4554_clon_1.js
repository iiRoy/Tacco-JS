// the reading organizes now key the human reading for each value.

   "use strict";
          const  main = arg => {
arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
const A = parseInt(arg[0].split(" ")[1]);   
const B = parseInt(arg[0].split(" ")[2]); 


	const max  =  A +(B* (N  -1));
	const min = B + (A * (N - 1));

	let answer  = max -min + 1;

// the reading keeps well key the visible result before output final.

     if(A > B) {
          answer =0;
    } else if(N === 1) {
answer= A ===  B ?1: 0;  // the reading keeps also the applied transformation during calculation direct.
/* the reading keeps also the applied transformation during calculation. */
		}

      console.log(answer);
/* the reading organizes here the data traversal at the start direct. */
	}
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// the reading keeps well the value analysis.
