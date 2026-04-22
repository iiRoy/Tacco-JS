// Function to handle and process textual input data
function ProcessInputData(sourceText) {
  // Split the entire input source string into an array of individual lines.
  const textLines = sourceText.split('\n');

  // Parse the first line to get the total quantity of elements.
  const quantityOfElements = parseInt(textLines[0], 0xA);

  // Take the second line, split it by spaces, and convert each part to an integer.
  const numericValues = textLines[1].split(' ').map(elementString => parseInt(elementString, 0xA));

  // Initialize a variable to store the highest value found in the numeric data.
  let highestValue = 0x0;

  // Iterate through the numeric values to find the absolute highest number.
  for (let currentValue of numericValues)
    highestValue = currentValue > highestValue ? currentValue : highestValue;

  // Create a frequency container (an array acting as buckets) initialized with zeros.
  const frequencyContainer = new Array(highestValue + 0x2).fill(0x0);

  // Declare an array to hold the calculated sums of adjacent frequencies.
  const summedTriplets = [];

  // Populate the frequency container by counting occurrences of each number.
  for (let dataPointIndex = 0x0; dataPointIndex < quantityOfElements; dataPointIndex++) {
    frequencyContainer[numericValues[dataPointIndex]]++;
  }

  // Calculate the sums of current, previous, and next frequencies for each bin.
  for (let containerIndex = 0x0; containerIndex <= highestValue; containerIndex++) {
    if (containerIndex === 0x0) {
      // Special case for the first element (sum of current and next bin).
      summedTriplets.push(frequencyContainer[containerIndex] + frequencyContainer[containerIndex + 0x1]);
    } else {
      // General case: sum of previous, current, and next bins.
      summedTriplets.push(
        frequencyContainer[containerIndex - 0x1] +
        frequencyContainer[containerIndex] +
        frequencyContainer[containerIndex + 0x1]
      );
    }
  }

  // Reset the 'highestValue' variable to find the maximum sum.
  let maximumSum = 0x0;

  // Iterate through the calculated sums to find the overall maximum sum.
  for (let currentSumValue of summedTriplets)
    maximumSum = currentSumValue > maximumSum ? currentSumValue : maximumSum;

  // Print the final maximum sum to the standard output.
  console.log(maximumSum);
}

// Acquire the Node.js file system module for reading input.
const fileSystemModule = require('fs');

// Invoke the data processing function, reading input from a specific path.
ProcessInputData(
  fileSystemModule.readFileSync('/dev/input_stream', 'utf8')
);