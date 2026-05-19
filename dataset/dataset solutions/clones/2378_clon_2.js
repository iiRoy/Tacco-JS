function ProcessInput(rawData) {
  // Process the raw input string into a 2D array of strings
  let parsedData = rawData.trim().split("\n").map(function(lineSegment) {
    return lineSegment.split(" ");
  });

  // Extract the number of elements from the first line
  const countElements = parseInt(parsedData[0][0], 10);

  // Initialize an array to keep track of color counts (e.g., [1, 0, 0] could mean one '0', zero '1', zero '2')
  let colorCounts = [1, 0, 0];

  // Declare temporary variables for iteration
  let currentValue;
  let matchingCount;

  // Initialize the final result with a starting value
  let finalResult = 3;

  // Loop through the elements starting from the second one
  for (let idx = 1; idx < countElements; idx++) {
    matchingCount = 0; // Reset the counter for each iteration

    // Parse the current element from the second line of input
    currentValue = parseInt(parsedData[1][idx], 10);

    // Count how many times the currentValue appears in the colorCounts array
    for (const colorVal of colorCounts) {
      if (colorVal === currentValue) {
        matchingCount++;
      }
    }

    // Multiply the final result by the number of matches
    finalResult *= matchingCount;
    // Apply modulo operation to keep the result within a specific range
    finalResult %= 1000000007; // Equivalent to (1e+9 + 7)

    // Update the colorCounts array based on the currentValue
    for (let colorIdx = 0; colorIdx < 3; colorIdx++) {
      if (colorCounts[colorIdx] === currentValue) {
        colorCounts[colorIdx]++; // Increment the count for the matched color
        break; // Exit the inner loop once a match is found and updated
      }
    }
  }

  // Check a specific condition for the first element of the second line
  // If it's not zero, the final result should be zero
  if (parseInt(parsedData[1][0], 10) !== 0) {
    finalResult = 0;
  }

  // Output the computed final result to the console
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
