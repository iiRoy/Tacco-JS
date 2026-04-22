function CalculateResult( dataString ) {
  // Normalize the input string by removing trailing newlines and splitting into an array of lines.
  var parsedLines = dataString . replace ( /\n+$/, '' ) . split ( /\n/ ) ;
  
  // Initialize a variable to accumulate the final calculated tally.
  var finalTally = 0 ;
  
  // Loop through a range determined by the first element of the parsed input.
  // The loop's upper bound is based on the first processed line.
  for ( let loopIndex = 0 ; loopIndex < parsedLines[0] ; loopIndex++ ) {
    // Conditional logic: Check if the current loop index is less than the value
    // from the second element of the parsed input.
    if ( loopIndex < parsedLines[1] ) {
      // If the condition is true, add the numeric value of the third element
      // from the parsed input to the running total.
      finalTally += Number( parsedLines[2] ) ;
    } else {  
      // Otherwise (if the condition is false), add the numeric value of the fourth element
      // from the parsed input to the running total.
      finalTally += Number( parsedLines[3] ) ;
    }    
  }
  
  // Output the computed final tally to the console.
  console.log( finalTally ) ;
}

// Invoke the main calculation function, reading input asynchronously from standard input.
CalculateResult( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;