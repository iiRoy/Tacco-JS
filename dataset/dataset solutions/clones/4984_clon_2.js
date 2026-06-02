function processInputData(rawDataString) {
  // Initialize the primary accumulator by converting the entire input string to an integer.
  let grandSum = parseInt(rawDataString);

  // Iterate through each character position of the provided input string.
  for (let outerIndex = 0; outerIndex < rawDataString.length; outerIndex++) {
    // Declare and initialize a temporary variable to hold a running sum of prefix digits.
    let prefixSum = 0;

    // Calculate the sum of individual digits from the beginning of the string up to the current outerIndex.
    for (let prefixIndex = 0; prefixIndex < outerIndex; prefixIndex++) {
      prefixSum += parseInt(rawDataString.substr(prefixIndex, 1));
    }

    // Invoke a helper function to perform a sub-calculation and add its result to the grand sum.
    // The helper receives the full input, the current outer loop index, and the accumulated prefix sum.
    grandSum += computeSubtotals(rawDataString, outerIndex, prefixSum);
  }

  // Display the final computed grand sum to the standard output.
  console.log(grandSum);
}

// This auxiliary function calculates a specific subtotal based on string segments.
function computeSubtotals(rawDataString, segmentStartPos, prefixSum) {
  // Initialize a local accumulator for this particular subtotal calculation.
  let currentSubtotal = 0;

  // Loop through various possible lengths for a segment starting at segmentStartPos.
  // The loop continues as long as there are characters available for the segment.
  for (let innerLoopCounter = 1; innerLoopCounter < rawDataString.length - segmentStartPos; innerLoopCounter++) {
    // Add the pre-calculated prefix sum to the current subtotal.
    currentSubtotal += prefixSum;

    // Parse and add the integer value of a substring segment.
    // This segment starts at segmentStartPos and has a length determined by innerLoopCounter.
    currentSubtotal += parseInt(rawDataString.substr(segmentStartPos, innerLoopCounter));

    // Parse and add the integer value of the remaining part of the string.
    // This part starts immediately after the current segment.
    currentSubtotal += parseInt(rawDataString.substr(innerLoopCounter + segmentStartPos));
  }

  // Return the accumulated subtotal from this function's execution.
  return currentSubtotal;
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
