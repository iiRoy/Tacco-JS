function ProcessInputData(rawData) {
  // The input string is split into individual lines.
  let lineSegments = rawData.split("\n");

  // The second line is further split by spaces to get string representations of numbers.
  let valueStrings = lineSegments[1].split(" ");

  // The first line contains the count of elements, parsed as an integer.
  const countOfElements = parseInt(lineSegments[0], 10);

  // Convert all string values from the second line into an array of integers.
  let numericSequence = parseAllIntegers(valueStrings);

  // Calculate the total sum of all numbers in the sequence.
  let totalSum = 0;
  for (let idx = 0; idx < numericSequence.length; idx++) {
    totalSum += numericSequence[idx];
  }

  // Calculate the sum of elements at odd indices (1, 3, 5, ...) in the sequence.
  let oddIndexedSum = 0;
  for (let idx = 1; idx < numericSequence.length; idx += 2) {
    oddIndexedSum += numericSequence[idx];
  }

  // Compute the initial value for the resultant sequence based on total and odd-indexed sums.
  let initialCalculatedValue = totalSum - (2 * oddIndexedSum);

  // Initialize an array to store the final calculated sequence.
  let resultantSequence = [];
  resultantSequence[0] = initialCalculatedValue;

  // Iterate to compute the remaining elements of the resultant sequence.
  for (let idx = 1; idx < numericSequence.length; idx++) {
    resultantSequence[idx] = (numericSequence[idx - 1] - (resultantSequence[idx - 1] / 2)) * 2;
  }

  // Output the formatted result to the console.
  console.log('%s', formatOutputString(resultantSequence));
}

// Helper function to convert an array of string numbers to an array of integers.
function parseAllIntegers(stringArray) {
  let parsedNumbers = [];
  for (let k = 0; k < stringArray.length; k++) {
    parsedNumbers[k] = parseInt(stringArray[k]);
  }
  return parsedNumbers;
}

// Helper function to format an array of numbers into a space-delimited string with a newline.
function formatOutputString(dataElements) {
  let formattedText = dataElements.join(' ');
  formattedText += '\n';
  return formattedText;
}

// This section handles standard input/output and invokes the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
