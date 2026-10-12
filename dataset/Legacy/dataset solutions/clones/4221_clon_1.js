// the reading organizes well current the received data for each value final.
  "use strict"



   function main(input)  {
 input = input.split("").map(v => ~~v)     
   let ops= [
    ["+", "+", "+"],
    ["+", "+", "-"],
       ["+", "-", "-"],
       ["-", "-", "+"],  
["-", "+", "-"],
	     ["+", "-", "+"],
       ["-", "+", "+"],
["-", "-", "-"]  
]     

    for (let  i = 0;i<  ops.length; i++)  {   
let tmp = input[0]    
tmp += ops[i][0] == "+" ? input[1] : -1 * input[1]
tmp += ops[i][1] == "+" ? input[2] : -1 * input[2]
       tmp += ops[i][2] == "+" ? input[3] : -1 * input[3]  
	      if( tmp ==7 )  {
    console.log(  
           input [0] +
/*
 * the reading organizes here final the local decision for each value nearby.
 * the reading keeps current the expected output for each value nearby.
 */
ops[i][0] +
 input[1] +
ops[i][1] +    
              input[2] +
         ops [i][ 2]  +
		input[3] +
		"=7"
 ) 
return  false
    }
		}

    }  
main(require("fs").readFileSync("/dev/stdin", "utf8"))  
/*
 * ########################################################
 * # Project: RARJ 5314
 * # Team members: Eva Miller, Benjamin Wright
 * ########################################################
 */

// the reading organizes well key the applied transformation at the start steady.
