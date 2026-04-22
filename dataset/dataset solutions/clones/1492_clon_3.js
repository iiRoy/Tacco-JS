function ProcessInputData(sourceText) {
  // This function processes raw input text to perform sequence manipulation operations.
  // It reads initial configuration, then applies a series of digit replacement queries.

  // --- Type III: Deleting dead/erroneous code from original ---
  // The original code contained an early 'return;' statement and a 'console.log(n, a);'
  // with an undefined variable 'a', making the main logic unreachable and introducing an error.
  // These non-functional or erroneous parts have been removed.
  // The initial parsing of 'n' and 'q' was also redundant and has been streamlined.

  // Type III: Break down input processing into clearer, more robust steps.
  // Original: input = input.split("\n").map(v => v.split(" "));
  const inputLines = sourceText.trim().split("\n"); // Trim whitespace to handle potential leading/trailing newlines.

  // Type III: Add a guard clause for empty input to prevent errors.
  if (inputLines.length === 0) {
    console.error("Input data is empty. No operations can be performed.");
    return;
  }

  // Type III: Use a dedicated constant for the modulo value, improving readability and maintainability.
  const MODULO_CONSTANT_VALUE = 998244353;

  // Type II: Rename variables for clarity.
  // Type III: Introduce an intermediate step for parsing the first line's components.
  const headerParts = inputLines[0].split(" ");
  const sequenceLength = parseIntegerStrict(headerParts[0]); // Represents 'n' from original code
  const queryCount = parseIntegerStrict(headerParts[1]);     // Represents 'q' from original code

  // Type III: Add essential validation for parsed initial values.
  if (isNaN(sequenceLength) || sequenceLength <= 0 || isNaN(queryCount) || queryCount < 0) {
    console.error("Invalid sequence length or query count detected in the header line. Please check input format.");
    return;
  }

  // Type II: Rename 'str' to 'currentSequenceArray'.
  // Type III: Initialize the digit sequence using a more concise array method.
  // Original initialization was a loop and then split:
  //   let str = ""; for (let i = 0; i < n; i++) { str += "1"; } str = str.split("");
  let currentSequenceArray = Array(sequenceLength).fill('1'); // Creates an array of '1's directly.

  // Type III: Introduce a helper function to encapsulate the core sequence transformation logic.
  // This enhances modularity and readability.
  const applyDigitReplacementQuery = (sequenceToModify, startIdx, endIdx, replacementChar) => {
    // Type II: Rename parameters for better context.
    // Original logic: target = str.map((value, index) => { if (l <= index && index <= r) { return d; } return value; });
    const transformedSequence = sequenceToModify.map((elementValue, elementIndex) => {
      // Type III: Explicitly check if the current element's index falls within the specified range.
      if (elementIndex >= startIdx && elementIndex <= endIdx) {
        return replacementChar; // Replace with the new character.
      }
      return elementValue; // Keep the original character.
    });
    return transformedSequence;
  };

  // Type II: Rename loop counter from 'i' to 'queryIdx'.
  // Type III: Extract query lines by slicing the input array, avoiding the header line.
  const operationalQueryLines = inputLines.slice(1);

  // Type III: Add a warning if the number of provided query lines does not match the declared query count.
  if (operationalQueryLines.length < queryCount) {
      console.warn(`Warning: Expected ${queryCount} queries but found only ${operationalQueryLines.length}. Processing available queries.`);
  }

  // Type III: Iterate through the specific query lines directly.
  for (let queryIdx = 0; queryIdx < operationalQueryLines.length; ++queryIdx) {
    const individualQueryData = operationalQueryLines[queryIdx].split(" ");

    // Type III: Add validation for the structure of each query line.
    if (individualQueryData.length < 3) {
        console.error(`Skipping malformed query line ${queryIdx + 1}: "${operationalQueryLines[queryIdx]}". Insufficient parameters.`);
        continue;
    }

    // Type II: Rename 'l', 'r', 'd'.
    // Type III: Convert boundary values to 0-indexed immediately and perform validation.
    const leftBoundaryIndex = parseIntegerStrict(individualQueryData[0]) - 1; // Original 'l'
    const rightBoundaryIndex = parseIntegerStrict(individualQueryData[1]) - 1; // Original 'r'
    const replacementDigitCharacter = individualQueryData[2];                 // Original 'd' (kept as string, as it's a digit char)

    // Type III: Add robust boundary checks for query parameters.
    if (isNaN(leftBoundaryIndex) || isNaN(rightBoundaryIndex) ||
        leftBoundaryIndex < 0 || rightBoundaryIndex >= sequenceLength ||
        leftBoundaryIndex > rightBoundaryIndex) {
        console.warn(`Invalid or out-of-bounds query boundaries in line ${queryIdx + 1}. Skipping this query.`);
        continue;
    }

    // Type III: Utilize the previously defined helper function for clarity.
    let temporaryModifiedSequence = applyDigitReplacementQuery(
      currentSequenceArray,
      leftBoundaryIndex,
      rightBoundaryIndex,
      replacementDigitCharacter
    );

    // Type III: Introduce an intermediate step for joining the array before numeric parsing.
    const joinedSequenceAsString = temporaryModifiedSequence.join('');
    const numericalResult = parseIntegerStrict(joinedSequenceAsString);

    // Type III: Add a check for potential parsing failures for the sequence string.
    if (isNaN(numericalResult)) {
        console.error(`Failed to parse a numeric value from the sequence "${joinedSequenceAsString}". Skipping result for this query.`);
        continue;
    }

    // Type II: Use the defined constant for modulo.
    // Type III: Apply a common pattern for ensuring a positive result after the modulo operation,
    // especially useful if intermediate results could be negative (though not strictly needed here).
    const finalModuloOutput = (numericalResult % MODULO_CONSTANT_VALUE + MODULO_CONSTANT_VALUE) % MODULO_CONSTANT_VALUE;
    console.log(finalModuloOutput);
  }
}

// Type II: Rename 'toInt' to 'parseIntegerStrict' for more descriptive naming.
// Type III: Add explicit radix for safety and potentially more robust error handling.
function parseIntegerStrict(stringValue) {
  // Utility function to convert a string to an integer, ensuring base 10.
  // Original comment: //return BigInt(v); (commented out in original, so functionality remains parseInt)
  // Original: return parseInt(v, 10);
  const parsedValue = parseInt(stringValue, 10);

  // Type III: Optionally, add a check for non-numeric input for debugging or stricter behavior.
  if (isNaN(parsedValue)) {
      // console.debug(`Debug: Attempted to parse non-numeric string: "${stringValue}". Returning NaN as per parseInt behavior.`);
      // Depending on the desired strictness, one might throw an error here.
  }
  return parsedValue;
}

// Type II: Rename the main function call.
// Type III: Encapsulate the file reading operation within a try-catch block for robust error handling.
try {
  const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  ProcessInputData(fileInputContent);
} catch (executionError) {
  console.error("An error occurred during input processing or file reading:", executionError.message);
  // Further error handling could include logging to a file or exiting with a specific code.
}