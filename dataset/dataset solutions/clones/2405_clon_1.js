/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This version includes extensive whitespace and comments
 * to demonstrate visual differentiation while maintaining
 * logical and structural equivalence.
 */
"use strict"; // Enforces strict mode for cleaner, safer JavaScript code.


const main =   arg => { // The primary function that processes the input argument.


  arg  =  arg.trim() . split( "\n" ) ; // First, remove leading/trailing whitespace, then split the input string by newline characters into an array.


  const   X   =   parseInt( arg[0] .split(" ")[0] ) ; // Parse the first number from the first line of the input. This is our 'X' value.


  const   Y   =   parseInt( arg[0] .split(" ")[1] ) ; // Parse the second number from the first line of the input. This is our 'Y' value.


  let answer = 0; // Initialize a variable to accumulate the final answer. It starts at zero.


  // --- Evaluate conditions for variable X and add points accordingly ---

  if ( X  ===  1 ) { // If X has a value of 1...
    answer += 30000; // ...add 30,000 to the total answer.
  }

  if ( X  ===  2 ) { // If X has a value of 2...
    answer += 20000; // ...add 20,000 to the total answer.
  }

  if ( X  ===  3 ) { // If X has a value of 3...
    answer += 10000; // ...add 10,000 to the total answer.
  }


  // --- Evaluate conditions for variable Y and add points accordingly ---

  if ( Y  ===  1 ) { // If Y has a value of 1...
    answer += 30000; // ...add 30,000 to the total answer.
  }

  if ( Y  ===  2 ) { // If Y has a value of 2...
    answer += 20000; // ...add 20,000 to the total answer.
  }

  if ( Y  ===  3 ) { // If Y has a value of 3...
    answer += 10000; // ...add 10,000 to the total answer.
  }


  // --- Check for a special bonus condition based on both X and Y ---

  if ( X  ===  1  &&  Y  ===  1 ) { // If both X is 1 AND Y is 1 simultaneously...
    answer += 40000; // ...a significant bonus of 40,000 is added to the answer.
  }


  console.log( answer ) ; // Finally, print the computed 'answer' to the console (standard output).

} // End of the main function definition.


// This line executes the 'main' function immediately.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// and passes it as the 'arg' parameter to the 'main' function.
main( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;