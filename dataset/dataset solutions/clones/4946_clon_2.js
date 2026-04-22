'use strict'

process.stdin.resume(); // Initialize the standard input stream for reading.

process.stdin.setEncoding('utf8'); // Define the character encoding for incoming data.

let inputBuffer = ''; // A string variable to collect all standard input.

process.stdin.on( 'data' ,
  function(dataFragment) {
    inputBuffer = inputBuffer + dataFragment; // Append each received data fragment to the buffer.
  }
); // Register a handler for incoming data events.

process.stdin.on( 'end' ,
  function() {
    const parsedElements = inputBuffer.split( /\s+/ ); // Divide the accumulated input by whitespace.

    console.log(
      calculateSumOfMinima(
        parsedElements.slice( 1, parsedElements.length - 1 )
          .map( strValue => parseInt( strValue ) )
      )
    ); // Extract numerical parts, convert to integers, and pass to the core processing function, then log the result.
    process.exit( 0 ); // Terminate the Node.js process successfully.
  }
); // Register a handler for the end of the input stream.


/**
 * Recursively processes a list of numbers to compute a specific sum.
 * The sum accumulates the first element of each list in the sequence,
 * and also all elements processed during the reduction step.
 *
 * @param {Array<number>} numericList - The initial array of integers.
 * @returns {number} The final calculated sum.
 */
function calculateSumOfMinima( numericList ) {
  let accumulatedSum = 0; // Variable to store the overall total.

  while ( numericList.length !== 0 ) {
    let reducedSequence = []; // A temporary array to hold the results of the current reduction.

    accumulatedSum += numericList[0]; // Add the first element of the current list to the total.

    numericList.reduce( ( previousVal, elementValue ) => {
      reducedSequence.push( Math.min( previousVal, elementValue ) ); // Add the minimum of the previous and current element to the new sequence.
      accumulatedSum += elementValue; // Add the current element's value to the grand total.
      return elementValue; // The current element becomes the 'previousVal' for the next iteration of reduce.
    }); // Perform a reduction operation on the current list.

    numericList = reducedSequence; // Replace the current list with the newly reduced sequence for the next iteration.
  }

  return accumulatedSum; // Return the final computed sum.
}