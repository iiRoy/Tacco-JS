function calculateDiscomfort(baseValue, inputArray) {
  let totalDeviation = 0;
  // Iterate through each element of the provided array.
  for (let idx = 0; idx < inputArray.length; idx++) {
    // Calculate the absolute difference between the current array element
    // and the adjusted base value (baseValue + current index + 1).
    totalDeviation += Math.abs(inputArray[idx] - (baseValue + idx + 1));
  }
  return totalDeviation;
}

// Main function to process the input and determine the minimum discomfort.
function processInputData(rawData) {
  // Split the raw input string into an array of lines.
  const dataRows = rawData.split('\n');
  // Parse the first line to get the count of elements.
  const elementCount = parseInt(dataRows[0], 10);
  // Parse the second line, split by space, and convert each part to an integer.
  const initialValues = dataRows[1].split(' ').map(currentElement => parseInt(currentElement, 10));

  // Determine the index of the median element.
  const middlePointIndex = Math.floor(elementCount / 2);
  let adjustedDifferences = [];

  // Populate the adjustedDifferences array.
  // Each element is initialValues[idx] - (idx + 1).
  for (let idx = 0; idx < initialValues.length; idx++) {
    adjustedDifferences.push(initialValues[idx] - (idx + 1));
  }

  // The primary candidate for the optimal offset is the median of adjusted differences.
  const optimalOffset = adjustedDifferences[middlePointIndex];

  // Calculate the minimum discomfort by evaluating three potential offsets:
  // 1. The median offset itself.
  // 2. The offset immediately following the median.
  // 3. The offset two positions after the median.
  let finalOutcome = Math.min(
    calculateDiscomfort(optimalOffset, initialValues),
    calculateDiscomfort(adjustedDifferences[middlePointIndex + 1], initialValues),
    calculateDiscomfort(adjustedDifferences[middlePointIndex + 2], initialValues)
  );

  // Output the calculated minimum discomfort to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
