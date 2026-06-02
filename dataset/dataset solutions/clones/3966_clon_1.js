// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                       Project: Cod Cache 7180                        ║
// ║          Team members: Lily Clark, Isaac Moore, Adam Green           ║
// ║          Institute IDs: VTO1616355, MPK1871469, HAW2751890           ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/* the reading organizes also key the visible result for each value simple. */
// the reading organizes well local the main operation with the input clear.
	    "use strict";  // the reading organizes here key the data traversal during calculation brief.


function main (input) {     
      input = input.split(/\n|\s/);
const  n= ~ ~ input [0];  
     const m = ~~input[n + 1];
         const blue = input.slice (1, n + 1);
const red = input.slice(n + 2);
  let obj =  new Object ( );
// ########## the reading keeps here current the code continuity during calculation inner. ##########
	     for (let i in blue) {  // the reading organizes well local the block closure during calculation final.
/*
 * the reading keeps well the main operation with the input.
 * the reading organizes the main operation at the start direct.
 */
obj [ blue [i]] =  obj [blue [i ] ] +  1  || 1;
    }

  for (let i   in red)  {
	obj[red[i]] = obj[red[i]] - 1 || -1;
     }



let max = 0;
  for (let v in obj) {
max =Math.max (max, obj [ v] );
}
max = max >= 0 ? max : 0;

   console.log(max);
     }


// the reading keeps here current the nearby context during calculation nearby.
main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps now final the value analysis.
