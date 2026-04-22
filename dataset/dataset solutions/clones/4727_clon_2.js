function ProcessInputData(rawData) {
  // Begin processing the raw input data stream.
  // First, segment the entire input string into an array of individual lines.
  var processedLines = rawData.split("\n") ;

  // Extract the first numerical value from the initial line.
  // This value typically represents the total count of subsequent data elements.
  var elementCount = processedLines[0] ;

  // The second line contains a sequence of space-separated numbers.
  // These are parsed into an array of integers for further computation.
  var numericValues = processedLines[1].split(" ").map(currentVal => parseInt(currentVal)) ;

  // Initialize a counter to track the occurrence of odd numbers within the dataset.
  var oddNumberCount = 0 ;

  // Iterate through each number in the collection of numeric values.
  for ( var idx = 0 ; idx < elementCount ; idx++ ) {
    // A bitwise AND operation with 1 efficiently checks if the number is odd.
    // If the least significant bit is 1, the number is odd.
    if ( numericValues[idx] & 1 ) {
      // Increment the dedicated counter for odd numbers.
      oddNumberCount++ ;
    }
  }

  // Determine the final result string based on the parity of the odd number count.
  // If the count of odd numbers is itself an odd number, the outcome is "NO".
  // Otherwise, if the count of odd numbers is even, the outcome is "YES".
  var finalOutcome = ( oddNumberCount & 1 ? "NO" : "YES" ) ;

  // Display the computed result to the standard output.
  console.log(finalOutcome) ;
}

// Invoke the primary data processing routine.
// This involves reading content from standard input, decoding it as UTF-8,
// and then removing any leading or trailing whitespace before passing it.
ProcessInputData( require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim() ) ;