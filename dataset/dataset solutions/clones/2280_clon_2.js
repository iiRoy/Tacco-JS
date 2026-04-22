// This function processes a given string input to find specific patterns.
function AnalyzeSequence ( dataSource ) {
  // Split the entire input data into an array of lines based on newline characters.
  const linesOfData = dataSource.split ( '\n' );

  // The first line is parsed as an integer to determine the iteration boundary.
  let iterationBound = Math.floor ( linesOfData [ 0 ] );
  // The second line is treated as the main string for pattern matching.
  const targetSequence = linesOfData [ 1 ];
  
  // Initialize a counter for the number of successful pattern matches.
  let occurrenceTally = 0 ;
  
  // Iterate through the target sequence, checking for the 'ABC' pattern.
  // The loop runs up to (iterationBound - 2) to ensure valid access for str[i+2].
  for ( let currentPosition = 0 ; currentPosition < iterationBound - 2 ; currentPosition++ ) {
    // Check if the character at the current position is 'A'.
    if ( targetSequence [ currentPosition ] === 'A' ) {
      // If 'A' is found, check if the next character is 'B'.
      if ( targetSequence [ currentPosition + 1 ] === 'B' ) {
        // If 'A' and 'B' are found consecutively, check if the character after 'B' is 'C'.
        if ( targetSequence [ currentPosition + 2 ] === 'C' ) {
          // If 'ABC' sequence is found, increment the tally.
          occurrenceTally++;
        }
      }
    }
  }
  
  // Output the total count of 'ABC' occurrences found.
  console.log( occurrenceTally );
}

// Invoke the main processing function with data read from standard input.
AnalyzeSequence ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );