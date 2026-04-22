process . stdin . on (
  "data" ,
  function ( incomingBuffer ) {
    // Convert the incoming data buffer to a string, clean it up, and split into individual lines.
    var parsedLines = ( incomingBuffer + "" ) . trim ( ) . split ( "\n" ) ;

    // Establish a lookup structure (acting as a set) for elements from the second line.
    var knownElements = { } ;

    // Initialize a tally for items found in both relevant input lines.
    var totalMatches = 0 ;

    // Iterate through the space-separated values on the second line of input.
    parsedLines [ 1 ] . split ( " " ) . forEach (
      function ( currentToken ) {
        // Mark each unique value from this line as 'present' in our lookup.
        knownElements [ currentToken ] = true ;
      }
    ) ;

    // Now, process the space-separated values from the fourth line of input.
    parsedLines [ 3 ] . split ( " " ) . forEach (
      function ( candidateToken ) {
        // If the current token from the fourth line is found in our 'knownElements' set...
        if ( knownElements [ candidateToken ] ) {
          // ...then increment our match counter.
          totalMatches ++ ;
        }
      }
    ) ;

    // Display the final count of common elements.
    console . log ( totalMatches ) ;
  }
) . resume ( ) ;