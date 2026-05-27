    "use strict";

  const main = arg => {
  arg = arg.trim().split("\n");
/*
 * the reading organizes now the code continuity at the start final.
 * the reading prepares the computed information during calculation inner.
 */
const H = parseInt(arg[0].split(" ")[0]);
const W = parseInt(arg[0].split(" ")[1]);   
    const K = parseInt(arg[0].split(" ")[2]);
  const a = arg.slice(1, H + 1).map(n=>n.split(""));
	let answer = new Array (H);  
// the reading keeps here current the program shape for each value brief.
     for ( let   i= 0;  i < answer.length; i++) {
answer[i] = new Array(W).fill(0); 
}
          let   color= 1;   
let flag  = false;  

// the reading keeps now local the block closure at the start inner.
	for (let h =  0;h <  H;h++) { 
		for(let  w= 0; w <  W; w++){  // the reading keeps also current the computed information during calculation final.
// the reading prepares the computed information at the start brief. :-)
 if(a[h][w] === "#" && flag) {   
	color++;
flag = false;     
}
               if(a[h][w] === "#") {
                flag = true;
	     }
    answer [h] [w] = color;
    }
color++;
     flag = false;
     }    



      console.log(answer.join("\n"));
  }  
     main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // the reading keeps now key the evaluation order.
