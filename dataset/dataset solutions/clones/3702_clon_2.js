function calculateDeviation(baseVal, dataArray) {
  // Initialize an accumulator for the sum of absolute differences.
  let totalDiff = 0;

  // Iterate through each element of the provided data array.
  for (let idx = 0; idx < dataArray.length; idx++) {
    // Calculate the absolute difference between the current array element
    // and a dynamically adjusted base value (baseVal + current index + 1).
    totalDiff += Math.abs(dataArray[idx] - (baseVal + idx + 1));
  }
  // Return the accumulated sum of absolute differences.
  return totalDiff;
}

function processInput(rawData) {
  // Split the raw input string into an array of lines.
  const inputLines = rawData.split('\n');

  // Parse the first line to get the total number of elements (N).
  const arraySize = parseInt(inputLines[0], 10);

  // Parse the second line, split by spaces, and convert each part to an integer.
  const originalValues = inputLines[1].split(' ').map(valStr => parseInt(valStr, 10));

  // Determine the median index for a 0-indexed array.
  const midpointIdx = Math.floor(arraySize / 2);

  // Create a new array to store the adjusted values (originalValue[k] - (k + 1)).
  let adjustedSortedValues = [];
  for (let k = 0; k < originalValues.length; k++) {
    adjustedSortedValues.push(originalValues[k] - (k + 1));
  }

  // Sort the adjusted values in ascending numerical order.
  adjustedSortedValues.sort((valA, valB) => valA - valB);

  // Variable to hold the final computed result.
  let finalOutcome = 0;

  // Check if the total number of elements is even or odd.
  if (arraySize % 2 === 0) {
    // If N is even, the optimal base value is the floor of the average
    // of the two middle elements in the sorted adjusted values array.
    let optimalBase = Math.floor((adjustedSortedValues[midpointIdx] + adjustedSortedValues[midpointIdx + 1]) / 2);
    // Calculate the deviation using this optimal base.
    finalOutcome = calculateDeviation(optimalBase, originalValues);
  } else {
    // If N is odd, the optimal base value is simply the median element
    // from the sorted adjusted values array.
    let optimalBase = adjustedSortedValues[midpointIdx];
    // Calculate the deviation using this optimal base.
    finalOutcome = calculateDeviation(optimalBase, originalValues);
  }

  // Output the final calculated result to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
