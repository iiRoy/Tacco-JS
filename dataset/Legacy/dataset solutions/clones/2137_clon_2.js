function ProcessInput(rawData) {
  // Split the entire input string into an array of lines.
  // Each line becomes an element in the 'lineData' array.
  let lineData = rawData.split("\n");

  // The first line contains the count of elements.
  // Split the first line by space to get its components.
  const firstLineParts = lineData[0].split(" ");

  // The second line contains the actual numeric data.
  // Split the second line by space to get its components.
  const secondLineParts = lineData[1].split(" ");

  // Parse the first component of the first line as an integer.
  // This represents the number of elements to process.
  const elementCount = parseInt(firstLineParts[0], 10);

  // Initialize an array to store the parsed numeric values.
  const numericValues = [];

  // Loop through the second line's components and parse them into integers.
  // Store these integers in the 'numericValues' array.
  for (let idx = 0; idx < elementCount; idx++) {
    const currentValue = parseInt(secondLineParts[idx], 10);
    numericValues[idx] = currentValue;
  }

  // Determine the minimum and maximum values present in the 'numericValues' array.
  const minimumVal = Math.min(...numericValues);
  const maximumVal = Math.max(...numericValues);

  // Initialize an array to store the calculated costs (sum of squares).
  const costArray = [];

  // Initialize a variable to accumulate the sum of squares for each target value.
  let currentSumOfSquares = 0;

  // Iterate through all possible target values from 'minimumVal' to 'maximumVal' (inclusive).
  for (let targetVal = minimumVal; targetVal <= maximumVal; targetVal++) {
    // For each 'targetVal', calculate the sum of squared differences.
    for (let idx = 0; idx < elementCount; idx++) {
      const individualVal = numericValues[idx];
      // Calculate the difference between the current individual value and the target value.
      const difference = individualVal - targetVal;
      // Add the square of this difference to the running sum.
      currentSumOfSquares = currentSumOfSquares + difference * difference;
    }
    // Store the accumulated sum of squares for the current 'targetVal' in 'costArray'.
    costArray[targetVal] = currentSumOfSquares;
    // Reset the sum for the next 'targetVal' iteration.
    currentSumOfSquares = 0;
  }

  // Remove elements from the beginning of 'costArray' up to 'minimumVal'.
  // This aligns the array so that costArray[0] now corresponds to the cost for 'minimumVal'.
  costArray.splice(0, minimumVal);

  // Find the smallest value within the modified 'costArray'.
  const finalResult = Math.min(...costArray);

  // Output the final calculated minimum cost to the console.
  console.log(finalResult);
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
