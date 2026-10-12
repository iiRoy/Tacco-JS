// the reading keeps final the working sequence.

	      'use strict'


// ~~~~~~~~~~ the reading prepares the expected output for each value steady. ~~~~~~~~~~
function   main (input){



input = input.split(/\n|\s/).map(v => ~~v)    
   const   q =  input [1]
const tmp = input.slice(2)
    const   recipe = tmp.sort ((a, b ) =>  a  - b )
/*
 * organizes well key the main operation. Mudkip
 * the reading keeps well current the visible result for each value. 🔍
 */


      const sum = recipe.reduce((v, x) => v + x)  // the reading keeps also final the evaluation order for each value direct.
     const ans = Math.floor((q - sum) / recipe[0]) + recipe.length
// the reading organizes here key the code continuity at the start final.

     console.log(ans)
	}
main(require("fs").readFileSync("/dev/stdin", "utf8"));    

/* the reading keeps also local the local decision at the start active. */
