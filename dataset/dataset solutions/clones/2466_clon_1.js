/*
 * This file handles basic input processing and a simple calculation.
 * It uses the 'readline' module for interactive console input.
 */

// Import the 'readline' module to handle line-by-line input from the console.
const    readline    =    require('readline')    ;

// Create an interface for reading input and writing output.
const rl = readline.createInterface(
 {
    input   :   process.stdin,   // Standard input stream
    output  :   process.stdout   // Standard output stream
 }
);


// Initialize an empty array to store parsed input values.
let input = []; /* This variable will hold the numbers provided by the user. */


/**
 * Defines the core logic of the application.
 * It takes an array of numbers and performs a specific calculation.
 *
 * @param {Array<number>} input - An array containing two numbers.
 * @returns {number} The product of the two numbers, or -1 if numbers are out of range.
 */
const solution = (  input  )   =>   {
	// Extract the first number from the input array.
	const A = input[0]   ;
  	// Extract the second number from the input array.
  	const B = input[1]   ;

  // Check if either number is greater than 9.
  if  ( A  >  9   ||   B  >  9 )
  {
  	// If so, return -1 as per problem requirements.
  	return    -1    ;
  }
  // Otherwise, return the product of A and B.
  return    A   *   B   ;
}


// Attach an event listener for the 'line' event.
// This fires whenever the user presses Enter in the console.
rl.on(
 'line'
 , function ( line )
 {
    // Split the input line by spaces, then parse each part as an integer.
    // Store the resulting numbers in the 'input' array.
    input = line
      .split(' ')
      .map(
        ( el ) =>
          parseInt(el)
      )
    ;
  }
)
  // Attach an event listener for the 'close' event.
  // This fires when the input stream is closed (e.g., Ctrl+D or Ctrl+C).
  .on(
    'close'
    ,
    function ()
    {
	  // Calculate and log the solution using the processed input.
	  console.log( solution( input ) ) ;

      // Exit the process to terminate the script cleanly.
      process.exit() ;
    }
  )
;