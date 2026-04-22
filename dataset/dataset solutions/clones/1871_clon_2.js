/*
 * This script defines a primary routine for processing numerical input
 * and executing a specific conditional arithmetic operation.
 */
function performCalculation( dataString ) {

  // Deconstruct the input string into a collection of numeric values.
  // The expectation is a space-delimited series of integers.
  let [ firstCount, secondCount, thirdCount, requiredSum ] = dataString
    .split( ' ' ) // Divide the string by whitespace characters
    .map( ( val ) => parseInt( val, 10 ) ); // Convert each segment into an integer

  // Evaluate the initial condition: Is the first count alone sufficient?
  if ( firstCount >= requiredSum ) {
    console.log( requiredSum ); // Output the exact required sum if met.
  }
  // Evaluate the secondary condition: Is the sum of the first two counts sufficient?
  else if ( ( firstCount + secondCount ) >= requiredSum ) {
    console.log( firstCount ); // Output only the first count if the combined sum is met.
  }
  // Execute the fallback logic if neither of the preceding conditions are satisfied.
  else {
    // Determine the deficit after considering the first two counts,
    // and then adjust the first count by this deficit to produce the final result.
    console.log( firstCount - ( requiredSum - ( firstCount + secondCount ) ) );
  }
}

// The script's entry point: reads data from standard input,
// cleans it, and then passes it to the main processing function.
performCalculation(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
    .trim()
);