const processInputData = rawDataString => {
  // First, clean up the incoming data string by trimming whitespace and splitting into individual lines.
  const parsedLines = rawDataString . trim ( ) . split ( '\n' )

  // Extract the total number of items from the first line.
  const itemQuantity = parseInt ( parsedLines [ 0 ] )

  // Parse the second line into an array of integers, representing the initial sequence.
  const initialArray = parsedLines [ 1 ] . split ( ' ' ) . map ( elementString => parseInt ( elementString ) )

  // Create a sorted version of the initial array for comparison.
  const orderedArray = initialArray . slice ( ) . sort ( ( firstNum , secondNum ) => firstNum - secondNum )

  // Initialize a counter for discrepancies between the initial and sorted arrays.
  let mismatchCount = 0;
  for ( let idx = 0 ; idx < itemQuantity ; idx++ ) { // Iterate through each position.
    /*
     * Compare elements at the same index in both arrays.
     * If they differ, increment the mismatch counter.
     */
    if ( initialArray [ idx ] !== orderedArray [ idx ] ) {
      mismatchCount++;
    }
  }

  // Determine if the number of mismatches is 0 or 2, then print the appropriate result.
  mismatchCount === 2 || mismatchCount === 0
    ? console . log ( 'YES' )
    : console . log ( 'NO' )
}

// Read input from standard input and pass it to the processing function.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) )