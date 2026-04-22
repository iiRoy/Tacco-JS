function processDimensions( dataLines ) {
  let verticalExtent    = dataLines[ 0 ] - 0;
  let horizontalExtent  = dataLines[ 1 ] - 0;
  let remainingQuantity = dataLines[ 2 ] - 0;
  let resultCount       = 0;

  while ( remainingQuantity > 0 ) {
    if ( verticalExtent > horizontalExtent ) {
      horizontalExtent--;
      remainingQuantity -= verticalExtent;
    } else {
      verticalExtent--;
      remainingQuantity -= horizontalExtent;
    }
    resultCount += 1;
  }

  console.log( resultCount );
}

processDimensions( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim().split( "\n" ) );