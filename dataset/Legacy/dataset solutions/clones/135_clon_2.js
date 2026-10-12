(function (rawData) {
  // Remove trailing newline and split the input into individual lines.
  var processedLines = rawData.replace(/\n$/, '').split('\n');

  // The first line indicates the number of test cases to process.
  var numIterations = Number(processedLines.shift());

  // Iterate through each test case.
  for (var idx = 0; idx < numIterations; idx++) {
    // Parse the current line into an array of numbers.
    var currentNumbers = processedLines.shift().split(' ').map(Number);

    // Call the sequence checking function and print its result.
    console.log(checkSequence(currentNumbers));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.

/**
 * Checks if a sequence of numbers, after filtering, is strictly increasing.
 * @param {number[]} inputArray - The array of numbers to process.
 * @returns {string} 'YES' if the filtered sequence is strictly increasing, 'NO' otherwise.
 */
function checkSequence(inputArray) {
  var intermediateList = []; // This will store elements less than or equal to the first element.
  var currentVal; // Temporary variable to hold shifted elements.

  // Get the first element of the input array; this acts as a threshold.
  var initialThreshold = inputArray.shift();

  // Process the remaining elements in the input array.
  while ((currentVal = inputArray.shift()) !== undefined) {
    // If the current element is greater than the initial threshold, skip it.
    if (currentVal > initialThreshold) {
      continue;
    }
    // Otherwise, add it to our intermediate list.
    intermediateList.push(currentVal);
  }

  // Initialize a variable to track the maximum value encountered so far in the intermediate list.
  var maximumSeen = -Infinity;

  // Now, iterate through the intermediate list.
  while ((currentVal = intermediateList.shift()) !== undefined) {
    // If the current element is greater than the maximum seen so far, update the maximum.
    if (currentVal > maximumSeen) {
      maximumSeen = currentVal;
      continue; // Continue checking the rest of the list.
    }
    // If the current element is NOT greater than the maximum seen, the sequence is not strictly increasing.
    return 'NO';
  }

  // If we've processed the entire intermediate list and haven't returned 'NO',
  // it means the sequence was strictly increasing.
  return 'YES';
}
