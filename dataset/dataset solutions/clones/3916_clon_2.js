/*
  This script processes numerical input to generate a sorted list of unique values
  based on specific range and iteration constraints.
*/
function executeLogic( receivedText ) {
  // Clean up input string by removing leading/trailing whitespace
  receivedText = receivedText.trim();

  // Parse the three numerical parameters from the input string
  const lowerLimit = parseInt(receivedText.split(" ")[0], 10);
  const upperLimit = parseInt(receivedText.split(" ")[1], 10);
  const loopCount  = parseInt(receivedText.split(" ")[2], 10);

  // Initialize an empty array to store the generated values
  var valueSet = [];

  // First pass: Add numbers starting from lowerLimit up to loopCount times,
  // ensuring they don't exceed upperLimit.
  for ( var idx = 0; idx < loopCount; idx++ ) {
    if ( lowerLimit + idx <= upperLimit ) {
      valueSet.push(lowerLimit + idx);
    }
  }

  // Second pass: Add numbers descending from upperLimit, again up to loopCount times.
  // Only add if not already present in valueSet and within the lowerLimit.
  for ( var idx = 0; idx < loopCount; idx++ ) {
    const candidateValue = upperLimit - idx; // Calculate potential value
    if ( valueSet.indexOf(candidateValue) === -1 ) { // Check for uniqueness
      if ( lowerLimit <= candidateValue ) { // Ensure value is not below lowerLimit
        valueSet.push(candidateValue);
      }
    }
  }

  // Sort the collected values in ascending order using a custom comparison function.
  valueSet.sort(function(val1, val2) {
    if ( val1 < val2 ) {
      return -1; // val1 comes before val2
    }
    if ( val1 > val2 ) {
      return 1; // val1 comes after val2
    }
    return 0; // val1 and val2 are equal
  });

  // Output each unique, sorted value to the console.
  for ( var idx = 0; idx < valueSet.length; idx++ ) {
    console.log(valueSet[idx]);
  }
}

// Invoke the primary function, reading input from standard input stream.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));