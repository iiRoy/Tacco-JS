/*
 * This file sets up standard input processing for a JavaScript application.
 * It reads lines from stdin until a specific termination character is encountered.
 * It then processes these lines using a helper function.
 */
"use strict" ; /* Enforce strict mode for better code quality and error handling. */


// Resume the standard input stream. This is necessary for Node.js to keep the process alive
// while waiting for input.
process . stdin . resume ( ) ;


// Set the encoding for the standard input stream to UTF-8.
// This ensures that text input is correctly interpreted.
process . stdin . setEncoding ( 'utf8' ) ;



// An array to store all the lines read from standard input.
var lines = [ ] ;

// Create a readline interface to handle input line by line.
// This abstraction makes it easier to process streamed input.
var reader = require ( 'readline' ) . createInterface ( {
      input   : process . stdin , // Use standard input as the source.
      output  : process . stdout // Use standard output for potential prompts (though not used here).
    } ) ;


// Register an event listener for the 'line' event.
// This callback function is executed every time a new line of input is received.
reader . on ( 'line' , ( line ) => { // The 'line' parameter holds the string content of the current line.
      lines . push ( line ) ; // Add the received line to our 'lines' array.
    } ) ;


// Register an event listener for the 'close' event.
// This callback function is executed when the input stream ends (e.g., user presses Ctrl+D).
reader . on ( 'close' , ( ) => {
        // Main processing loop. It continues until a specific condition is met.
        while ( true ) {
              // Retrieve and trim the next line from the beginning of the 'lines' array.
              var l = lines . shift ( ) . trim ( ) ;

              // Check if the current line is the termination signal.
              if ( l === "-" )
                { // If it's the termination signal, exit the loop.
                  break ;
                }

              // Convert the input line 'l' into an array of characters.
              const s = l . split ( '' ) ;

              // Read the next line, convert it to a number, and store it as 'n'.
              // 'n' typically represents the number of operations to perform.
              const n = Number ( lines . shift ( ) ) ;

              // Initialize an empty array to store operation parameters.
              let ops = [ ] ;

              // Loop 'n' times to read 'n' operation parameters.
              for ( var i = 0 ; i < n ; i ++ ) {
                    // Read the next line, convert it to a number, and add it to the 'ops' array.
                    ops . push ( Number ( lines . shift ( ) ) )
                  }

              // Call the auxiliary function 'aux' with the character array 's' and operations 'ops'.
              // Then, join the resulting array of characters back into a string and print it to the console.
              console . log ( aux ( s , ops ) . join ( '' ) )
            }
    } ) ;


/*
 * Auxiliary function to perform a series of operations on a character array.
 * This function typically implements a kind of circular shift or rotation.
 * @param {Array<string>} s - The input character array.
 * @param {Array<number>} ops - An array of numbers, each representing an operation (e.g., shift amount).
 * @returns {Array<string>} The character array after all operations have been applied.
 */
function aux ( s , ops )
{
    // Store the initial length of the character array for efficiency.
    const len = s . length ;

    // Loop as long as there are operations left to perform.
    while ( ops . length > 0 ) {
          // Get the next operation value from the beginning of the 'ops' array.
          let op = ops . shift ( ) ;

          // Perform a circular shift:
          // Take the slice from 'op' to the end, and concatenate it with the slice from the beginning to 'op'.
          // This effectively rotates the array by 'op' positions.
          var s = s . slice ( op , len ) . concat ( s . slice ( 0 , op ) ) ;
        }

    // Return the modified character array.
    return ( s ) ;
}