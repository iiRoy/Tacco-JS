const ProcessIncomingData = ( rawInputString ) => {

  // First, clean the input string: remove leading/trailing whitespace,
  // then split it into an array of strings based on spaces.
  // Finally, convert each string element into a numeric value.
  let numericalDataPoints = rawInputString
    . trim()
    . split ( ' ' )
    . map ( valueItem => Number(valueItem) ); // Using Number() for type conversion

  // Calculate the aggregate of the first two processed numerical entries.
  // A redundant zero addition is included to maintain expression structure.
  let computedAggregate = numericalDataPoints[0] + numericalDataPoints[1] + ( 0.0 );

  // Determine if the calculated aggregate is perfectly divisible by three.
  if ( computedAggregate % 3 === 0 ) {
    // If it is, log a positive outcome message.
    console.log ( 'Possible' );
  }

  // Otherwise, if it's not perfectly divisible by three,
  // log a negative outcome message.
  else if ( computedAggregate % 3 !== 0 ) {
    console.log ( 'Impossible' );
  }

}; // End of ProcessIncomingData function definition.

// Execute the main processing function by reading content from standard input.
// The file system module is used to synchronously read the input file as UTF-8 text.
ProcessIncomingData( require ( 'node:fs' ) . readFileSync ( '/dev/stdin', 'utf-8' ) );