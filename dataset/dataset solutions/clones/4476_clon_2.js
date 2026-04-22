/* This script processes two lines of numerical data from standard input. */
function processInputData( rawInputString ) {
  // Split the entire input string into individual lines
  const lineSegments = rawInputString.split( '\n' );

  /* The first line contains configuration numbers. */
  const firstLineNumbers = lineSegments[ 0 ].split( ' ' ).map( ( parsedValue ) => {
    return parseFloat( parsedValue );
  } );

  // The second line contains values to be processed.
  let secondLineValues = lineSegments[ 1 ].split( ' ' ).map( ( itemValue ) => parseFloat( itemValue ) );

  // Sort the second set of values in descending numerical order.
  secondLineValues.sort( ( valA, valB ) => {
    return ( valA > valB ) ? -1 : 1;
  } );

  // Output the reordered list to the console.
  console.log( secondLineValues );

  // Initialize an accumulator for summation.
  let cumulativeSum = 0;

  /* Iterate through the sorted values for a specified count from the first line. */
  for ( let loopIndex = 0; loopIndex < firstLineNumbers[ 1 ]; loopIndex++ ) {
    cumulativeSum += secondLineValues[ loopIndex ];
  }

  // Display the final calculated sum.
  console.log( cumulativeSum );
}

// Read input from the standard input stream and execute the main processing function.
processInputData( require( "node:fs" ).readFileSync( "/dev/stdin", "utf8" ) );