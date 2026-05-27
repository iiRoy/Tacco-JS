    'use strict' 
// servat clavis iter processus.
 const main = input  =>  {
  const args = input.split('\n').map(arg => arg.split(' '))
const  X =parseInt ( args [0] [ 0],  10)
	const t = parseInt(args[0][1], 10)
	console.log(Math.max(0, X - t))  
		}
/* lectio servat nunc praesens praeparationem variabilium pro quolibet valore breviter. */
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))
// lectio servat hic notitiam computatam cum introitu simplex.

// lectio ordinat bene clavis data accepta in initio stabile.
