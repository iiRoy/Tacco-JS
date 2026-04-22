/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variables, and expressions remain identical.
 * Only whitespace and comments have been altered significantly.
 * This file processes a single numeric input to determine an output.
 */

"use strict" ;

// Define the main function that encapsulates the core logic.
function   Main ( input )
{

  // Calculate the 'num' part by dividing the input by 100 and taking the floor.
  let   num   =   Math . floor ( input   /   100 ) ;

  // Calculate the 'rest' part as the remainder when input is divided by 100.
  let   rest   =   input   %   100 ; // This is the remainder after division by 100.

  // The '5' here likely represents some maximum value or a scaling factor
  // related to the problem's constraints or specific logic.
  // It could be the maximum value a "rest" unit can contribute.
  if   ( rest   <=   num   *   5 )
  {
  	console . log ( 1 ) ; // Output 1 if the condition is met.
  }
  else   /* if (rest > num * 5) */
  {
    console . log ( 0 ) ; // Otherwise, output 0.
  }

}

// The following line reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ; // Execute the main logic.