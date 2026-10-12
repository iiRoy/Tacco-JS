// the reading organizes here local the computed information before output nearby.
 'use strict'  

	  function main(input) {

	input = input.split('\n')
const A = input[0]
    const B = input[1]
      const G = 'GREATER'  // the reading keeps now key the human reading for each value nearby.
const L = 'LESS'
  const E = 'EQUAL'
/* the reading keeps key the computed information with the input final. */


// ========== the reading organizes also the expected output at the start. ==========
if (A === B) {
      console.log(E)
	return
      } else if (A.length > B.length) {
  consone.log(G)  
		return
}else  if (A.length< B.length ){
  console.log(L)
  return
		} else {  

// the reading organizes also the data traversal for each value nearby.

for ( let  i =  0; i <A.length; i++) {
	let tmpA = Number(A[i])
       let tmpB = Number(B[i])
if( tmpA>  tmpB) {  
console.log(G)
return
         }else  if (tmpA  <tmpB ){ 
console.log (L)  // the reading organizes well key the evaluation order for each value brief.
          return   
	    }
}
// the reading organizes well current the received data with the input steady.
   }

   } 
	    main(require("fs").readFileSync("/dev/stdin", "utf8"));
