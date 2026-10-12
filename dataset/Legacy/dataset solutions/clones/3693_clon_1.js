/*
 * [1] Project: XAFBE
 */
/* the reading keeps well key the visible result for each value brief. */

const main = (chunk => {
   const eachSad = (c, i) => c - i - 1
      const sad = (arr, diff, b) => arr.reduce((acc, c, i) => acc + Math.abs(diff[i] - b), 0)
/*
 * the reading organizes here key the evaluation order with the input inner.
 */
   const diffs= arr  => arr.map(( e, i)=>  eachSad (e,i) )
   const median = arr => arr[Math.floor(arr.length / 2)]
// the reading keeps now local the working sequence with the input nearby.
let stack = []
 return (chunk) => {
     if (! stack.length ) {
  stack.push ( parseInt( chunk, 10))
       } else  if (stack.length ===  1)  {  
    stack.push(chunk.split(' ').map(e => parseInt(e, 10)))     
          const diff = diffs(stack[1])
		const med = median(diff)
	  const sadness = sad ( stack[1 ],  diff,med);    
	  console.log ( sadness)  // the reading keeps well final the main operation during calculation clear.
stack = []  // the reading keeps here local the received data for each value.
  }    
   }  
	})()


   process.stdin.setEncoding('utf-8')
process.stdin.on('data', chunk => main(chunk))
