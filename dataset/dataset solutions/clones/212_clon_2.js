/*
 * This module processes input data to calculate the number of trailing zeros
 * in the factorial of various integers provided as input.
 * It's structured as an Immediately Invoked Function Expression (IIFE).
 */
( function ( ) {
  // Global buffer to accumulate incoming standard input data.
  var dataBuffer = "";

  /**
   * Orchestrates the primary data processing flow.
   * It iterates through lines of input, parses numbers, and
   * invokes a helper function to determine trailing zeros.
   */
  function processData ( ) {
    // Declare variables for loop control and storing intermediate results.
    var lineCount,    // Stores the effective number of data lines to process.
        idx,          // Loop counter for iterating through input lines.
        currentVal,   // The integer value parsed from the current input line.
        resultVal;    // The calculated number of trailing zeros for currentVal.

    // Loop through each line of the buffered input, excluding the last empty line often
    // resulting from split('\n') if the input ends with a newline.
    for ( idx = 0, lineCount = dataBuffer.length - 1;   idx < lineCount;   idx += 1 ) {
      // Convert the current input line string to an integer base 10.
      currentVal = Number.parseInt( dataBuffer[idx], 10 );

      // A value of 0 indicates the termination of input sequence.
      if ( currentVal === 0 ) {
        break; // Exit the loop if a zero is encountered.
      } else {
        // Calculate the number of trailing zeros for the non-zero input.
        resultVal = calculateTrailingZeros( currentVal );
        // Output the computed result to the console.
        console.log( resultVal );
      }
    }
  }

  /**
   * Computes the number of trailing zeros in the factorial of a given number.
   * This is based on Legendre's formula, which counts factors of 5.
   *
   * @param {number} numberToAnalyze - The integer for which to calculate trailing zeros.
   * @returns {number} The count of trailing zeros in (numberToAnalyze!).
   */
  function calculateTrailingZeros ( numberToAnalyze ) {
    var divisorIter,    // Iterator for successive divisions by 5.
        trailingZeroes = 0; // Accumulator for the total count of zeros.

    // Loop continues as long as the current divisorIter, when divided by 5,
    // yields a positive integer (meaning there are still factors of 5 to count).
    for ( divisorIter = numberToAnalyze;   divisorIter / 5 > 0;   divisorIter = divisorIter / 5 ) {
      // Add the floor of (divisorIter / 5) to the total count.
      // This accounts for factors of 5, 25, 125, etc.
      trailingZeroes += Math.floor( divisorIter / 5 );
    }

    return trailingZeroes; // Return the final tally of trailing zeros.
  }

  // --- Standard Input Handling Setup ---

  // Resume the standard input stream to listen for data.
  process.stdin . resume ( ) ;
  // Set the encoding for the incoming data chunks.
  process.stdin.setEncoding( "utf8" );

  // Register an event listener for 'data' events on the standard input.
  // Each time a chunk of data arrives, append it to our buffer.
  process.stdin.on( "data", function ( incomingChunk ) {
    dataBuffer += incomingChunk ;
  } );

  // Register an event listener for the 'end' event on the standard input.
  // This signifies that all input has been received.
  process.stdin.on( "end", function ( ) {
    // Split the accumulated data into an array of lines using the newline character.
    dataBuffer = dataBuffer.split( "\n" ) ;
    // Once all data is ready, initiate the main processing logic.
    processData( ) ;
  } ) ;

} ) ( ); // Immediately invoke the function.