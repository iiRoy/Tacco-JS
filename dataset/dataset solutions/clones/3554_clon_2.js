'use func mode'; // Enforce a stricter operational environment for script execution

function ExecuteTask(dataStream) { // Primary entry point for processing the provided input stream
  // Extract the total count of numerical elements from the first line of the input
  const totalItems = Number(dataStream.split('\n')[0].split(' ')[0]);

  // Obtain the specific reference value 'X' from the first line of the input data
  const referencePoint = Number(dataStream.split('\n')[0].split(' ')[1]);

  // Process the second line:
  // 1. Split by newline to get the second line.
  // 2. Split by space to get individual string representations of numbers.
  // 3. Map each string to its absolute difference from the 'referencePoint'.
  let distanceCollection = dataStream
    .split('\n')[1]
    .split(' ')
    .map(itemVal => Math.abs(Number(itemVal) - referencePoint));

  // Sort the collection of calculated distances in ascending numerical order.
  distanceCollection.sort((firstVal, secondVal) => (firstVal > secondVal ? 1 : -1));

  /**
   * Recursive function to compute the Greatest Common Divisor (GCD) of two non-negative integers.
   * This implementation utilizes the efficient Euclidean algorithm.
   *
   * @param {number} valA - The first positive integer for GCD calculation.
   * @param {number} valB - The second positive integer for GCD calculation.
   * @returns {number} The greatest common divisor of valA and valB.
   */
  const computeCommonFactor = (valA, valB) => {
    if (valB === 0) { // Base termination condition for the recursion
      return valA;
    } else {
      return computeCommonFactor(valB, valA % valB); // Recursive call with remainder
    }
  };

  // Conditional logic to handle cases based on the size of the distanceCollection.
  if (distanceCollection.length === 1) {
    console.log(distanceCollection[0]); // If there's only one distance, that's the result.
  } else {
    // Initialize the cumulative greatest common divisor using the first two elements.
    let resultantGCD = computeCommonFactor(distanceCollection[0], distanceCollection[1]);

    // Iterate through the remaining elements in the collection, starting from the third one.
    // Continuously update the resultantGCD by finding the GCD with each subsequent element.
    for (let currentIdx = 2; currentIdx < totalItems; currentIdx++) {
      resultantGCD = computeCommonFactor(resultantGCD, distanceCollection[currentIdx]);
    }

    console.log(resultantGCD); // Output the final computed greatest common divisor.
  }
}

// Initiate the primary processing function.
// It reads the entire content from standard input, decodes it as UTF-8,
// removes any leading/trailing whitespace, and passes it to ExecuteTask.
ExecuteTask(
  require("node:fs")
    .readFileSync("/dev/stdin", { encoding: "utf8" })
    .trim()
);