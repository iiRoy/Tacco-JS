// This function serves as the primary entry point for processing the given input data.
function ProcessInput(rawData) {
  // The first line of the input contains two space-separated integers.
  // These represent 'numElements' (N) and 'minGroupSize' (K).
  // We parse them into numerical values.
  let [numElements, minGroupSize] = rawData[0].split(" ").map(valStr => parseInt(valStr, 10));

  // Initialize a BigInt variable to store the cumulative sum of combinations.
  // Using BigInt is crucial for handling potentially very large numbers.
  let totalCombinations = 0n;

  // Iterate through possible group sizes, starting from 'minGroupSize' up to 'numElements + 1'.
  // The loop variable 'currentSize' represents the number of elements in the current group.
  for (let currentSize = minGroupSize; currentSize <= numElements + 1; currentSize++) {
    // Calculate the minimum possible sum for a group of 'currentSize' elements.
    // This corresponds to the sum of the smallest 'currentSize' non-negative integers: 0, 1, ..., (currentSize - 1).
    // The sum of an arithmetic series is n * (first + last) / 2.
    // Here, n = currentSize, first = 0, last = currentSize - 1.
    // So, minSum = currentSize * (currentSize - 1) / 2.
    let minSum = BigInt(currentSize) * BigInt(currentSize - 1) / 2n;

    // Calculate the maximum possible sum for a group of 'currentSize' elements.
    // This corresponds to the sum of the largest 'currentSize' integers from 0 to 'numElements'.
    // These integers would be: (numElements - currentSize + 1), ..., numElements.
    // Here, n = currentSize, first = (numElements - currentSize + 1), last = numElements.
    // So, maxSum = currentSize * ((numElements - currentSize + 1) + numElements) / 2.
    let maxSum = BigInt(currentSize) * BigInt((numElements - currentSize + 1) + numElements) / 2n;

    // The number of distinct sums possible for a group of 'currentSize' elements
    // is (maxSum - minSum + 1). Add this quantity to the running total.
    totalCombinations += (maxSum - minSum + 1n);
  }

  // Define the modulo constant as a BigInt. This is 10^9 + 7.
  const MODULO_CONSTANT = 1000000007n;

  // Compute the final result by taking the accumulated total combinations modulo the constant.
  // Then, convert this BigInt result to a string for standard output.
  console.log((totalCombinations % MODULO_CONSTANT).toString());
}

// Read the entire input from standard input.
// The input is expected to be UTF-8 encoded.
// It's then trimmed of leading/trailing whitespace and split into an array of lines.
// This array of lines is passed to the 'ProcessInput' function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
