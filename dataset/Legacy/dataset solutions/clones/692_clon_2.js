let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input data from standard input
const lineData = rawData.trim().split("\n"); // Clean up input and split into an array of lines

while (true) { // Begin main processing loop
  let currentNum = lineData.shift() - 0; // Extract the next number from the input array and convert to numeric type

  if (currentNum === 0) { // Check for termination condition
    break; // Exit the loop if the number is zero
  }

  const cubeOfNum = currentNum * currentNum * currentNum; // Compute the cube of the current number
  let resultValues = []; // Initialize an array to store positive differences

  // Outer loop: iterate from (currentNum - 1) down to 1
  for (let outerIndex = currentNum - 1; outerIndex > 0; outerIndex--) {
    // Inner loop: iterate from outerIndex down to 1
    for (let innerIndex = outerIndex; innerIndex > 0; innerIndex--) {
      // Calculate the difference: cubeOfNum - (outerIndex^3) - (innerIndex^3)
      const difference = cubeOfNum - (outerIndex * outerIndex * outerIndex) - (innerIndex * innerIndex * innerIndex);

      if (difference > 0) { // If the calculated difference is positive
        resultValues.push(difference); // Add it to our collection of results
      }
    }
  }

  // Output the smallest positive difference found among the calculated values
  console.log(Math.min.apply(null, resultValues));
}
