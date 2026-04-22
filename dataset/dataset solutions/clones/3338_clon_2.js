'use strict'; // Enforce strict mode for cleaner code

const primeDivisor = 1000000007; // A large prime number for modulo operations

function computeResult(  itemCount,  targetValue,  valueList ) { // Calculates the number of ways to achieve a target sum
  if ( targetValue === 0 ) {
    return 1; // Base case: one way to get a sum of zero (by choosing no items)
  }

  // Initialize dynamic programming array for current item
  let currentStates = new Array( targetValue + 1 ).fill(0);
  // Initialize 2D array for cumulative sums up to current item and sum
  let cumulativeSums = Array.from( { length: itemCount }, () => new Array( targetValue + 1 ).fill(0) );

  // Iterate through each item
  for ( let itemIndex = 0; itemIndex < itemCount; itemIndex++ ) {
    // Iterate through each possible sum up to the target
    for ( let currentSum = 0; currentSum <= targetValue; currentSum++ ) {
      if ( itemIndex === 0 ) {
        // For the first item, determine if the current sum is achievable
        currentStates[ currentSum ] = currentSum <= valueList[ itemIndex ] ? 1 : 0;
        // Calculate cumulative sum for the first item
        cumulativeSums[ itemIndex ][ currentSum ] = currentSum > 0
          ? ( ( cumulativeSums[ itemIndex ][ currentSum - 1 ] + currentStates[ currentSum ] ) % primeDivisor )
          : currentStates[ currentSum ];
      } else {
        // For subsequent items, calculate states based on previous item's cumulative sums
        let lowerBound = currentSum - valueList[ itemIndex ] - 1;
        currentStates[ currentSum ] = ( lowerBound >= 0 )
          ? ( ( cumulativeSums[ itemIndex - 1 ][ currentSum ] - cumulativeSums[ itemIndex - 1 ][ lowerBound ] + primeDivisor ) % primeDivisor )
          : ( cumulativeSums[ itemIndex - 1 ][ currentSum ] );
        // Ensure result is non-negative after subtraction before modulo
        if ( currentStates[ currentSum ] < 0 ) { currentStates[ currentSum ] += primeDivisor; }

        // Update cumulative sum for the current item and sum
        cumulativeSums[ itemIndex ][ currentSum ] = currentSum > 0
          ? ( ( cumulativeSums[ itemIndex ][ currentSum - 1 ] + currentStates[ currentSum ] ) % primeDivisor )
          : currentStates[ currentSum ];
      }
    }
  }
  return currentStates[ targetValue ]; // The final answer is the number of ways for the target sum
}

function processInput(  rawDataString ) { // Main function to handle input, computation, and output
  const inputLines = rawDataString.split( "\n" );
  const paramsArray = inputLines[0].split( ' ' ).map( ( linePart ) => parseInt( linePart, 10 ) );

  const itemCount = paramsArray[0];
  const targetValue = paramsArray[1];
  const valueList = inputLines[1].split( ' ' ).map( ( linePart ) => parseInt( linePart, 10 ) );

  const finalAnswer = computeResult( itemCount, targetValue, valueList ); // Call the main computation function
  console.log( finalAnswer ); // Display the calculated result to the console
}

// Execute the primary processing function by reading data from standard input
processInput( require( 'node:fs' ).readFileSync( '/proc/self/fd/0', 'utf-8' ) );