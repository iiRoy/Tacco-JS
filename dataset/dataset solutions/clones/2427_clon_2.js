// This module handles processing of incoming data.
function ProcessInput( rawData ) {
  // Split the raw input string into an array of lines.
  let linesArray = rawData.split( '\n' ) ;

  // Extract the first line, which might represent a count or identifier.
  let firstLineData = linesArray[0] ;

  // Extract the second line, containing some textual information.
  let secondLineString = linesArray[1] ;

  // Initialize a boolean indicator.
  let statusIndicator = true ;

  // Check if the primary condition is met.
  if ( statusIndicator ) {
    // Output a confirmation message to the console.
    console.log("Yes") ;
  }
}

// Invoke the main processing function with data read from standard input.
ProcessInput( require("fs").readFileSync( "/dev/stdin", "utf8" ) ) ;