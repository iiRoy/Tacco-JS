const executeProgram = inputStream => {
  const processedLines = inputStream . trim() . split( '\n' ) ;

  // This section processes the initial input data.
  // The primary numeric value to examine.
  const firstValue = processedLines[0] . split( " " )[0];

  // A flag or indicator variable for the outcome.
  let resultIndicator ;

  if ( firstValue == 0 ) {
    resultIndicator = 1 ;
  }
  else {
    resultIndicator = 0 ;
  }

  // Display the final computed indicator to the console.
  console . log ( resultIndicator ) ;
} ;

// Obtain data from the standard input stream for processing.
executeProgram( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;