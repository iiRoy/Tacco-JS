function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let parsedLines = rawData.split('\n');

  // Parse the number of elements from the first line
  const countElements = parseInt(parsedLines[0].trim(), 10);

  // Parse the threshold value from the second line
  const thresholdValue = parseInt(parsedLines[1].trim(), 10);

  // Parse the array of numbers from the third line
  // Trim whitespace, split by space, and convert each part to an integer
  const elementValues = parsedLines[2].trim().split(' ').map(numStr => parseInt(numStr, 10));

  // Initialize a variable to accumulate the total calculated distance
  let totalDistance = 0;

  // Iterate through each element in the array
  for (let idx = 0; idx < countElements; ++idx) {
    // Calculate distance from zero for the current element
    const distFromZero = elementValues[idx];

    // Calculate distance from the threshold value for the current element
    const distFromThreshold = thresholdValue - elementValues[idx];

    // Select the minimum of the two calculated distances
    const chosenDistance = (distFromZero < distFromThreshold) ? distFromZero : distFromThreshold;

    // Add twice the chosen distance to the running total
    totalDistance += chosenDistance * 2;
  }

  // Output the final accumulated total distance to the console
  console.log(totalDistance);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
