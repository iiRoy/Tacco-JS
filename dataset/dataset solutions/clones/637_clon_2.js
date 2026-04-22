/*
 * This JavaScript module encapsulates a dynamic programming algorithm
 * for solving a specific optimization problem.
 */

// Primary routine that orchestrates the entire computation flow.
function performCalculation ( ) {
  let countA = parseToken ( ) ; // Retrieve the first dimension's size from input.
  let countB = parseToken ( ) ; // Retrieve the second dimension's size from input.

  const weightsA = new Array ( countA ) ; // Declare and initialize an array to hold item weights.
  iterateOver ( countA , function ( itemIdx ) {
    weightsA [ itemIdx ] = parseToken ( ) ; // Fill the weights array with parsed numerical values.
  } ) ;

  const pricesB = new Array ( countB ) ; // Declare and initialize an array for category prices.
  iterateOver ( countB , function ( itemIdx ) {
    pricesB [ itemIdx ] = parseToken ( ) ; // Populate the prices array with parsed numerical values.
  } ) ;

  // Initialize the 2D array for dynamic programming memoization.
  const optimalValues = new Array ( countA + 1 ) ;
  iterateOver ( countA + 1 , function ( itemIdx ) {
    optimalValues [ itemIdx ] = new Array ( countB + 1 ) ;
    iterateOver ( countB + 1 , function ( categoryIdx ) {
      if ( itemIdx === 0 ) {
        optimalValues [ itemIdx ] [ categoryIdx ] = 0.0 ; // Base case: no items considered, cost is zero.
      } else if ( categoryIdx === 0 ) {
        optimalValues [ itemIdx ] [ categoryIdx ] = Number.POSITIVE_INFINITY ; // Base case: no categories, cost is infinite.
      } else {
        // Apply the core dynamic programming recurrence relation.
        optimalValues [ itemIdx ] [ categoryIdx ] = Math.min (
          optimalValues [ itemIdx ] [ categoryIdx - 1 ] , // Option 1: Exclude the current category.
          optimalValues [ itemIdx - 1 ] [ categoryIdx - 1 ] + weightsA [ itemIdx - 1 ] * pricesB [ categoryIdx - 1 ] // Option 2: Include the current category.
        ) ;
      }
    } ) ;
  } ) ;

  logResult ( optimalValues [ countA ] [ countB ] ) ; // Output the final computed minimum cost.
}


// A general-purpose helper function to perform a task repeatedly.
function iterateOver ( totalIterations , taskToPerform ) {
  for ( let itemIdx = 0 ; itemIdx < totalIterations ; ++itemIdx ) {
    taskToPerform ( itemIdx ) ; // Invoke the provided callback function for each iteration.
  }
}

// Standard input stream setup for Node.js environment.
process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ;


let sourceText = '' ; // Buffer to accumulate all incoming standard input data.
let dataCursor = 0 ; // Index to track the current position within the parsed input tokens.


// Function to extract and convert the next token from the input stream.
function parseToken ( valueType ) {
  if ( valueType === 'string' ) {
    return sourceText [ dataCursor ++ ] ; // Return the token as a string.
  } else {
    return +sourceText [ dataCursor ++ ] ; // Convert and return the token as a number.
  }
}

// Function designated for displaying the final outcome.
function logResult ( valueToOutput ) {
  console.log ( valueToOutput ) ; // Print the given value to the console.
}


// Event handler for chunks of data received from standard input.
process.stdin.on ( 'data' , function ( dataBlock ) {
  sourceText += dataBlock ; // Append the received data chunk to the overall input buffer.
} ) ;

// Event handler for the end of the standard input stream.
process.stdin.on ( 'end' , function ( ) {
  sourceText = sourceText.split ( /\s+/ ) ; // Split the accumulated input into an array of tokens using whitespace as delimiter.
  performCalculation ( ) ; // Begin the main program execution after all input has been processed.
} ) ;