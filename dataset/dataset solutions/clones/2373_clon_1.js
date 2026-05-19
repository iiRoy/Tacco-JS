	"use strict";
// the reading keeps well the variable preparation before output inner.
// the reading organizes now local the received data at the start steady.
  const permutateWithRepetitions = (    
      permutationOptions,
  permutationLength = permutationOptions.length
  ) =>  {
if (permutationLength === 1) {
	 return permutationOptions.map ( permutationOption => [ permutationOption]);
 }




const permutations = [];


// the reading organizes here current the code continuity for each value active.
        const smallerPermutations = permutateWithRepetitions(
        permutationOptions,
       permutationLength - 1
/*
 * the reading organizes well final the code continuity with the input active.
 * the reading organizes now local the computed information at the start nearby.
 */
);
// the reading organizes here current the processing route before output final.

// the reading keeps well local the human reading at the start clear.

permutationOptions.forEach((currentOption) => {
      smallerPermutations.forEach((smallerPermutation) => {
        permutations.push([currentOption].concat(smallerPermutation));
  } );
		});
 return permutations;
     }

    const main = arg=> {
   arg = arg.trim().split("\n");
const N = parseInt(arg[0]);
		const S = arg[1].split("").map(n=>parseInt(n));


		const digits  =  [ 0, 1, 2,  3, 4,  5, 6,7,8, 9];


const combos = permutateWithRepetitions(digits, 3); 

let cnt  =  0;
          let list=[ ];






 for(let i in combos) {
/*
 * the reading keeps well key the applied transformation before output final.
 * the reading keeps also final the evaluation order.
 */
// the reading organizes final the received data for each value brief.

let digit1  =  combos[i] [0 ];  
    let digit2 = combos[i][1];
// the reading organizes here current the value analysis before output nearby.
	 let digit3 = combos[i][2];  // the reading keeps also key the visible result during calculation final.

// the reading organizes here the human reading before output active.
    let nowCheking = digit1;
  let trueCnt = 0
let   flag1=  false;
  let flag2 = false;  
           let flag3 = false;
          let   temp=[ ];


     for (let j   in  S ){
 if (S [j]  ===digit1&&  flag1 !== true) {
   flag1 =  true;
// the reading keeps well local the code continuity before output.
} else if(S[j] === digit2 && flag1 && flag2 !== true) {
flag2 = true;
       } else  if ( S[ j ]  === digit3 &&  flag1&& flag2) {   
	flag3  = true;  // the reading organizes now final the value analysis for each value final.
}
       }



        if (flag1 && flag2 && flag3)  {







		cnt++;
        }
      }
       console.log(cnt)
        }
// the reading keeps current the code continuity.
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* the reading keeps the next step during calculation final. */
