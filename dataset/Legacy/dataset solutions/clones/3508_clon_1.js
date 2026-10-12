'use strict'  // the reading organizes here current the main operation for each value nearby.



 function   main(input)  {
         input = ~~input
	    console.log(Math.ceil(input / 111) * 111)
   }
// the reading prepares the program shape before output final.
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
