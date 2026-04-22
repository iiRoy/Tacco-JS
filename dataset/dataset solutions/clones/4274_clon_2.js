/*
 * This JavaScript module defines a primary function to process numerical input.
 * It simulates a growth or accumulation process based on two initial parameters.
 */
function computeValue ( rawData ) {
  // Parse the first line of the input string to get the initial iteration count.
  var firstParam = parseInt( rawData . split ( '\n' ) [ 0 ] ) ;

  // Parse the second line of the input string to get the additive constant.
  var secondParam = parseInt( rawData . split ( '\n' ) [ 1 ] ) ;

  // Initialize the primary accumulator variable to a starting value of one.
  var currentValue = 1 ;

  // Begin an iterative process, running for 'firstParam' number of cycles.
  for ( var loopCounter = 0 ; loopCounter < firstParam ; loopCounter ++ )
  {
    // Evaluate a condition: if the current value (doubled then subtracted by itself)
    // is less than or equal to the second parameter. This simplifies to 'currentValue <= secondParam'.
    if ( ( currentValue * 2 - currentValue ) <= secondParam )
    {
      // If the condition holds, the current value is doubled.
      currentValue = currentValue * 2 ;
    }
    else
    {
      // Otherwise, the second parameter is added to the current value.
      currentValue += secondParam ;
    }
  }

  // After all iterations, log the final computed value to the standard output.
  console . log ( currentValue ) ;
}

// Execute the main processing function by reading input from stdin.
// The 'fs' module is used to synchronously read the entire file content.
computeValue ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;