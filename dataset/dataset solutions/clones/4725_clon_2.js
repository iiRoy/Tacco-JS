function ProcessInput( incomingContent ) {

  // First, split the raw input into individual lines.
  let parsedLines = incomingContent.split( "\n" );

  /*
   * Extract the numeric data from the second line.
   * Split by spaces and convert each part to a number.
   */
  const numberSequence = parsedLines[ 1 ].split( " " ).map( Number );

  // Initialize counters for even and odd numbers.
  let evenNumbersFound = 0;
  let oddNumbersDetected = 0;

  // Iterate through the sequence of numbers.
  for ( let loopIndex = 0; loopIndex < numberSequence.length; loopIndex++ ) {

    const currentValue = numberSequence[ loopIndex ]; // Get the current element.

    // Check if the number is even or odd.
    if ( currentValue % 2 === 0 ) {
      evenNumbersFound++; // Increment even counter.
    } else {
      oddNumbersDetected++; // Increment odd counter.
    }
  }

  // Determine the final output based on the parity of the odd numbers count.
  console.log( oddNumbersDetected % 2 === 0 ? "YES" : "NO" );
}

// Execute the main logic by reading input from standard input.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );