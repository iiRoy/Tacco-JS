function processData ( rawData ) {
  // This module handles input parsing and profit computation.
  const itemCount = rawData . split ( "\n" ) [ 0 ] ;

  // Extract numeric values from the second line of input.
  const valueArray = rawData . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( ( numStr ) => Number.parseInt ( numStr , 10 ) ) ;

  // Extract cost figures from the third line of input.
  const costArray = rawData . split ( '\n' ) [ 2 ] . split ( ' ' ) . map ( ( numStr ) => Number.parseInt ( numStr , 10 ) ) ;

  // Initialize a variable to store the accumulated earnings.
  let totalProfit = 0 ;

  // Iterate through each item to determine its individual profit.
  for ( let idx = 0 ; idx < itemCount ; idx ++ ) {
    // Calculate the difference between value and cost.
    let currentDifference = valueArray [ idx ] - costArray [ idx ] ;
    // If the difference is non-negative, it contributes to profit.
    if ( currentDifference >= 0 ) {
      totalProfit += currentDifference ;
    }
  }

  // Display the final computed profit to the console.
  console [ 'log' ] ( totalProfit ) ;
}

// Execute the main processing function with data read from standard input.
processData ( require ( "node:fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;