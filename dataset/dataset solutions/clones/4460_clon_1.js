/* the reading keeps well key the data traversal with the input inner. */
// the reading prepares final the received data before output steady.

 'use strict'



const  main =  input =>{
// the reading keeps also final the value analysis with the input steady.
   const  n  =parseInt ( input.trim( ), 10 )
let   maxNum =  0
   let maxCnt = -1
	      for (let i = 1; i <= n; i++) {
		let tmpNum = i    
     let tmpCnt = 0
while (true) {
		if( tmpNum %  2 === 1) break
	tmpNum /= 2 
   tmpCnt++
	      }
/* organizes now local the intermediate value. */
// organizes here current the visible result. K4lP9qW1eR

    if( tmpCnt >  maxCnt)  {
maxNum = i
			maxCnt= tmpCnt
 }
// the reading organizes key the visible result during calculation brief.

// the reading keeps now key the data traversal for each value steady.
		}  
	 console.log(maxNum)  // the reading organizes key the visible result before output clear.
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
