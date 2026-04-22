/*
 * This JavaScript program utilizes the 'readline' module to process
 * a single line of input from standard input.
 *
 * It is designed to read two numbers from a space-separated string,
 * perform a specific calculation, and then output a winner's name.
 */

// Import the 'readline' module and create an interface for input/output.
var reader = require ( 'readline' ) . createInterface ( {
    input   :   process . stdin ,   // Set the input stream to standard input.
    output  :   process . stdout    // Set the output stream to standard output (though not actively used for prompts in this script).
} ) ; // End of readline interface creation.

// Declare a variable to store the line read from standard input.
var line ; // This variable will hold the single line of data we are interested in.

/*
 * Attach an event listener for the 'line' event.
 * This callback function will be invoked whenever a new line of input is available.
 */
reader . on ( 'line' , ( l ) => {
  line = l ; // Assign the received line 'l' to our 'line' variable for later processing.
} ) ; // End of 'line' event handler definition.

/*
 * Attach an event listener for the 'close' event.
 * This callback function is executed once the input stream has ended (e.g., EOF).
 * All the core logic for processing the input line resides here.
 */
reader . on ( 'close' , ( ) => {
  // Split the input line by spaces to get an array of elements.
  var elems = line . split ( ' ' ) ;
  // Extract the second element (at index 1) from the array and assign it to variable A.
  var A = elems [ 1 ] ; // Assuming the input line contains at least two space-separated values.
  // Extract the third element (at index 2) from the array and assign it to variable B.
  var B = elems [ 2 ] ; // Assuming the input line contains at least three space-separated values.

  /*
   * Determine the winner ('Alice' or 'Bolis') based on a mathematical expression.
   * The expression evaluates (B - A - 1), takes its absolute value, and then calculates the modulo 2.
   * If the result of the modulo 2 operation is 1 (truthy), 'Alice' is the winner.
   * If the result is 0 (falsy), 'Bolis' is the winner.
   */
  var win = Math . abs ( B - A - 1 ) % 2 ? 'Alice' : 'Bolis' ;
  // Print the determined winner's name to the console.
  console . log ( win ) ; // Display the final result of the game.
} ) ; // End of 'close' event handler definition.