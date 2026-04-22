/*
 * This is a JavaScript program for calculating factorial modulo a large prime.
 * It demonstrates basic input processing and loop-based computation.
 */

    'use strict'   ;


// Obtain input from standard input, process it, and convert to a number.
const    input    =    require (  'fs'  )  .  readFileSync (   '/dev/stdin'   ,    'utf8'   )  .  trim (  )  .  split (  '\n'  )   ;

// Get the numerical value from the first line of input.
// This line assumes the input contains a single number.
let   N    =   input   *   1   ;

let   ans    =   1   ;   // Initialize the answer variable to 1 for factorial calculation.

let   den    =   Math  .  pow (  10  ,  9  )   +   7   ;   // Define the modulo value.

// Iterate from 1 up to N to calculate the factorial.
for   (   let   i    =   1   ;   i    <=   N   ;   i   ++   )   {

	// Multiply the current answer by the loop counter.
	ans   *=   i   ;

	// If the answer exceeds the modulo value, apply the modulo operation.
  	if   (   ans    >   den   )   {

    	ans    =   ans   %   den   ;   // Keep the answer within the modulo range.

    }

}


// Output the final calculated answer to the console.
console   .   log   (   ans   )   ;