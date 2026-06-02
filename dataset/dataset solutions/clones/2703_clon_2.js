function processInput(rawData) {
  // Parse the first line to get the count value
  const countVal = parseInt(rawData.split("\n")[0], 10);

  // Extract and parse the first array of numbers
  const firstArray = rawData.split('\n')[1].split(' ').map((numStr) => parseInt(numStr, 10));

  // Extract and parse the second array of numbers
  const secondArray = rawData.split('\n')[2].split(' ').map((valStr) => parseInt(valStr, 10));

  // Initialize arrays to store computed results and remaining values
  let resultantValues = [];
  let remainingB = [];

  // Iterate through the arrays to perform calculations
  for (let idx = 0; idx < countVal + 1; idx++) {
    if (idx === 0) {
      // Special handling for the first element
      if (firstArray[idx] >= secondArray[idx]) {
        resultantValues[idx] = secondArray[idx];
        remainingB[idx] = 0;
      } else {
        resultantValues[idx] = firstArray[idx];
        remainingB[idx] = secondArray[idx] - firstArray[idx];
      }
    } else {
      // General handling for subsequent elements
      if (firstArray[idx] - remainingB[idx - 1] >= secondArray[idx]) {
        resultantValues[idx] = remainingB[idx - 1] + secondArray[idx];
        remainingB[idx] = 0;
      } else {
        resultantValues[idx] = firstArray[idx];
        remainingB[idx] = secondArray[idx] - (firstArray[idx] - remainingB[idx - 1]);
      }
    }
  }

  // Define a helper function to calculate the sum of an array
  const calculateTotal = function(dataCollection) {
    let totalAccumulator = 0;
    for (let loopIndex = 0; loopIndex < dataCollection.length; loopIndex++) {
      totalAccumulator += dataCollection[loopIndex];
    }
    return totalAccumulator;
  };

  // Output the sum of the resultant values
  console.log(calculateTotal(resultantValues));
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
