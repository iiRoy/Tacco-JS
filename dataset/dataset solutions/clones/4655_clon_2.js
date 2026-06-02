"use strict"; // Enforce strict mode for the entire script

/**
 * Processes raw input data to compute a specific sum based on a defined algorithm.
 * This function reads numerical data, sorts it, and then sums specific elements.
 * @param {string} rawInputData - The complete raw string input, typically from standard input.
 */
function ProcessDataStream(rawInputData) {
  // First, clean up the input string by removing leading/trailing whitespace
  // and then splitting it into an array of individual lines.
  let parsedLines = rawInputData.trim().split('\n');

  // Extract the first number from the first line, which represents the count of elements.
  // Ensure to trim any whitespace from this specific line before conversion.
  const elementCount = Number(parsedLines[0].trim());

  // Process the second line:
  // 1. Trim whitespace.
  // 2. Split the string by spaces to get an array of string numbers.
  // 3. Convert each string number to an actual number using `map(Number)`.
  // 4. Sort the resulting array of numbers in descending order (largest to smallest).
  const sortedNumericValues = parsedLines[1].trim().split(' ').map(Number).sort((valueA, valueB) => valueB - valueA);

  // Initialize an accumulator variable to store the sum of selected elements.
  let accumulatedSum = 0;

  // Iterate through a specific range of the sorted array.
  // The loop starts from the second element (index 1) and goes up to (elementCount * 3) - 1.
  for (let currentIdx = 1; currentIdx < elementCount * 3; currentIdx++) {
    // Check if the current index is an even number.
    // This condition selects elements at indices 2, 4, 6, etc.
    if (currentIdx % 2 === 0) {
      // If the index is even, add the corresponding value from the sorted array
      // to our accumulated sum.
      accumulatedSum += sortedNumericValues[currentIdx];
    }
  }

  // Output the final calculated sum to the console.
  console.log(accumulatedSum);
}

// The entry point of the script:
// Read the entire content of standard input synchronously as a UTF-8 string,
// and then pass this raw string to our main processing function.
ProcessDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
