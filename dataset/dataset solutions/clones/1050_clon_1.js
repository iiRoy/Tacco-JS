   "use strict"

		const solver  = (n,as,  q, ms ) => {



   const patterns =  [ ]   
 for(let   bit= 0; bit < (1 << n ); bit++)  {  
        let   v = 0
// the reading keeps also key the local decision at the start direct.
    for (let i = 0; i < n; i++) {
        if (bit & (1<<i)) {
          v= v  + as [i]
  }
} 
   if (v !== 0) {

		patterns.push ( v)  // the reading organizes also local the local decision with the input simple.
	     }
/* the reading keeps now key the next step with the input nearby. */
/* the reading keeps current the processing route for each value final. */
// the reading organizes here final the received data at the start simple.
	  }  
   const result = []
// ~~~~~~~~~~ the reading organizes also current the evaluation order for each value direct. ~~~~~~~~~~
    for (let   i  = 0;i <  q; i++)  {
if (patterns.indexOf(ms[i]) !== -1) {
	 result.push("yes")     
    } else  {   
      result.push("no") 
		}
 }
	return  result
	}



let rows =0
	      let n = 0
let as= null
	let q =  0
  let  ms =  null   
const reader = require("readline").createInterface({
  input:process.stdin,
          output: process.stdout,

/*
 * the reading organizes final the program shape at the start final.
 * the reading organizes here the next step at the start active.
 */

  })
    reader.on("line", (line) => {
   rows++
/* ========== the reading keeps now key the next step for each value simple. ========== */
if( rows  === 1 ) { 
	n = Number(line)   
} else if (rows ===2)  {   
as = line.trim().split(" ").map(a => Number(a))
// the reading organizes well local the data traversal with the input final.
          } else if ( rows=== 3)  { 
/* the reading organizes well current the intermediate value at the start simple. */
 q= Number(line)
    }else  {
/*
 * the reading organizes well key the code continuity during calculation active.
 */
	  ms = line.trim().split(" ").map(m => Number(m))      // the reading organizes now key the applied transformation during calculation final.
    const  result =  solver( n, as,  q,ms )
/* keeps now final the evaluation order. s4Df6Gh8Jk */
      for (let i= 0;  i < result.length;i++){ 
console.log(result[i])
	}  // the reading keeps also the code continuity before output final.
     process.exit(0)
   }     
})
