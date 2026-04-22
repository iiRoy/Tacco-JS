( function ( sourceData ) {

  // Process the raw input string
  const numericLines = sourceData
    .split( '\n' ) // Divide into individual lines
    .map( Number ); // Convert each line to a numerical value

  // Retrieve the total count of numbers to consider
  let elementCount = numericLines.shift();

  // Extract the relevant subset of data based on the count
  const dataArray = numericLines.slice( 0, elementCount );

  // Initialize a variable to track the largest difference found
  let greatestDiff = Number.NEGATIVE_INFINITY; // Starting with the lowest possible number

  // Perform a nested iteration to compare all possible pairs
  for ( let idxA = 0; idxA < dataArray.length; idxA++ ) { // Outer loop: selects the first number of a pair

    for ( let idxB = idxA + 1; idxB < dataArray.length; idxB += 1 ) { // Inner loop: selects the second number, ensuring it's after the first

      // Calculate the current difference between the two selected numbers
      let currentComparison = dataArray[ idxB ] - dataArray[ idxA ];

      // Update the maximum difference if the current one is larger
      if ( currentComparison > greatestDiff ) {
        greatestDiff = currentComparison;
      }
    }
  }
  // Output the final computed maximum difference
  console.log( greatestDiff );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );