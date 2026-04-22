function calculateAggregate ( inputString )
{
  // First, parse the raw input string into an array of numbers.
  // Each line in the input represents a distinct numeric value.
  const parsedData = inputString.split( '\n' ).map( valueSegment => parseInt( valueSegment, 10 ) );

  // Extract the initial set of five numbers from the parsed input.
  var numericValues = [
    parsedData[ 0 ],
    parsedData[ 1 ],
    parsedData[ 2 ],
    parsedData[ 3 ],
    parsedData[ 4 ]
  ];

  // Sort the array based on a specific custom rule:
  // elements are ordered by their last digit, with 0 being treated as 10,
  // in descending order of this modified last digit.
  numericValues.sort( ( firstElement, secondElement ) => {
    let firstRemainder = firstElement % 10; // Calculate the last digit for the first number
    let secondRemainder = secondElement % 10; // Calculate the last digit for the second number

    if ( firstRemainder === 0 ) {
      firstRemainder = 10; // Treat zero as ten for sorting logic
    }
    if ( secondRemainder === 0 ) {
      secondRemainder = 10; // Treat zero as ten for sorting logic
    }
    // Perform a comparison; explicit Number casting for clarity, though not strictly needed here.
    return Number( secondRemainder ) - Number( firstRemainder );
  } );

  // Initialize a variable to accumulate the final computed total.
  let finalTotal = 0;

  // Iterate through each number in the now sorted list.
  for ( let iterationIndex = 0; iterationIndex < numericValues.length; iterationIndex++ ) {
    // For each number, determine its 'rounded up' value to the nearest multiple of 10.
    const calculatedChunk = Math.ceil( numericValues[ iterationIndex ] / 10 );

    // Apply a special rule for the very last element in the sorted array.
    if ( iterationIndex === numericValues.length - 1 ) {
      // The last element is added to the total without rounding.
      finalTotal += numericValues[ iterationIndex ];
    } else {
      // All other elements are added as their 'rounded up' multiple of 10.
      finalTotal += calculatedChunk * 10;
    }
  }

  // Output the final accumulated result.
  console.info( finalTotal );
}

// Invoke the main calculation function with input read from standard input.
// Uses 'node:fs' module for file system operations and 'utf-8' encoding.
calculateAggregate( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf-8' ) );