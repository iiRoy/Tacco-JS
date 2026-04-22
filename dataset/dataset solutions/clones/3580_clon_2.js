/* This script reads input from standard input, processes it, and prints a result. */
var fileSystemModule = require ( "fs" );
// Read the entire file content synchronously from the standard input path
let inputContent = fileSystemModule . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the input content by newlines and convert each line into a number.
// The unary plus operator (`+`) is used for type conversion.
inputContent = inputContent . split ( "\n" ) . map ( ( lineStr ) => + lineStr ) ;

// Call the main processing function and log its return value to the console.
console . log ( processInput ( ) ) ;

/**
 * The primary function that encapsulates the core logic of the program.
 * It iterates through the parsed input data to determine a specific condition.
 * @returns {string} "Yes" if the condition is met, otherwise "No".
 */
function processInput ( ) {
  // Define a string constant for the negative outcome.
  const negativeResult = "No" ;

  // The first element of the input array represents the total number of items to process.
  let totalItems = inputContent [ 0 ] ;

  // An auxiliary object, which is declared but not used in the current logic.
  // It demonstrates a change in identifier and potential data type.
  const auxiliaryMap = new Object ( ) ;

  // Loop through the input data starting from the second element (index 1).
  // The loop variable `dataIndex` is incremented within the loop body in certain conditions.
  for ( let dataIndex = 1 ; dataIndex <= totalItems ; dataIndex ++ ) {
    // Check if the XOR sum of the current input value and its index is odd.
    // If it is, the condition is not met, and we return the negative result.
    if ( ( inputContent [ dataIndex ] ^ dataIndex ) & 1 ) return negativeResult ;

    // Initialize two bounds based on the current input value and its index.
    let currentUpperBound = inputContent [ dataIndex ] ;
    let currentLowerBound = dataIndex ;

    // Enter a nested loop that continues as long as the current index is less than the upper bound.
    while ( dataIndex < currentUpperBound ) {
      // Increment the data index.
      dataIndex ++ ;
      // If the input value at the new index does not match the index itself, return "No".
      if ( inputContent [ dataIndex ] !== dataIndex ) return negativeResult ;

      // Increment the data index again.
      dataIndex ++ ;
      // Perform another odd/even check using XOR and bitwise AND.
      if ( ( inputContent [ dataIndex ] ^ dataIndex ) & 1 ) return negativeResult ;

      // Update the upper bound if a larger value is found.
      if ( currentUpperBound < inputContent [ dataIndex ] ) currentUpperBound = inputContent [ dataIndex ] ;
      // Otherwise, if specific conditions for the index and bounds are met, update the lower bound.
      else if ( dataIndex > inputContent [ dataIndex ] && currentLowerBound < inputContent [ dataIndex ] ) currentLowerBound = inputContent [ dataIndex ] ;
      // If neither of the above conditions is met, the sequence is invalid.
      else return negativeResult ;
    }
  }

  // If the entire loop completes without returning "No", the condition is met.
  return "Yes" ;
}