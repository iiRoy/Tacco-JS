function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Parse the first line to get the number of elements
  const countElements = parseInt(rawData[0], 10);

  // Process the second line: split by space, convert to numbers, and sort in descending order
  const sortedValues = rawData[1]
    .split(" ")
    .map((currentVal) => parseInt(currentVal, 10))
    .sort((valA, valB) => (valA > valB ? -1 : valA === valB ? 0 : 1));

  // Initialize a variable to accumulate the sum
  let totalSum = 0;

  // First loop: calculate the initial total sum based on alternating operations
  for (let idx = 0; idx < countElements; idx++) {
    if (idx % 2 === 0) {
      // Add an element from the beginning of the sorted array
      totalSum += sortedValues[Math.floor(idx / 2)];
    } else {
      // Subtract an element from the end of the sorted array
      totalSum -= sortedValues[countElements - Math.floor(idx / 2 + 1)];
    }
  }

  // Output the calculated total sum
  console.log(totalSum);

  // Conditional logic based on whether countElements is even or odd
  if (countElements % 2 === 0) {
    // If countElements is even, start with the smallest value
    let currentResult = sortedValues[countElements - 1];

    // Loop for N-1 iterations
    for (let idx = 0; idx < countElements - 1; idx++) {
      if (idx % 2 === 0) {
        // Print the current element and the current result
        console.log(sortedValues[Math.floor(idx / 2)] + " " + currentResult);
        // Update currentResult by subtracting it from the current element
        currentResult = sortedValues[Math.floor(idx / 2)] - currentResult;
      } else {
        // Print the current element (from the end) and the current result
        console.log(
          sortedValues[countElements - Math.floor(idx / 2 + 1)] +
            " " +
            currentResult
        );
        // Update currentResult by subtracting it from the current element (from the end)
        currentResult =
          sortedValues[countElements - Math.floor(idx / 2 + 1)] - currentResult;
      }
    }
  } else {
    // If countElements is odd, start with the largest value
    let currentResult = sortedValues[0];

    // Loop for N-1 iterations, starting from idx = 1
    for (let idx = 1; idx < countElements; idx++) {
      if (idx % 2 === 0) {
        // Print the current element and the current result
        console.log(sortedValues[Math.floor(idx / 2)] + " " + currentResult);
        // Update currentResult by subtracting it from the current element
        currentResult = sortedValues[Math.floor(idx / 2)] - currentResult;
      } else {
        // Print the current element (from the end) and the current result
        console.log(
          sortedValues[countElements - Math.floor(idx / 2 + 1)] +
            " " +
            currentResult
        );
        // Update currentResult by subtracting it from the current element (from the end)
        currentResult =
          sortedValues[countElements - Math.floor(idx / 2 + 1)] - currentResult;
      }
    }
  }
}

// This line should not be modified (reads from standard input and calls the main function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
