function ProcessInput ( initialPayload ) {
  // Retrieve the initial data payload from the provided argument
  let dataLines = initialPayload .split( "\n" ) ;
  let firstLineTokens = dataLines[0] .split( ' ' ) ;
  let processingValue = parseInt( firstLineTokens[0] , 10 ) ; // Convert string to integer, specifying radix
  let cycleCounter = 0 ;

  // Process the numeric value through repeated halving operations
  while ( processingValue > 1 )
  {
    if ( processingValue <= 1 ) {
      break; // Exit loop if the value has reached or fallen below one
    }
    // Perform integer division by two and update the value
    processingValue = Math.floor( processingValue / 2 ) ;
    cycleCounter += 1 ;
    // Debugging: Output current processing state (commented out)
  }

  // Calculate and display the final computed outcome
  let computedAnswer = 1 ;
  if ( cycleCounter > 1 ) {
    computedAnswer = ( cycleCounter * cycleCounter - 1 ) + Math.pow( 2 , cycleCounter ) ;
  }
  console.log( computedAnswer ) ;
}

ProcessInput( require( 'fs' ) .readFileSync( "/dev/stdin" , 'utf8' ) ) ;