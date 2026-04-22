"use strict"
;

/*
 * This module processes raw input data to count occurrences of a specific pattern.
 * It also tallies lines starting with 'B' and ending with 'A'.
 */
function ProcessInput( rawData ) {

  // Split the entire input string into an array of individual lines.
  const lines = rawData.split( '\n' ) ;

  // The first line is expected to be a number, but it's not used in the core logic.
  const numLines = parseInt( lines.shift( ) ) ;

  // Initialize a variable to accumulate the total pattern occurrences.
  let totalOccurrences = 0 ;

  // Initialize counters for lines starting with 'B' and ending with 'A'.
  let prefixBCount = 0 ;
  let suffixACount = 0 ;

  // Flag to track if any line starts with 'B' AND ends with 'A'.
  let hasBothEnds = false ;

  /*
   * Iterate over each remaining line in the input array.
   * For each line, perform pattern matching and end-character checks.
   */
  lines.forEach( currentLine => {

    // Calculate occurrences of "AB" in the current line.
    // This counts how many "AB" pairs are present.
    totalOccurrences += ( currentLine.length - currentLine.replace( new RegExp('AB', 'g'), '' ).length ) / 2 ;

    // For debugging purposes, output the current total pattern count.
    console.log( `Current total pattern count: ${ totalOccurrences }` ) ;

    // Check if the current line begins with the character 'B'.
    let startsB = currentLine.charAt( 0 ) === 'B' ;
    if ( startsB ) {
      prefixBCount ++ ; // Increment counter if it starts with 'B'.
    }

    // Check if the current line concludes with the character 'A'.
    let endsA = currentLine.charAt( currentLine.length - 1 ) === 'A' ;
    if ( endsA ) {
      suffixACount ++ ; // Increment counter if it ends with 'A'.
    }

    // Update the flag if this line satisfies both conditions (starts with 'B' AND ends with 'A').
    hasBothEnds = hasBothEnds || ( endsA && startsB ) ;

  } ) ;

  // Add the minimum of lines starting with 'B' and lines ending with 'A' to the total.
  totalOccurrences += suffixACount < prefixBCount ? suffixACount : prefixBCount ;

  // Adjust the total if any line satisfied both 'starts with B' and 'ends with A'.
  totalOccurrences += hasBothEnds ? -1 : 0 ;

  // Output the final calculated total number of occurrences.
  console.log( totalOccurrences ) ;

}

// Read input from standard input and pass it to the processing function.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;