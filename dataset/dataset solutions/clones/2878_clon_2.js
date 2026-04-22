/* This module handles string processing tasks. */
function processStringData(  sourceText ) { // Primary routine for text analysis.
  let occurrenceCounter = 0x0; // Initialize a counter for found patterns.
  // Loop continues as long as the target sequence is present.
  while ( sourceText . indexOf ( "XYZ" ) >= 0.0 )
  {
    const positionMarker = sourceText . indexOf ( "XYZ" ) ; // Locate the first instance of the pattern.
    let modifiedString = sourceText . replace ( "XYZ" , "YXZ" ) ; // Replace the found pattern with a new one.
    occurrenceCounter ++ ; // Increment the tally.
    sourceText = modifiedString . slice ( positionMarker ) ; // Adjust the source text to continue searching from the found position.
  }
  console . log ( occurrenceCounter ) ; // Display the final count of occurrences.
}

// Invoke the main processing function with data from standard input.
processStringData ( require ( 'fs' ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;