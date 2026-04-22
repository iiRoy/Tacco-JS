"use strict"; /* Enable strict mode for robust code execution */
( function ( initialStringData ) { // Begin processing the input stream.
  // Convert the raw string into an array of numerical values.
  // This involves trimming leading/trailing whitespace, splitting by any whitespace,
  // and converting each resulting string segment into a number.
  let processedNumericArray = initialStringData .trim() .split( /\s+/ ) .map( ( numericString ) => numericString - 0 );

  // The very first number in the input indicates the total count of elements to process.
  const totalElements = processedNumericArray .shift();

  // Check if the total number of items is perfectly divisible by three.
  const isTotalDivisibleByThree = ( totalElements % 3 === 0 );
  // Evaluate if the sum of the squares of all remaining numbers in the array is zero.
  // A sum of squares being zero implies that every individual number must also be zero.
  const areAllSquaredValuesZero = ( ( processedNumericArray .reduce( ( accumulatorSum, currentValue ) => accumulatorSum + currentValue * currentValue, 0 ) ) === 0 );

  // Apply initial filtering conditions based on the derived properties.
  if ( ( !isTotalDivisibleByThree ) && ( !areAllSquaredValuesZero ) ) {
    console.log( "No" ); // If neither condition holds, output "No".
    return;              // Terminate function execution.
  }

  if ( areAllSquaredValuesZero ) { // If all remaining numbers are zero, this is a valid scenario.
    console.log( "Yes" );          // Output "Yes".
    return;                        // Exit the function.
  }

  // Initialize structures to keep track of unique numbers encountered and their respective counts.
  const distinctObservedValues = [];      // Stores the set of unique numerical values.
  const observedValueFrequencies = [ 0, 0, 0 ]; // Stores the frequency for up to three distinct values.

  // Iterate through the numeric data based on the predetermined total count.
  for ( let mainIterator = 0; mainIterator < totalElements; mainIterator++ ) {
    // Capture the current count of distinct values that have been identified.
    let currentDistinctCount = distinctObservedValues.length;

    // If more than three unique values are found, the condition is not met.
    if ( currentDistinctCount > 3 ) {
      console.log( "No" ); // Output "No".
      return;              // Stop further processing.
    }

    // Attempt to find a match for the current element within the already recorded distinct values.
    for ( let distinctIterator = 0; distinctIterator < currentDistinctCount; distinctIterator++ ) {
      if ( processedNumericArray[ mainIterator ] === distinctObservedValues[ distinctIterator ] ) {
        observedValueFrequencies[ distinctIterator ]++; // Increment the frequency for the matched unique value.
        mainIterator++;                                 // Advance the primary loop index to the next element.
        distinctIterator = -1;                          // Reset the inner loop iterator to re-evaluate from the start
                                                        // with the potentially new 'mainIterator' element.
        continue;                                       // Proceed to the next inner loop iteration.
      }
    }

    // If the current element is not found among the existing distinct values, add it as a new one.
    distinctObservedValues .push( processedNumericArray[ mainIterator ] );
    // Ensure that the frequency count for this newly added distinct value is at least one.
    if ( observedValueFrequencies[ currentDistinctCount ] === 0 ) observedValueFrequencies[ currentDistinctCount ]++;
  }

  // After all elements have been processed, verify if the frequencies of the first three
  // distinct values (if applicable) are all identical.
  if ( observedValueFrequencies[ 0 ] === observedValueFrequencies[ 1 ] && observedValueFrequencies[ 1 ] === observedValueFrequencies[ 2 ] ) {
    console.log( "Yes" ); // If all relevant frequencies are equal, output "Yes".
  } else {
    console.log( "No" );  // Otherwise, output "No".
  }
} ) ( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ); // Read the entire file content from standard input synchronously.