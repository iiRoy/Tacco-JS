var sourceData = require('fs') .readFileSync(  '/dev/stdin' ,  'utf8' ); // Obtain raw textual input from standard input stream

var contentLines = ( sourceData .replace( /\n$/ , "" ) ) .split( "\n" ); // Process input: remove trailing newline, then split into individual lines

var numOperations = contentLines .shift() - 0 ; // Extract the first line as the count of operations, converting it to a numeric type

for ( var currentOpIndex = 0 ; currentOpIndex < numOperations ; currentOpIndex++ ) { // Iterate through each specified operation
  /*
   * For each operation, parse the numeric pair and determine the sequence of steps
   * required to transform the initial value into the final destination.
   */
  var valuePair = contentLines[ currentOpIndex ] .split( " " ) .map( Number ); // Parse the current line into a pair of numbers

  var initialPoint = valuePair[ 0 ]; // The starting numerical value
  var finalDestination = valuePair[ 1 ]; // The target numerical value

  var pathTraversed = [ initialPoint ]; // Initialize the sequence with the starting point
  var stepDirection = 1; // Default step increment

  if ( initialPoint < finalDestination ) {
    do {
      initialPoint++; // Increment the current value
      pathTraversed .push( initialPoint ); // Add to the sequence
    } while ( initialPoint != finalDestination ); // Continue until the target is reached
  } else if ( initialPoint > finalDestination && initialPoint <= 5 ) {
    do {
      initialPoint--; // Decrement the current value
      pathTraversed .push( initialPoint ); // Add to the sequence
    } while ( initialPoint != finalDestination ); // Continue until the target is reached
  } else if ( initialPoint > finalDestination && initialPoint >= 6 ) {
    do {
      initialPoint += stepDirection; // Apply step direction
      if ( initialPoint === 10 ) {
        initialPoint = 5; // Special rule: if 10, reset to 5
        stepDirection = -1; // Change direction to decrement
      };
      if ( initialPoint === 0 ) {
        stepDirection = 1; // Special rule: if 0, change direction to increment
      };
      pathTraversed .push( initialPoint ); // Add to the sequence
    } while ( initialPoint != finalDestination ); // Continue until the target is reached
  }

  console .log( pathTraversed .join( " " ) ); // Output the generated sequence, space-separated
}