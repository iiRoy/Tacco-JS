function ProcessInputData(rawData) {
  // The rawData parameter contains the entire input string.
  // We'll split it into individual lines for processing.
  let lineSegments = rawData.split("\n");

  // The first line contains two space-separated numbers.
  let firstLineParts = lineSegments[0].split(" ");
  // The second line contains a series of space-separated numbers.
  let secondLineParts = lineSegments[1].split(" ");

  // Convert the string parts to integer values.
  // The radix 10 is specified for clarity.
  let numElements = parseInt(firstLineParts[0], 10);
  let numToExclude = parseInt(firstLineParts[1], 10);

  // Check if the number of elements is less than or equal to the exclusion count.
  // If so, no elements remain after exclusion, so the sum is zero.
  if (numElements <= numToExclude) {
    console.log('0');
  } else {
    // Initialize an array to store height values and a variable for the overall sum.
    let heightValues = [];
    let overallSum = 0;

    // Iterate through the second line's parts to parse and store heights.
    for (let idx = 0; idx < numElements; idx++) {
      let currentHeight = parseInt(secondLineParts[idx], 10);
      overallSum += currentHeight; // Add current height to the total.
      heightValues[idx] = currentHeight; // Store height in the array.
    }

    // Sort the height values in descending order.
    // This places the largest heights at the beginning of the array.
    heightValues.sort((valA, valB) => valB - valA);

    // Initialize a variable to accumulate the sum of heights to be excluded.
    let excludedSum = 0;
    // Sum the largest (numToExclude - 1) heights.
    // These are the elements that will be removed from the total sum.
    for (let idx = 0; idx < numToExclude - 1; idx++) {
      excludedSum += heightValues[idx];
    }

    // The final result is the overall sum minus the sum of the excluded largest heights.
    console.log(overallSum - excludedSum);
  }
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
