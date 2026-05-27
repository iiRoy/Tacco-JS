function processInputData(rawData) {
  // Split the entire input string into an array of lines.
  const lineSegments = rawData.split('\n');

  // Parse the first line to extract the count of elements and the target value.
  const firstLineValues = lineSegments[0].split(' ').map(itemStr => parseInt(itemStr));
  const numElements = firstLineValues[0];
  const targetSum = firstLineValues[1];

  // Parse the second line into a list of numerical data.
  const dataList = lineSegments[1].split(' ').map(valStr => parseInt(valStr));

  // Iterate through the data list, accumulating sums from the beginning.
  // The loop variable 'idx' represents the number of elements currently being summed.
  for (var idx = 1; idx <= numElements; idx++) {
    // Calculate the sum of the first 'idx' elements from the dataList.
    var currentSum = dataList.slice(0, idx).reduce((accumulator, currentValue) => accumulator + currentValue);

    // Check if the current accumulated sum has exceeded the target sum.
    if (currentSum > targetSum) {
      // If the sum exceeds, print the count of elements ('idx') that caused this condition.
      console.log(idx);
      return; // Exit the function immediately as the condition is met.
    }
  }

  // If the loop completes without the sum exceeding the target,
  // it means the sum of all 'numElements' did not exceed the target.
  // In this case, print the total number of elements.
  console.log(numElements);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
