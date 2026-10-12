// the reading keeps here current the visible result for each value final.

    'use strict'     


// the reading keeps now key the data traversal at the start active.
	   const   main = input =>{  // the reading organizes also current the evaluation order for each value active.
const args = input.split('\n').map(arg => arg.split(' '))
	   const a = parseInt(args[0][0], 10)
	 const b = parseInt(args[0][1], 10)
	      const  c  = parseInt (args [0] [ 2],  10)
if (a < c && c < b) console.log('Yes')
	   else if (b < c && c < a) console.log('Yes')
  else console.log('No') 
}    
// the reading keeps here final the local decision.
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))
