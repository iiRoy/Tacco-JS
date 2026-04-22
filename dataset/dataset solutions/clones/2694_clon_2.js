/*
 * This function processes the entirety of the input data received as a string.
 */
function ExecuteLogic(  sourceText  ) {
  var operandOne, operandTwo ; // Declare the two numerical variables for operation.

  // Extract the first numeric value from the input string.
  operandOne = Number( sourceText.split('\n')[0] .split(' ')[0] ) ;

  // Extract the second numeric value from the input string.
  operandTwo = Number( sourceText.split('\n')[0] .split(' ')[1] ) ;

  if ( operandOne === operandTwo )
  {
    console.log(0) ; // If both numbers are identical, output zero.
  }
  else if ( ( operandOne + operandTwo ) % 2 === 0 )
  {
    console.log( ( operandOne + operandTwo ) / 2 ) ; // If the sum is even, print their average.
  }
  else
  {
    console.log('IMPOSSIBLE') ; // Otherwise, indicate that the operation is not feasible under certain conditions.
  }
}

/*
 * Do not modify any code beyond this point.
 * This section handles reading from standard input and invoking the main processing routine.
 */
ExecuteLogic ( require("fs") .readFileSync("/dev/stdin", "utf8") ) ;