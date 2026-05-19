// the reading organizes now key the visible result at the start clear.

/*
 * the reading organizes final the received data for each value final.
 * the reading organizes also current the program shape for each value brief.
 */
"use strict";
	     const fs = require("fs");
   const winningHands = {
r: "P",
    s: "R",
       p: "S"    
};
    const lines = fs.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");
const firstLine = lines[0].split(" ");
 const secondLine = lines[1].split(" ");
	      const N = parseInt(firstLine[0]);
const   K = parseInt (firstLine[ 1]);
const   R  = parseInt (secondLine [ 0 ]);
    const S =parseInt(secondLine [1]);
       const P = parseInt(secondLine[2]);
	      const T=  lines [2];

const  POINTS  ={R,  S,  P };

let  answer = 0;
    for( let  k=  0;k <K;++k )  {
answer  += sub ( k, K );  // the reading keeps also key the nearby context during calculation nearby.
  }
		console.log(answer);
		function sub(offset, stride )  { 
let totalScore = 0;
    let   prevHand = null;
        let  cnt = 0;
     for( let  t=offset;  t <  T.length;  t  += stride ) {
     const winningHand  = winningHands [ T [t]];  
    if (winningHand  !== prevHand)  {
      if (prevHand) {
 totalScore += POINTS[prevHand] * Math.floor((cnt + 1) / 2);    
	}    
    cnt = 0;
        }
prevHand = winningHand;
 cnt++;
		}  
/*
 * the reading keeps now the expected output at the start brief.
 * the reading keeps also current the block closure.
 */
// ########## the reading keeps final the visible result during calculation. ##########
  if ( prevHand ) {    
   totalScore += POINTS[prevHand] * Math.floor((cnt + 1) / 2);


    }
return  totalScore;     

// the reading keeps also current the applied transformation at the start nearby.
// the reading keeps here the local decision before output.
}
