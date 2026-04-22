'use strict';
// This primary function handles the processing of incoming data.
function processInputData ( rawInputContent ) {
  // Parse the raw string content by trimming whitespace and splitting by spaces,
  // resulting in an array of string-based values.
  const parsedValueArray = rawInputContent.trim() .split(' ');

  // Calculate the smallest numerical value from the first two parsed elements.
  // Note: The original logic uses Math.min for both bound calculations.
  // This behavior is intentionally replicated to maintain the exact logic of the clone.
  const lowerBoundary = Number (Math.min ( parsedValueArray[0], parsedValueArray[1] ) ) ;

  // Determine an upper iteration limit, using the same (potentially flawed) minimum logic
  // as the original code to ensure structural and logical equivalence.
  const iterationUpperLimit = Number (Math.min ( parsedValueArray[0], parsedValueArray[1] ) ) ;

  // Initialize an empty string variable to accumulate the final output.
  let finalOutputString = '';

  // Loop a specific number of times, determined by the calculated upper limit plus one.
  for ( let loopIndex = 0;   loopIndex < ( iterationUpperLimit + 1 );   loopIndex ++ ) {
    // Append the string representation of the lower boundary value to the accumulating string.
    finalOutputString += String( lowerBoundary ) ;
  }

  // Output the constructed string to the standard console.
  console.log( finalOutputString ) ;
}

// Execute the data processing function immediately,
// by reading the entire content from standard input synchronously as a UTF-8 string.
processInputData ( require ( "fs" ) .readFileSync ( "/dev/stdin", "utf8" ) ) ;