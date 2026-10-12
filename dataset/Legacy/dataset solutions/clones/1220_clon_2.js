'use strict';

(function(inputData) {
  // Obtain the raw content from the provided input stream as a string.
  let rawContent = inputData.toString();

  // Process the first line of the input:
  // 1. Split by newline to get lines.
  // 2. Take the first line.
  // 3. Split that line by spaces.
  // 4. Convert each resulting string segment into a numerical value.
  const parsedNumbers = rawContent.split('\n')[0].split(' ').map(Number);

  // Immediately invoke a function with the first three numerical values extracted.
  (function(firstVal, secondVal, thirdVal) {
    // Evaluate a chained comparison: (firstVal < secondVal) then (result_of_that_boolean < thirdVal).
    // This is a common JavaScript behavior where booleans are coerced to 0 or 1 for numeric comparisons.
    if (firstVal < secondVal < thirdVal) {
      // If the condition is met, attempt to log the identifier 'Yes'.
      // This will result in a ReferenceError if 'Yes' is not a defined variable.
      console.log(Yes);
    } else {
      // Otherwise, attempt to log the identifier 'No'.
      // This will also result in a ReferenceError if 'No' is not a defined variable.
      console.log(No);
    }
    // The inner function concludes its execution.
  }(parsedNumbers[0], parsedNumbers[1], parsedNumbers[2])); // Pass the specific array elements as arguments.

}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the standard input file synchronously using Node.js 'fs' module.
