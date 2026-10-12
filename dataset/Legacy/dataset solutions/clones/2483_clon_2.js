function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Remove the last element if it's an empty string (common with stdin)
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Parse the first line for N (itemCount) and K (maxOperations)
  const firstLineParts = rawData[0].split(' ');
  const itemCount = firstLineParts[0] - 0; // Convert to number
  const maxOperations = firstLineParts[1] - 0; // Convert to number

  // Parse the second line for array A (valuesArr), convert to numbers, and sort ascending
  var valuesArr = rawData[1].split(' ').map(element => {
    return element - 0; // Convert string to number
  }).sort((valA, valB) => {
    return valA - valB; // Ascending sort
  });

  // Parse the third line for array F (factorsArr), convert to numbers, and sort descending
  var factorsArr = rawData[2].split(' ').map(element => {
    return element - 0; // Convert string to number
  }).sort((valA, valB) => {
    return valB - valA; // Descending sort
  });

  // Initialize the upper bound for binary search
  // This represents the maximum possible value for the answer
  var upperBound = 0;
  for (var idx = 0; idx < itemCount; idx++) {
    upperBound = Math.max(upperBound, valuesArr[idx] * factorsArr[idx]);
  }

  // Initialize the lower bound for binary search
  // This represents the minimum impossible value for the answer
  var lowerBound = -1;

  // Declare variables for the binary search loop
  var midValue;
  var currentSum;

  // Perform binary search to find the minimum possible value that satisfies the condition
  while (upperBound - lowerBound > 1) {
    // Calculate the midpoint (potential answer)
    midValue = Math.ceil((lowerBound + upperBound) / 2);
    currentSum = 0; // Reset sum for each iteration

    // Calculate the total operations needed for the current midValue
    for (var idx = 0; idx < itemCount; idx++) {
      // For each item, calculate how many operations are needed
      // An operation reduces A[i] by 1. We want A[i] * F[i] <= midValue
      // So, A[i] <= midValue / F[i].
      // The number of operations is A[i] - floor(midValue / F[i]).
      // We only count positive operations.
      currentSum += Math.max(0, valuesArr[idx] - Math.floor(midValue / factorsArr[idx]));
    }

    // Adjust the search range based on the calculated sum
    if (currentSum <= maxOperations) {
      // If the sum of operations is within K, this midValue is possible or better
      upperBound = midValue;
    } else {
      // If the sum of operations exceeds K, this midValue is too low
      lowerBound = midValue;
    }
  }

  // The final answer is the smallest possible value found
  console.log(upperBound);
}

// This part handles reading input from standard input and calling the main function.
// Do not modify the code below this line.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
