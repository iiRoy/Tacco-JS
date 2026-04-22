// Function responsible for analyzing a given text sequence to determine
// the count of character discrepancies required for it to become a palindrome.
// It achieves this by comparing characters symmetrically from the string's ends inwards.
function evaluateStringSymmetry(sourceText) {
  // Perform an initial validation check on the input.
  // If the input is not a string, or if its length is insufficient for meaningful comparison (less than 2 characters),
  // we immediately return 0, indicating no discrepancies.
  if (typeof sourceText !== 'string' || sourceText.length < 2) {
    return 0;
  }

  // Cache the full length of the input string for efficiency in calculations.
  const textLength = sourceText.length;
  // Initialize a mutable counter to track the total number of non-matching character pairs.
  let discrepancyCount = 0;

  // Determine the central point up to which character comparisons are necessary.
  // We only need to iterate through the first half of the string's indices.
  // For strings with an odd length, the very middle character does not have a symmetric pair
  // and thus does not participate in the comparison, so Math.floor is appropriate.
  const comparisonBoundary = Math.floor(textLength / 2);

  // Begin iterating from the start of the string, moving towards the center.
  // 'leftCursor' represents the index of the character in the first half.
  for (let leftCursor = 0; leftCursor < comparisonBoundary; leftCursor++) {
    // Calculate the corresponding index for the character symmetrically positioned
    // from the end of the string, relative to the 'leftCursor'.
    const rightCursor = textLength - 1 - leftCursor;

    // Extract the characters at both the left and right cursor positions.
    const charFromLeft = sourceText[leftCursor];
    const charFromRight = sourceText[rightCursor];

    // Compare the two characters. If they are not identical,
    // it signifies a divergence from perfect symmetry, so increment the counter.
    if (charFromLeft !== charFromRight) {
      discrepancyCount++;
    }
  }

  // After all symmetric pairs have been evaluated, return the accumulated total
  // of character mismatches.
  return discrepancyCount;
}

// --- Application Entry Point and Input Handling ---

// A dedicated helper function to abstract away the details of reading input
// from a file path, ensuring the core logic remains clean and focused.
const acquireInputData = (inputFilePath) => {
  try {
    // Utilize Node.js's built-in file system module to synchronously read
    // the content of the specified file. The 'utf8' encoding is crucial
    // for correct character interpretation, and .trim() removes any
    // leading/trailing whitespace, including newlines.
    const fileContent = require("fs").readFileSync(inputFilePath, "utf8");
    return fileContent.trim();
  } catch (error) {
    // If any error occurs during file reading (e.g., file not found, permission issues),
    // log the error message to standard error and return an empty string.
    // Returning an empty string allows the main processing logic to handle an empty input gracefully.
    console.error(`Error: Failed to read input from ${inputFilePath}. Details: ${error.message}`);
    return "";
  }
};

// Define the typical path for standard input in a Unix-like environment,
// which is commonly used in competitive programming platforms.
const standardInputPath = "/dev/stdin";

// Read the raw string data from the designated standard input source.
const rawInputString = acquireInputData(standardInputPath);

// Invoke the core symmetry evaluation function with the obtained input string.
// The result is the total count of characters that would need to be changed
// to make the string a palindrome.
const totalSymmetryDivergence = evaluateStringSymmetry(rawInputString);

// Output the final computed result to the standard console.
// This step is kept separate from the `evaluateStringSymmetry` function
// to maintain its purity and reusability.
console.log(totalSymmetryDivergence);