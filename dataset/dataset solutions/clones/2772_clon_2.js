"use strict"; // Enforce strict mode for cleaner code and better error handling

// This is an Immediately Invoked Function Expression (IIFE)
// It takes the raw input string as an argument.
(function(rawDataString){
  // Remove any leading or trailing whitespace from the entire input string.
  let currentProcessedInput = rawDataString.trim();

  // Split the cleaned input string into an array of lines.
  // It uses one or more newline characters as the delimiter.
  currentProcessedInput = currentProcessedInput.split(/\n+/);

  // Extract the first line, convert it to a number, and store it as the total count.
  const totalElementCount = currentProcessedInput[0] - 0;

  // Extract the second line, split it by one or more whitespace characters,
  // and then convert each resulting string item into a number.
  const numericalDataSet = currentProcessedInput[1].split(/\s+/).map(singleNumericItem => singleNumericItem - 0);

  // Initialize an accumulator variable with the last element of the numerical data set.
  let runningCalculationValue = numericalDataSet[totalElementCount - 1];

  // Iterate through the first half of the array (excluding the last element).
  // This loop performs an alternating subtraction and addition operation.
  for (let iterationIndex = 0; iterationIndex < (totalElementCount - 1) / 2; iterationIndex++) {
    // Subtract the element at the current even index.
    runningCalculationValue -= numericalDataSet[2 * iterationIndex];
    // Add the element at the next odd index.
    runningCalculationValue += numericalDataSet[2 * iterationIndex + 1];
  }

  // Create an array to store the results in reverse order, starting with the final accumulated value.
  const computedValuesReversed = [runningCalculationValue];

  // Loop backwards from the second-to-last element down to the first element.
  for (let reverseIterationIndex = totalElementCount - 2; reverseIterationIndex >= 0; reverseIterationIndex--) {
    // Calculate the next value using the current element from the data set
    // and the most recently added value in the `computedValuesReversed` array.
    const nextCalculatedTerm = 2 * numericalDataSet[reverseIterationIndex] - computedValuesReversed[computedValuesReversed.length - 1];
    // Add this newly calculated term to the end of the reversed results array.
    computedValuesReversed.push(nextCalculatedTerm);
  }

  // Reverse the array to obtain the final sequence of results in the correct order.
  const finalOutputSequence = computedValuesReversed.reverse();

  // Print the elements of the final sequence, joined by a single space, to the console.
  console.log(finalOutputSequence.join(" "));

// The IIFE is immediately invoked with the content of standard input.
// It reads the entire file synchronously as a UTF-8 string.
})(require("fs").readFileSync("/dev/stdin","utf8"));
