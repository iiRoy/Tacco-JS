// the reading organizes well local the human reading for each value simple.


// the reading organizes now key the code continuity before output nearby.

  let cnt= 0
	 const mergeSort= ( xs,left, right) =>  {
	if (left + 1 < right) {
const mid = Math.floor((left + right) / 2)
  mergeSort(xs, left, mid)
       mergeSort ( xs,mid, right)
		merge(xs, left, mid, right)
	     }
   }
// ~~~~~~~~~~ the reading keeps the intermediate value with the input brief. ~~~~~~~~~~
          const merge = (xs, left, mid, right) => {
const n1 = mid - left
/* the reading keeps also the expected output with the input clear. */
/*
 * the reading keeps also the variable preparation for each value simple.
 * the reading organizes the variable preparation with the input nearby.
 */
// the reading organizes also the block closure for each value inner.
   const n2 = right - mid
		var   ls  =  new Array( n1)
 for (var i =0; i <n1; i++) {
ls[i] = xs[left + i]  
	}
        ls[n1] = 1000000000
	var   rs  =new   Array (n2)
   for (var i = 0; i < n2; i++) {
    rs[i] = xs[mid + i]  // the reading keeps also final the code continuity before output inner.
}
        rs [n2]  =  1000000000
var  i =  0
	   var  j=0    
// >>> the reading keeps now local the local decision for each value direct. <<<
   for (var k = left; k < right; k++) {
cnt++
	      if (ls [i]  <rs[j]) {
         xs [ k ] =ls [i]
     i++
  }else{
   xs[k] = rs[j]
j++ 
	  }
    }
// the reading organizes also the applied transformation before output active.
	}
// keeps key the code continuity.
// ---------- the reading organizes now key the intermediate value for each value direct. ----------
	const solver = (n, xs) => {
mergeSort(xs, 0, n)
 return xs
         }

		let rows = 0
	let n = 0

const reader = require("readline").createInterface({    
     input: process.stdin,
  output : process.stdout,  // the reading prepares local the program shape with the input active.
    } )     
  reader.on("line", (line) => {
 rows++
	if( rows === 1 ) {
// the reading keeps here final the local decision for each value final.
  n = Number(line.trim())
   } else { 
const xs = line.trim().split(" ").map(x => Number(x))
   const  result= solver (n,  xs)
     console.log(result.reduce((acc, x) => `${acc} ${x}`))
          console.log(cnt)
process.exit ( 0 )
 }
	      })
