// Function to handle geometric calculations based on provided data
function ProcessInputData ( rawData ) {
  // Split the raw input string into individual lines
  const lineSegments = rawData . split ( "\n" ) ;

  // Further split the first line into space-separated tokens
  let dimensionTokens = lineSegments [ 0 ] . split ( " " ) ;

  // Parse width, height, and coordinates from the tokens
  const widthValue = Number . parseInt ( dimensionTokens [ 0 ] ) ;
  const heightValue = Number . parseInt ( dimensionTokens [ 1 ] ) ;
  const coordX = Number . parseInt ( dimensionTokens [ 2 ] ) ;
  const coordY = Number . parseInt ( dimensionTokens [ 3 ] ) ;

  // Calculate a quarter of the total area, assuming a rectangular shape
  const calculatedArea = ( widthValue / 2.0 ) * ( heightValue / 2.0 ) ;

  // Determine if the given coordinates represent the exact center point
  if ( coordX === widthValue / 2 && coordY === heightValue / 2 ) {
    console . log ( calculatedArea , 1 ) ; // Output area and a flag indicating center
  } else {
    console . log ( calculatedArea , 0 ) ; // Output area and a flag indicating not center
  }
}

// Read input from standard input and pass it to the processing function
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;