const fileOperations = require('fs'); // Access the Node.js file system module.

/**
 * Retrieves the content of a file from the specified path.
 * Includes basic error handling for file access.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 string.
 */
const retrieveFileContents = (filePath) => {
  try {
    // Synchronously read the file, ensuring it's interpreted as UTF-8 text.
    return fileOperations.readFileSync(filePath, 'utf8');
  } catch (readError) {
    // Log an error message if file reading fails and terminate execution.
    console.error(`Error encountered while accessing input data: ${readError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate an error.
  }
};

/**
 * Concatenates two string representations of numbers and converts the result to a single numeric value.
 * This function explicitly replicates the original code's behavior of string concatenation
 * followed by numerical conversion (e.g., "10" + "20" becomes 1020).
 * @param {string} firstString - The first string to concatenate.
 * @param {string} secondString - The second string to concatenate.
 * @returns {number} The numerical representation of the concatenated string.
 */
const createCombinedNumber = (firstString, secondString) => {
  // Perform string concatenation, then convert the combined string to a number.
  return Number(firstString + secondString);
};

// Main execution wrapper function to encapsulate logic and variables.
(function processNumericalCombinations() {
  // Define the standard input path.
  const standardInputPath = '/dev/stdin';

  // Obtain the raw content from the specified input source.
  let rawInputContent = retrieveFileContents(standardInputPath);

  // Validate that the input content is not empty or just whitespace.
  if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("No valid input data detected. Please provide content for processing.");
    process.exit(1);
  }

  // Split the input into individual lines, removing any leading/trailing whitespace from the overall input.
  let dataLines = rawInputContent.trim().split('\n');

  // Extract the declared count of numerical items from the very first line.
  // Use parseInt with a radix of 10 for explicit base conversion.
  const declaredItemCount = parseInt(dataLines.shift(), 10);

  // Perform validation on the declared item count.
  if (isNaN(declaredItemCount) || declaredItemCount < 0) {
    console.error("The initial line must specify a non-negative integer for the item count.");
    process.exit(1);
  }

  // Ensure there are at least two items to form pairs.
  if (declaredItemCount < 2) {
    console.log("Insufficient number of items provided to form pairs. At least two items are required.");
    process.exit(0); // Graceful exit if no pairs can be formed.
  }

  // Array to store all the generated concatenated numerical results.
  let derivedValues = [];

  // Iterate through potential pairs of numbers based on the declared count.
  // Note: If 'declaredItemCount' is greater than the actual number of lines,
  // 'dataLines[index]' will be 'undefined', leading to 'NaN' results,
  // which mimics the original code's behavior in such edge cases.
  for (let outerLoopIndex = 0; outerLoopIndex < declaredItemCount; outerLoopIndex++) {
    for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < declaredItemCount; innerLoopIndex++) {
      // Generate and store the concatenated number for the pair (A, B).
      derivedValues.push(createCombinedNumber(dataLines[outerLoopIndex], dataLines[innerLoopIndex]));
      // Generate and store the concatenated number for the reversed pair (B, A).
      derivedValues.push(createCombinedNumber(dataLines[innerLoopIndex], dataLines[outerLoopIndex]));
    }
  }

  // Sort the array of derived numerical values in ascending order.
  // The comparison function (a - b) ensures proper numerical sorting.
  derivedValues.sort((firstVal, secondVal) => firstVal - secondVal);

  // Check if there are enough generated values to retrieve the third smallest element (index 2).
  const targetRankIndex = 2; // Represents the third smallest (0-indexed).
  if (derivedValues.length <= targetRankIndex) {
    console.log(`Only ${derivedValues.length} combined numerical values were generated. Cannot retrieve the element at rank ${targetRankIndex + 1}.`);
    process.exit(1);
  }

  // Output the third smallest concatenated numerical value to the console.
  const resultToDisplay = derivedValues[targetRankIndex];
  console.log(resultToDisplay);

})(); // Immediately invoke the function.