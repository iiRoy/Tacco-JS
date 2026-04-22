function computeOutcome ( dataSource ) {
  // This routine processes incoming data to determine a combinatorial result.
  // The expectation is that the input will be a string containing two numbers, separated by a space.
  let partsArray = dataSource . split( " " ) ;
  let quantityX = parseInt( partsArray[0] , 10 ) ;
  let quantityY = parseInt( partsArray[1] , 10 ) ;

  /*
   *  Combinatorial Logic Overview:
   *  - An even number plus another even number results in an even total. (Scenario 1)
   *  - An odd number plus an even number results in an odd total.   (Scenario 2)
   *  - An odd number plus another odd number results in an even total.   (Scenario 3)
   *
   *  Therefore, the aggregate count of ways to select two items that sum to an even number
   *  from a collection of (quantityX + quantityY) items is the sum of possibilities
   *  from Scenario 1 (even + even) and Scenario 3 (odd + odd).
   *  Specifically, for Scenario 1: quantityX * (quantityX - 1) pairs.
   *  And for Scenario 3: quantityY * (quantityY - 1) pairs.
   */
  if ( quantityX >= 2 && quantityY >= 2 )
  {
    console.log( quantityX * ( quantityX - 1 ) + quantityY * ( quantityY - 1 ) ) ;
  }
  else if ( quantityX <= 1 )
  {
    console.log( quantityY * ( quantityY - 1 ) ) ;
  }
  else if ( quantityY <= 0 )
  {
    // This particular branch handles edge cases where the second quantity is non-positive.
    // The calculation here reflects the original problem's specific handling of such scenarios.
    console.log( quantityX * ( quantityY - 1 ) ) ;
  }

}

// The following instruction block is for standard input/output handling and must not be modified.
computeOutcome( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;