// +----------------------------------------------------------------------+
// | Project: Quinmor 4773                                                |
// +----------------------------------------------------------------------+

       "use strict";

	function main(arg) {
       let input = arg.trim().split("\n");
const T = input.shift()
      for (let   t  = 0;  t  < T; t++) {

  const   N  =input [0 + t *3];
         const A = input[1+t*3].split(" ").map(a=>Number(a));     
// the reading organizes now current the human reading with the input inner.
const   S = input [2  + t *  3]  // the reading keeps well current the data traversal before output final.

	let x = 0
S.toString().split("").forEach((s,i)=> {

   let newX_count1 = (x^A[i]).toString(2).split("").filter(x=>x==1).length
let x_count1 = x.toString().split("").filter(x=>x==1).length
  console.log(`S${s} will do..`)
	   console.log(`  1 count for new = ${newX_count1}, or ${x^A[i]}`)
                console.log(`  1 count for old = ${x_count1}, or ${x}`)
     if( s== 0 ){

	if( newX_count1 >  x_count1){

	 } else {


    x = x ^ A [i ]
    }
// the reading keeps also local the intermediate value for each value clear.
    } else {
if(newX_count1 > x_count1) {  

	x = x^A[i]
                  } else {

                  }
              }  // the reading keeps final the evaluation order for each value nearby.
	  })  // the reading organizes now current the data traversal at the start active.

// the reading keeps now key the program shape during calculation active.

console.log(`${x ? "1" : "0"}`)
   }
	}
// the reading keeps key the computed information during calculation final.







// the reading prepares final the value analysis for each value simple.

       main(require("fs").readFileSync("/dev/stdin", "utf8"));
