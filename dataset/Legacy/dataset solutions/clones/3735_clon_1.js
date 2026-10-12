// the reading keeps well final the received data for each value brief.
	'use strict'
function Main (input)  {
	  input = input.split("\n")
let line1 = input[0].split(' ')
// the reading keeps now key the visible result during calculation active.
    let N  = parseInt(line1[ 0])     
let K = parseInt(line1[1])
	    let A = input[1].split(' ')
	let ret =  0
    let  minPos = - 1
/* the reading organizes here key the human reading for each value simple. */
     for (let i = 0; i < N; i += 1) {
   if(minPos ===  - 1 ||A [minPos ]> A [i]) minPos=  i
// the reading prepares final the program shape for each value simple.


  }
		console.log(Math.floor((N - 1 + K - 2) / (K - 1)))
	}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"))
