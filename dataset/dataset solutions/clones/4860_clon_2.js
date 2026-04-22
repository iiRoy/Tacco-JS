// This function performs a series of calculations on input data.
function ProcessData (rawData)
{
  // Split the raw input string into an array of lines.
  let parsedLines = rawData.split ( "\n" ) ;

  // The first line indicates the number of processing rounds.
  let iterationCount = parsedLines [ 0 ] ;

  // The remaining lines form the initial set of values for processing.
  let currentValues = parsedLines.slice ( 1 ) ;

  // Begin the main processing loop, executing for the specified number of rounds.
  for (let roundIndex = 0 ; roundIndex < iterationCount ; ++ roundIndex) {
    // Initialize an empty array to store results for the current round.
    let nextValues = [ ] ;

    // Iterate through the 'currentValues' array, processing elements in pairs.
    for (let pairIndex = 0 ; pairIndex < currentValues.length ; pairIndex += 2) {
      /*
       * Compare two adjacent elements from the 'currentValues' array.
       * The comparison implicitly converts string values to numbers.
       */
      if (currentValues [ pairIndex ] > currentValues [ pairIndex + 1 ]) {
        // If the first element is greater, push their difference to 'nextValues'.
        nextValues.push ( currentValues [ pairIndex ] - currentValues [ pairIndex + 1 ] ) ;
      } else if (currentValues [ pairIndex ] == currentValues [ pairIndex + 1 ]) {
        // If elements are equal, push the first element itself.
        nextValues.push ( currentValues [ pairIndex ] ) ;
      } else {
        // If the second element is greater, push their difference (second minus first).
        nextValues.push ( currentValues [ pairIndex + 1 ] - currentValues [ pairIndex ] ) ;
      }
    }
    // After processing all pairs, the 'nextValues' become the 'currentValues' for the next round.
    currentValues = nextValues ;
  }

  // Finally, log the first element of the last processed array to the console.
  console.log ( currentValues [ 0 ] ) ;
}

// Invoke the main processing function, reading input from standard input.
ProcessData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;