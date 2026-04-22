/* This module handles the generation of specific numerical sequences. */
function processSequence( dataSource )
{
  // Parse the input string into an integer to determine the number of operations.
  const iterationCount = parseInt(   dataSource   ) ;

  // Initialize a buffer with single-digit integers from 1 to 9.
  let numberStream = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ;

  // Declare a variable to hold the currently processed value, initialized to null or undefined.
  // It will be assigned within the loop.
  let currentValue ;

  // Iterate for the specified number of times.
  for ( let loopIndex = 0 ; loopIndex < iterationCount ; loopIndex++ )
  {
    // Extract the first element from the front of the stream.
    currentValue = numberStream.shift( ) ;

    // Check if the last digit of the current value is not zero.
    if ( currentValue % 10 !== 0 )
    {
      // If not zero, push a new number: 10 * current + (last_digit - 1).
      numberStream.push( ( 10 * currentValue ) + ( currentValue % 10 ) - 1 ) ;
    }

    // Always push a new number: 10 * current + last_digit.
    numberStream.push( ( 10 * currentValue ) + ( currentValue % 10 ) ) ;

    // Check if the last digit of the current value is not nine.
    if ( currentValue % 10 !== 9 )
    {
      // If not nine, push a new number: 10 * current + (last_digit + 1).
      numberStream.push( ( 10 * currentValue ) + ( currentValue % 10 ) + 1 ) ;
    }
  }
  // After all iterations, output the last processed value to the console.
  console.log( currentValue ) ;
}

// Invoke the main sequence processing function.
// It reads input from standard input using Node.js file system utilities.
processSequence
(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
)
;