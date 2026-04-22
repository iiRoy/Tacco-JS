// This script processes numerical input to calculate a specific sum or return an error.
console.log( ( (inputString) => { // Begin self-executing anonymous function
  // Parse the input string: first line for item count, second line for data sequence.
  // Input string is trimmed, split by newline, then each line is split by space and converted to integers.
  const [ [numItems], valueArray ] = inputString .trim() .split( '\n' ) .map( lineText => lineText .split( ' ' ) .map( parsedVal => parsedVal | 0 ) );

  // Initialize a buffer array 'processedValues' based on the first element of 'valueArray'.
  const processedValues = [ 1 - valueArray[0] ];

  // First forward pass: populate 'processedValues' based on previous elements and 'valueArray'.
  for ( let loopIndex = 1; loopIndex < numItems; loopIndex++ ) {
    processedValues .push( processedValues[loopIndex - 1] * 2 - valueArray[loopIndex] );
  }

  // Append a zero at the end of the 'processedValues' buffer.
  processedValues .push( 0 );

  // Initialize the final accumulator with the last element of the input 'valueArray'.
  // Note: 'valueArray' is assumed to contain 'numItems + 1' elements, with the last one being valueArray[numItems].
  let finalAccumulator = valueArray[numItems];

  // Second backward pass: iterate through 'processedValues' and 'valueArray'
  // to adjust 'processedValues' and update the 'finalAccumulator'.
  for ( let loopIndex = numItems - 1; loopIndex >= 0; loopIndex-- ) {
    // Calculate a comparison bound using the next elements in 'processedValues' and 'valueArray'.
    const thresholdValue = processedValues[loopIndex + 1] + valueArray[loopIndex + 1];

    // Apply conditional logic to adjust the current element in 'processedValues'.
    if ( processedValues[loopIndex] > thresholdValue ) {
      processedValues[loopIndex] = thresholdValue;
    } else if ( processedValues[loopIndex] * 2 < thresholdValue ) {
      // If a specific condition is met, return an error string immediately.
      return '-1';
    }

    // Accumulate the current 'processedValues' element and corresponding 'valueArray' element into the final sum.
    finalAccumulator += processedValues[loopIndex] + valueArray[loopIndex];
  }

  // Convert the final accumulated sum to a string and return it.
  return `${finalAccumulator}`;
} ) ( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) ); // Read input from stdin