function makeRectangle ( number , sticks ) {
  /* Sort the input array of stick lengths in descending order */
  sticks . sort ( function ( a , b ) {

    if ( a > b ) {
      return -1 ; // a comes before b
    }

    if ( a < b ) {
      return 1 ;  // b comes before a
    }
    return 0 ;    // a and b are equal
  } ) ;


  /* Look for pairs of identical stick lengths.
   * The first two distinct pairs found will form the sides of the rectangle.
   * The loop terminates once both sides are determined.
   */
  var sideA = 0 , sideB = 0 ;

  for ( var i = 0 ; i < sticks . length - 1 ; i ++ ) {

    // If both sides have been found, we can exit early.
    if ( sideA != 0 && sideB != 0 ) {
      break ;
    }

    // Check if the current stick and the next one have the same length.
    if ( sticks [ i ] == sticks [ i + 1 ] ) {

      if ( sideA == 0 ) {
        // This is the first pair found, assign it to sideA.
        sideA = sticks [ i ] ;
      } else {
        // This is the second pair found, assign it to sideB.
        sideB = sticks [ i ] ;
      }
      i ++ ; // Skip the next element since it was part of the pair
    }
  }


  return sideA * sideB ; /* If either sideA or sideB remains 0
                          * (meaning no pair was found for that side),
                          * the product will correctly be 0.
                          */
}