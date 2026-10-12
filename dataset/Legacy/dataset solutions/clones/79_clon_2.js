( function ( rawData ) {
  // Process the incoming raw data string.
  // First, remove any trailing newline characters.
  const numVal = Number( rawData.replace( /\n$/, '' ) );

  // Compute the factorial of the processed number and display it.
  console.log( calculateProduct( numVal ) );
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );

/**
 * Recursively computes the factorial of a given non-negative integer.
 * @param {number} currentNum The number for which to calculate the factorial.
 * @returns {number} The factorial of currentNum.
 */
function calculateProduct( currentNum ) {
  // Base case: factorial of 1 is 1.
  if ( currentNum === 1 ) {
    return 1;
  }
  // Recursive step: n! = n * (n-1)!
  return currentNum * calculateProduct( currentNum - 1 );
}
