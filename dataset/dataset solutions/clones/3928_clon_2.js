function ProcessInput(inputString) {
  // Split the entire input string into an array of individual lines.
  let lineArray = inputString.split("\n");

  // The first line contains the number of entries (N). Convert it to a numeric type.
  const numEntries = +lineArray[0];

  // Initialize a variable to accumulate the sum of the first elements of pairs.
  let totalSum = 0;

  // Initialize a variable to track the minimum second element of pairs where the first is greater than the second.
  // Use a very large number as an initial sentinel value, representing an "infinity" for comparison.
  let minValToSubtract = 1e10; // A large floating-point number.

  // Iterate through each of the N entries, starting from the second line of the input.
  for (let idx = 0; idx < numEntries; idx++) {
    // Get the current line, split it by space, and convert each resulting part to a number.
    // The actual data lines start from index 1 in the lineArray.
    let currentPair = lineArray[idx + 1].split(" ").map(item => +item);

    // Check if the first element of the current pair is strictly greater than its second element.
    if (currentPair[0] > currentPair[1]) {
      // If the condition is met, update minValToSubtract with the smaller of its current value
      // and the second element of the current pair.
      minValToSubtract = Math.min(minValToSubtract, currentPair[1]);
    }

    // Add the first element of the current pair to the running total sum.
    totalSum += currentPair[0];
  }

  // After processing all entries, determine the final sum based on whether a valid minimum was found.
  if (minValToSubtract === 1e10) {
    // If minValToSubtract is still its initial sentinel value, it means no pair satisfied the condition
    // (first element > second element). In this specific case, the problem requires the total sum to be 0.
    totalSum = 0;
  } else {
    // Otherwise, a valid minimum second element was found, so subtract it from the total sum.
    totalSum -= minValToSubtract;
  }

  // Output the final calculated sum to the standard console.
  console.log(totalSum);
}

// Read the entire content from standard input synchronously using Node.js file system module.
// The content is expected to be UTF-8 encoded.
// Then, invoke the main processing function with the obtained input string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
