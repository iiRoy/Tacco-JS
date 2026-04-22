function ProcessData ( rawData ) {

  // Transform the incoming string data into a structured array of string arrays.
  let processedData = rawData . split ( "\n" ) . map ( rowString => rowString . split ( " " ) ) ;

  // Extract the count of data points from the first element.
  const totalItems = processedData [ 0 ] [ 0 ] ;

  const calculateDiagonalMatches = ( currentItemIndex, currentX, currentY ) => {
    // Initialize the count of related items, starting with one for the current item's context.
    let matchCount = 1 ;

    for ( let jdx = 1 ; jdx <= totalItems ; jdx ++ ) {
      // Avoid comparing an item with itself in this specific iteration.
      if ( currentItemIndex === jdx ) {
        continue ;
      }

      // Retrieve the coordinates of another data point.
      const otherX = processedData [ jdx ] [ 0 ] , otherY = processedData [ jdx ] [ 1 ] ;

      // Determine if the two points have a diagonal relationship (one is strictly greater in both axes or strictly smaller).
      if ( ( currentX < otherX && currentY < otherY ) || ( otherX < currentX && otherY < currentY ) ) {
        console . log ( otherX, otherY ) ; // Display the coordinates of the matching point.
        matchCount ++ ; // Increment the tally for diagonal matches.
      }
    }
    return matchCount ; // Return the final count of items satisfying the diagonal condition.
  } ;

  // Process each item from the dataset sequentially.
  for ( let idx = 1 ; idx <= totalItems ; idx ++ ) {
    console . log ( "-------" ) ; // Output a visual separator for clarity.
    // Call the helper function to find diagonal matches for the current item and log its result.
    console . log ( calculateDiagonalMatches ( idx, processedData [ idx ] [ 0 ], processedData [ idx ] [ 1 ] ) ) ;
  }
}

// Standard Node.js boilerplate for reading input from the console.
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;