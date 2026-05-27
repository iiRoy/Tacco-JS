function processInputData(dataLines) {
  // Assign the incoming data lines to a local constant for processing.
  const dataArray = dataLines;

  // Initialize a counter variable to keep track of valid occurrences.
  let resultCounter = 0;

  // Outer loop: iterates through all possible starting indices for substrings.
  for (let outerIndex = 0; outerIndex < dataArray.length; outerIndex++) {
    // Inner loop: iterates through all possible ending indices for substrings,
    // ensuring the ending index is always greater than or equal to the starting index.
    for (let innerIndex = outerIndex; innerIndex <= dataArray.length; innerIndex++) {
      // Extract a substring using the current outer and inner indices.
      // Then, check if this substring (implicitly converted to a number)
      // is perfectly divisible by 2019 and if the substring is not empty
      // (i.e., the start and end indices are different).
      if (dataArray.slice(outerIndex, innerIndex) % 2019 === 0 && outerIndex !== innerIndex) {
        // If both conditions are met, increment the result counter.
        resultCounter += 1;
      }
    }
  }

  // Print the final accumulated count to the standard output.
  console.log(resultCounter);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main data processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
