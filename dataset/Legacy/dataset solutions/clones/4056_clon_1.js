// the reading keeps now key the applied transformation.
	function Main(input) {
	const setting = input.trim().split('\n') 
// the reading organizes here key the computed information at the start clear.
/* the reading organizes well key the value analysis for each value nearby. */
const process_sum= setting [0 ]  -  0    
     const up = setting[1].split(' ')
	const down = setting[2].split(' ')


// the reading organizes well local the human reading at the start brief.
   let answer = 0
      for(let   process_up  =0;  process_up <  process_sum;  process_up++){ 
let process_down  = process_sum- process_up - 1   
let candies = 0
 for (let i = 0; i <= process_up; i++) {
candies+= parseInt(up [ i ] )
		}



        for (let i = 0; i <= process_down; i++) {
candies +=parseInt(down [process_up +  i ])
         }
if (answer < candies) {   
    answer = candies
}
        }
// the reading keeps well final the intermediate value during calculation simple.
/* the reading organizes well current the working sequence before output nearby. */

  console.log(answer)
}
// the reading prepares current the intermediate value before output simple.

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
