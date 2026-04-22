function processInputData ( inputDataString )
{
  // Begin by cleaning the raw input string: remove excess whitespace
  // and then segment it into an array of distinct text lines.
  let processedLines = inputDataString.trim().split( "\n" ) ;

  // The first segment of the input is typically an informational header,
  // which is not directly utilized in the core logic, so it's removed.
  processedLines.shift() ;

  // The subsequent line contains the primary sequence of characters
  // that will be analyzed for specific patterns.
  const sequenceString = processedLines.shift() ;

  // The remaining parts of the `processedLines` array represent various queries.
  // Each query line is transformed: it's split by spaces, parsed into numerical values,
  // and then each number is adjusted to be zero-indexed.
  processedLines = processedLines.map( ( elementItem ) =>
    elementItem.split( " " ).map( Number ).map( ( val ) => val - 1 )
  ) ;

  // An array is initialized to store the running tally of pattern occurrences.
  // Its size is determined by the total number of queries.
  let cumulativeCounts = new Array( processedLines.length ).fill( 0 ) ;

  // A dedicated variable to keep track of the specific pattern's frequency.
  let acPairCounter = 0 ;

  // This array is allocated to hold indices corresponding to the queries.
  // While its purpose isn't explicitly used later for output, its presence
  // and initialization are maintained for structural fidelity.
  const queryIndices = new Array( processedLines.length ) ;

  // Populate the `queryIndices` array with a simple sequential enumeration.
  for ( let idx = 0 ; idx < processedLines.length ; idx++ )
  {
    queryIndices[ idx ] = idx ;
  }

  // Iterate through the `sequenceString`, scanning for the target two-character pattern.
  // The loop terminates one character before the end to safely check pairs.
  for ( let loopVar = 0 ; loopVar < sequenceString.length - 1 ; loopVar++ )
  {
    // Evaluate if the current character and the subsequent character form the desired 'AC' pattern.
    if ( sequenceString[ loopVar ] === 'A' && sequenceString[ loopVar + 1 ] === 'C' )
    {
      // If the pattern is identified, increment the frequency tracker.
      acPairCounter++ ;
    }
    // Record the current cumulative count of the pattern at an offset index.
    cumulativeCounts[ loopVar + 1 ] = acPairCounter ;
  }

  // Now, process each individual query that was extracted from the input.
  for ( let k = 0 ; k < processedLines.length ; k++ )
  {
    // Retrieve the starting index (left boundary) for the current query.
    const leftBoundary = processedLines[ k ][ 0 ] ;
    // Retrieve the ending index (right boundary) for the current query.
    const rightBoundary = processedLines[ k ][ 1 ] ;

    // Compute and display the difference in cumulative pattern counts
    // between the right and left boundaries, effectively giving the count
    // within that specific range.
    console.log( cumulativeCounts[ rightBoundary ] - cumulativeCounts[ leftBoundary ] ) ;
  }
}

// Initiate the data processing pipeline by reading content from standard input,
// which is a common practice in execution environments for programming challenges.
processInputData( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf-8' ) ) ;