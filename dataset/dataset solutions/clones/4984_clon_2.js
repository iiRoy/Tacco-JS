// This function orchestrates the primary data processing.
function processInput(dataString) {
  // Initialize the main accumulation variable by parsing the entire input string.
  var cumulativeSum = parseInt(dataString);

  // Iterate through each character position in the provided data string.
  for ( var outerIndex = 0; outerIndex < dataString.length; outerIndex++ ) {
    // A temporary sum for the current segment, initialized to zero.
    var segmentSum = 0;

    // Calculate a preliminary sum based on characters preceding the outer index.
    for ( var innerIndex = 0; innerIndex < outerIndex; innerIndex++ ) {
      segmentSum += parseInt(dataString.substr(innerIndex, 1));
    }
    // Add the result of a secondary calculation to the overall cumulative sum.
    cumulativeSum += calculatePartialSum(dataString, outerIndex, segmentSum);
  }
  // Output the final accumulated sum to the console.
  console.log(cumulativeSum);
}

// This auxiliary function computes a specific partial sum based on given parameters.
function calculatePartialSum(dataString, currentLength, segmentSum) {
  // Initialize a local sum variable for this computation.
  var localSum = 0;

  // Loop through a range determined by the data string's length and the current segment length.
  for ( var iterator = 1; iterator < dataString.length - currentLength; iterator++ ) {
    // Accumulate the provided segment sum.
    localSum += segmentSum;
    // Add a parsed substring starting from currentLength with length 'iterator'.
    localSum += parseInt(dataString.substr(currentLength, iterator));
    // Add a parsed substring starting from (iterator + currentLength) to the end of the string.
    localSum += parseInt(dataString.substr(iterator + currentLength));
  }
  // Return the calculated local sum from this function.
  return localSum;
}

// Invoke the primary processing function with input read from standard input,
// assuming the input is a UTF-8 encoded string.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));