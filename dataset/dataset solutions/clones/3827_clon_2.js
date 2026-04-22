// This JavaScript program is designed to find the largest integer power within a specific numerical range.

function processInputData ( rawText ) {
  // Convert the incoming string data into an integer, removing any leading/trailing whitespace.
  const upperBound = parseInt( rawText.trim(), 10 );

  // Initialize a new Set to store all unique computed power values.
  // The value 1 is included by default, as it's a common base case for powers.
  let computedPowers = new Set( [ 1 ] );


  // Begin a nested loop structure to calculate powers.
  // The outer loop iterates through possible exponents, starting from 2 up to 10.
  for ( let currentExponent = 2; currentExponent <= 10; currentExponent++ ) {

    // The inner loop iterates through potential base numbers, also starting from 2.
    // It continues as long as the result of (baseNumber ^ currentExponent) does not exceed the overall upperBound.
    for ( let baseValue = 2; baseValue ** currentExponent <= upperBound; baseValue++ ) {
      // Add the calculated power to our collection. Sets automatically handle duplicates,
      // ensuring only unique power values are stored.
      computedPowers.add( baseValue ** currentExponent );
    }
  }

  // Once all relevant powers have been computed and collected,
  // find and display the maximum value present in the 'computedPowers' set to the console.
  console.log( Math.max( ...computedPowers ) );
}

// Invoke the main processing function.
// It reads the entire content from standard input ('/dev/stdin') as a UTF-8 string
// and passes it as the initial raw text for processing.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );