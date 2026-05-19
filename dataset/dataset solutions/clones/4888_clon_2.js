function ProcessInput(rawData) {
  // Helper to convert a line into an array of strings
  const parseStringArray = function(inputLine) {
    let tokenArray = inputLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (let idx = 0; idx < tokenArray.length; ++idx) {
      // No conversion needed, just keeping the loop structure
      tokenArray[idx] = tokenArray[idx];
    }
    return tokenArray;
  };

  // Helper to convert a line into an array of numbers
  const parseNumberArray = function(inputLine) {
    let tokenArray = inputLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (let idx = 0; idx < tokenArray.length; ++idx) {
      tokenArray[idx] = +tokenArray[idx]; // Convert to number
    }
    return tokenArray;
  };

  // Helper to determine the smaller of two values
  const findMinimum = function(val1, val2) {
    return val1 > val2 ? val2 : val1;
  };

  // Split the entire input into individual lines
  const inputLines = rawData.split("\n");

  // Parse the first line for N and T
  const firstLineData = parseNumberArray(inputLines[0]);
  const elementCount = firstLineData[0];
  const thresholdValue = firstLineData[1];

  // Parse the second line for the array 'a'
  const dataPoints = parseNumberArray(inputLines[1]);

  let maxProfit = 0;
  let profitOccurrences = 0;
  let currentMin = dataPoints[0];
  let currentMax = dataPoints[0]; // This variable is declared but not used in the original logic

  // Handle the special case where there's only one element
  if (elementCount === 1) {
    console.log("0");
  }

  // Iterate through the data points to find max profit and its occurrences
  for (let idx = 0; idx < elementCount; ++idx) {
    const currentValue = dataPoints[idx];

    // Check if the current profit (currentValue - currentMin) is greater than the recorded maxProfit
    if (currentValue - currentMin > maxProfit) {
      maxProfit = currentValue - currentMin;
      profitOccurrences = 1; // Reset count as a new max profit is found
    } else if (currentValue - currentMin === maxProfit && maxProfit !== 0) {
      // If current profit equals maxProfit and maxProfit is not zero, increment count
      profitOccurrences++;
    }

    // Update the minimum value encountered so far
    currentMin = currentValue < currentMin ? currentValue : currentMin;
  }

  // Output the minimum of profit occurrences or floor(T/2)
  console.log(findMinimum(profitOccurrences, Math.floor(thresholdValue / 2)));
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
