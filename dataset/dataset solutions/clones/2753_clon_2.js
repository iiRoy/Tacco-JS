// This function processes raw input data.
function processInputData( incomingData ) {

  /*
   * The input is expected to be multi-line.
   * We skip the first line and then split the second line by spaces.
   * This creates an array of string tokens.
   */
  var numberTokens = incomingData.split ( "\n" ) [ 1 ] .split ( " " ) ;

  // The core logic iterates until only two tokens remain in the array.
  while ( numberTokens .length !== 2 ) {

    // Extract the first three elements and convert them to integers.
    var firstVal  = parseInt ( numberTokens [ 0 ] ) ;
    var midVal    = parseInt ( numberTokens [ 1 ] ) ;
    var lastVal   = parseInt ( numberTokens [ 2 ] ) ;

    // Perform cumulative additions as per the problem's rule.
    firstVal = firstVal + midVal ;
    lastVal  = lastVal  + midVal ;

    // Create a new temporary collection excluding the first three processed elements.
    var tempCollection = numberTokens .slice ( 3 , numberTokens .length ) ;

    // Prepend the newly calculated values to the temporary collection.
    tempCollection .unshift ( lastVal ) ;
    tempCollection .unshift ( firstVal ) ;

    // Replace the original collection with the updated temporary one.
    numberTokens = tempCollection ;
  }

  // Once only two elements are left, sum them up.
  var finalSum = parseInt ( numberTokens [ 0 ] ) + parseInt ( numberTokens [ 1 ] ) ;

  // Display the ultimate computed result.
  console.log ( finalSum ) ;
}

// Do not alter the following section. It handles standard input/output.
processInputData ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;