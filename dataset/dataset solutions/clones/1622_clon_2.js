function ProcessInput( rawText ) {

  let lines = rawText.split( '\n' ) ;

  const maxRadius = Number( lines[0].split( ' ' )[1] ) ;

  let countInside = 0 ;

  for ( let lineIdx = 1 ; lineIdx < lines.length ; lineIdx++ ) {

    let currentCoords = lines[lineIdx].split( ' ' ) ;
    let xVal = Number( currentCoords[0] ) ;
    let yVal = Number( currentCoords[1] ) ;

    if ( ( xVal * xVal ) + ( yVal * yVal ) <= ( maxRadius * maxRadius ) ) {
      countInside++ ;
    }
  }

  console.log( countInside ) ;
}


// This section handles reading standard input and invoking the primary processing function.
// Please do not modify the code below this line.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;