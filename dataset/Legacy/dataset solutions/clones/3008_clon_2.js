function processInput(rawData) {
  // Extract the number of elements from the first line of input.
  const countElements = rawData.split('\n')[0];

  // Parse the second line into an array of integer values.
  const valueArray = rawData.split('\n')[1].split(' ').map((strNum) => parseInt(strNum, 10));

  // Parse the third line into an array of integer costs.
  const costArray = rawData.split('\n')[2].split(' ').map((strNum) => parseInt(strNum, 10));

  // Initialize a variable to accumulate the total profit.
  let totalProfit = 0;

  // Iterate through the arrays to calculate the profit for each item.
  for (let idx = 0; idx < countElements; idx++) {
    // Calculate the difference between value and cost.
    const currentDifference = valueArray[idx] - costArray[idx];

    // If the difference is non-negative, add it to the total profit.
    if (currentDifference >= 0) {
      totalProfit += currentDifference;
    }
  }

  // Output the final calculated total profit.
  console.log(totalProfit);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
