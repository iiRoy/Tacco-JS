function processInput(dataInput) {
  // Parse the first line of input to extract the number of items (N) and max operations (K).
  let tempArr = dataInput[0].split(" ");
  let numItems = tempArr[0]; // Represents N from the original problem
  let maxOperations = tempArr[1]; // Represents K from the original problem

  // Parse the second line for the array of item costs.
  let itemCosts = dataInput[1].split(" ");
  // Parse the third line for the array of factor values.
  let factorValues = dataInput[2].split(" ");

  // Sort the 'itemCosts' array in descending order.
  itemCosts.sort(function(valA, valB) {
    if (valA > valB) return -1; // Place valA before valB for descending order
    if (valA < valB) return 1;  // Place valB before valA
    return 0;                   // Maintain relative order if values are equal
  });

  // Sort the 'factorValues' array in ascending order.
  factorValues.sort(function(elemX, elemY) {
    if (elemX > elemY) return 1;  // Place elemY before elemX for ascending order
    if (elemX < elemY) return -1; // Place elemX before elemY
    return 0;                     // Maintain relative order if values are equal
  });

  // Initialize bounds for a binary search.
  // 'upperBound' is the maximum possible value for the answer.
  let upperBound = 1000000;
  // 'lowerBound' is the minimum possible value for the answer.
  let lowerBound = 0;

  // Execute a binary search to find the optimal value.
  while (lowerBound + 1 < upperBound) {
    // Calculate the midpoint of the current search range.
    let midPoint = (lowerBound + upperBound) / 2;
    let currentSum = 0; // Accumulator for the total operations needed.

    // Iterate through each item to calculate the sum of operations.
    for (let idx = 0; idx < numItems; idx++) {
      // Add the maximum of (cost - midPoint / factor) or 0 to the sum.
      currentSum += Math.max(itemCosts[idx] - midPoint / factorValues[idx], 0);
    }

    // Adjust the search range based on whether the current sum exceeds maxOperations.
    if (currentSum <= maxOperations) {
      upperBound = midPoint; // If sum is acceptable, try a smaller midPoint.
    } else {
      lowerBound = midPoint; // If sum is too high, midPoint is too low, so increase lowerBound.
    }
  }

  // Output the final lower and upper bounds found by the binary search.
  console.log("d:%s t:%s", lowerBound, upperBound);
}

// Read input from standard input, split by newlines, and pass to the processing function.
processInput(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);
