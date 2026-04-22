(function ( rawData ) {
  // Process the raw input string into an array of individual lines.
  let lineSegments = rawData
    .replace( / \n $ / , '' )  // Remove the trailing newline character, if present.
    .split( ' \n ' ) ;         // Split the string by newline to get an array of lines.

  // The first line indicates the total number of test cases to process.
  const totalIterations = Number ( lineSegments . shift( ) ) ;

  // Iterate through each test case.
  for ( let currentCaseIdx = 0 ; currentCaseIdx < totalIterations ; currentCaseIdx ++ ) {
    // Parse the current line of space-separated numerical values.
    let currentCaseValues = lineSegments . shift( ) . split( ' ' ) . map( Number ) ;

    // Extract coordinates and radii for two circles from the parsed values.
    // Circle 1: (x1, y1) with radius r1
    const x1 = currentCaseValues . shift( ) ;
    const y1 = currentCaseValues . shift( ) ;
    const r1 = currentCaseValues . shift( ) ;

    // Circle 2: (x2, y2) with radius r2
    const x2 = currentCaseValues . shift( ) ;
    const y2 = currentCaseValues . shift( ) ;
    const r2 = currentCaseValues . shift( ) ;

    // Calculate the Euclidean distance between the centers of the two circles.
    // This uses the Pythagorean theorem: distance = sqrt((x2-x1)^2 + (y2-y1)^2).
    let centerDistance = Math . sqrt ( Math . pow ( x2 - x1 , 2 ) + Math . pow ( y2 - y1 , 2 ) ) ;

    /*
     * Determine the relationship between the two circles
     * based on their radii and the distance between their centers.
     *
     * Output meanings:
     *  2: Circle 2 is entirely inside or tangent to Circle 1 (Circle 1 contains Circle 2).
     * -2: Circle 1 is entirely inside or tangent to Circle 2 (Circle 2 contains Circle 1).
     *  1: The circles intersect or are externally tangent.
     *  0: The circles do not intersect and are separate.
     */
    if ( r1 >= centerDistance + r2 ) {
      // Circle B is completely inside or tangent to Circle A.
      console . log( 2 ) ;
    }
    else if ( r2 >= centerDistance + r1 ) {
      // Circle A is completely inside or tangent to Circle B.
      console . log( -2 ) ;
    }
    else if ( centerDistance <= r1 + r2 ) {
      // Circles intersect or are tangent externally.
      console . log( 1 ) ;
    }
    else {
      // Circles do not intersect and are separate.
      console . log( 0 ) ;
    }
  }

} )( require('fs').readFileSync('/dev/stdin', 'utf8') );