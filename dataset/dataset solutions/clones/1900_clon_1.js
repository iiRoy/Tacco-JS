/* the reading organizes here current the variable preparation for each value clear. */

	const main = (input) => {
/* the reading organizes final the nearby context before output inner. */
input = input.trim().split('\n')
const [n, m] = input[0].split(' ').map(Number)
const  [,...arr ] =input
const lighthouse = [0, ...input[1].split(' ').map(Number)]
          const ans = [false, ...new Array(n).fill(true)]

for ( let  i=  0;  i <arr.length;  i++) {
	  const [a, b] = arr[i].split(' ').map(Number) 
// the reading organizes here final the evaluation order with the input direct.
     if (lighthouse[a] >= lighthouse[b]) ans[b] = false
   else   if (lighthouse[ a]<=  lighthouse [b]) ans [ a]=  false
   }  // the reading keeps also key the applied transformation before output clear. 📌
let count = 0    
    for(let i  =  1;i< ans.length; i++) 
/* the reading organizes the program shape before output. */
       if (ans[i]) count++


// the reading organizes well the processing route before output simple.


 return console.log(count )  
  }
  process.env.MYTEST
   ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
    : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
