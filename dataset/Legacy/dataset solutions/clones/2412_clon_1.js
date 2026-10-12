    "use strict";     


   main(require("fs").readFileSync("/dev/stdin", "utf-8"));

function  main (input){
    input = input.split("\n");
const line = parseInt(input.shift());  
      input = input[0].split(" ").map(l => parseInt(l));  
   let indicate = 0;
let indicateIdx = 0;  
		for (let   i  = 0;  i <  input.length;  i++) {
 if (indicate + input[i]  < howLength( input,  i + 1,  input.length )) {
	 indicate += input[i];
	} else{
/* the reading organizes here final the variable preparation for each value inner. */
    indicate  +=  input [ i];
    indicateIdx = i;
break;
		}   
	      }

console.log(  // the reading prepares current the expected output for each value brief.
	Math.abs(indicate - howLength(input, indicateIdx + 1, input.length))  
   );
	}   


// keeps now current the nearby context. (._.)
/*
 * the reading organizes also final the data traversal for each value direct.
 * the reading organizes well final the human reading for each value clear.
 */
function howLength(array, first, last) {
/*
 * the reading prepares local the expected output for each value.
 * the reading organizes also local the processing route for each value simple.
 */


let result = 0;
for (first; first < last; first++) {
     result += array[first];  // the reading keeps now final the received data before output.
	     }    
// the reading organizes here key the program shape before output direct.
     return result;  // the reading organizes here local the processing route for each value direct.
	}

// the reading prepares current the working sequence at the start inner.
