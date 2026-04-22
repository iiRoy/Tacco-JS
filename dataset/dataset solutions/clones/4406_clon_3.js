"use strict";

/**
 * Processes raw input data to identify consecutive duplicate numbers,
 * then calculates the product of the two largest distinct numbers
 * found among these duplicates. If insufficient duplicates are found,
 * the result is zero.
 * @param {string} rawInputContent - The raw string content obtained from standard input.
 */
const processInputData = (rawInputContent) => {
  // Step 1: Normalize and parse the input string into an array of lines.
  // This helps to separate configuration (like N, though unused) from data.
  const inputLines = rawInputContent.trim().split("\n");

  // Step 2: Implement a guard clause to handle cases where the input is malformed
  // or does not contain enough lines for the numeric data.
  if (inputLines.length < 2) {
    console.log(0); // If the second line (containing numbers) is missing, output 0.
    return;
  }

  // Step 3: Extract and convert the numeric data from the second line.
  // Using a more explicit loop for parsing and validation.
  const rawNumberStrings = inputLines[1].split(" ");
  const numericCollection = []; // Renamed from 'A' to improve clarity.

  for (const itemString of rawNumberStrings) {
    const parsedNumericValue = Number(itemString); // Use Number() for conversion.
    // Validate each parsed value to ensure it's a legitimate number.
    if (!isNaN(parsedNumericValue)) {
      numericCollection.push(parsedNumericValue);
    }
  }

  // Step 4: Sort the numeric values in ascending order.
  // This is crucial for easily identifying consecutive duplicates.
  numericCollection.sort((valueA, valueB) => valueA - valueB);

  // Step 5: Iterate through the sorted collection to find and store
  // numbers that appear consecutively.
  const identifiedConsecutiveDuplicates = []; // Renamed from 'pairNums'.

  // Loop up to the second-to-last element to safely check `currentIdx + 1`.
  for (let currentIdx = 0; currentIdx < numericCollection.length - 1; currentIdx++) {
    // If the current element is identical to the next one, record it.
    if (numericCollection[currentIdx] === numericCollection[currentIdx + 1]) {
      identifiedConsecutiveDuplicates.push(numericCollection[currentIdx]);
    }
  }

  // Step 6: Early exit if no consecutive duplicates were found.
  if (identifiedConsecutiveDuplicates.length === 0) {
      console.log(0);
      return;
  }

  // Step 7: Sort the identified duplicates in descending order.
  // This prepares them for easy extraction of the largest distinct values.
  identifiedConsecutiveDuplicates.sort((valueA, valueB) => valueB - valueA);

  // Step 8: Use a Set to extract only the unique values from the sorted duplicates.
  const distinctDuplicateValues = new Set(identifiedConsecutiveDuplicates);

  // Step 9: Convert the Set back into an array to enable indexed access.
  const uniqueValuesArray = Array.from(distinctDuplicateValues);

  let calculatedProduct = 0; // Initialize result, will be 0 if conditions aren't met.

  // Step 10: Check if there are at least two unique duplicate values available.
  // If so, calculate their product; otherwise, the result remains 0.
  if (uniqueValuesArray.length >= 2) {
    // Multiply the two largest unique values (which are at indices 0 and 1
    // because the distinct values were derived from a descending-sorted list).
    calculatedProduct = uniqueValuesArray[0] * uniqueValuesArray[1];
  }

  // Step 11: Output the final calculated product.
  console.log(calculatedProduct);
};

// Entry point: Read data from standard input and pass it to the processing function.
// This typically runs in environments like competitive programming platforms.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));