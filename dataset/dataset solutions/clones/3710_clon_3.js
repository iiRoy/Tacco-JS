/*
 * This JavaScript module processes a sequence of numerical inputs to calculate
 * a specific deviation metric. It reads data from standard input, performs
 * transformations, sorts intermediate results, determines a central value,
 * and then computes a final aggregate score based on absolute differences.
 */
(function () {
  // Enforce strict mode for cleaner and safer code execution within this scope.
  "use strict";

  /**
   * Transforms an array of string-represented numerical values.
   * Each value is converted to a number, and then its 1-based ordinal position
   * is subtracted from it. This function ensures robustness by handling
   * non-array or empty inputs gracefully.
   *
   * @param {string[]} rawValueStrings - An array where each element is a string
   *   expected to represent a number.
   * @returns {number[]} A new array containing the numerically adjusted values.
   *   Returns an empty array if the input is invalid or empty.
   */
  const adjustNumericValues = (rawValueStrings) => {
    // Validate the input to ensure it's an array and not empty.
    if (!Array.isArray(rawValueStrings) || rawValueStrings.length === 0) {
      return []; // Return an empty array if input is not suitable.
    }

    const collectionOfAdjustedNumbers = []; // Storage for the results.
    let currentOrdinalPosition = 0; // Initialize a 0-based counter for positions.

    // Iterate over each string value in the provided array.
    for (const stringItem of rawValueStrings) {
      // Convert the string to its numerical representation.
      // Number() is used for a broader conversion than parseInt(),
      // handling both integers and floats implicitly.
      const numericalRepresentation = Number(stringItem);

      // Calculate the final adjusted value by subtracting (index + 1).
      // This corresponds to subtracting the 1-based position.
      const transformedValue = numericalRepresentation - (currentOrdinalPosition + 1);

      // Add the calculated value to our results collection.
      collectionOfAdjustedNumbers.push(transformedValue);

      currentOrdinalPosition++; // Advance the position counter.
    }

    return collectionOfAdjustedNumbers; // Deliver the array of adjusted numbers.
  };

  /**
   * Computes the total absolute deviation for a given sequence of numbers
   * against a `centralPointValue`, considering each element's original position.
   * This function effectively calculates a 'sadness' metric.
   *
   * @param {string[]} originalValueStrings - The initial array of string numbers
   *   (used to re-parse values for deviation calculation).
   * @param {number} centralPointValue - The reference median value against which
   *   deviations are measured.
   * @returns {number} The sum of all absolute deviations. Returns `NaN` if
   *   `centralPointValue` is invalid or if any original string cannot be parsed.
   */
  const calculateDiscrepancySum = (originalValueStrings, centralPointValue) => {
    let accumulatedAbsoluteDifference = 0; // Accumulator for the total deviation.

    // Guard clause: If the central point is not a valid number,
    // subsequent calculations would be meaningless, propagating NaN.
    if (isNaN(centralPointValue)) {
      return NaN;
    }

    // Iterate through the original string values using a traditional for loop
    // to access both the value and its index.
    for (let currentPosition = 0; currentPosition < originalValueStrings.length; currentPosition++) {
      const currentStringElement = originalValueStrings[currentPosition];
      // Convert the current string element back to a number.
      const currentNumericElement = Number(currentStringElement);

      // Determine the target value for the current position:
      // centralPointValue plus its 1-based index.
      const targetReference = centralPointValue + (currentPosition + 1);

      // Calculate the absolute difference between the current numeric element
      // and its computed target reference.
      const individualDifference = Math.abs(currentNumericElement - targetReference);

      // Add this individual difference to the running total.
      accumulatedAbsoluteDifference += individualDifference;
    }

    return accumulatedAbsoluteDifference; // The final sum of discrepancies.
  };

  // --- Core Application Logic ---

  // Define the standard input file path.
  const standardInputFilePath = "/dev/stdin";
  // Import the Node.js File System module.
  const fileSystemModule = require("fs");

  // Read all content from standard input synchronously,
  // decode it as UTF-8, split it into an array of lines,
  // and filter out any empty lines that might occur.
  const rawInputLines = fileSystemModule
    .readFileSync(standardInputFilePath, "utf8")
    .split("\n")
    .filter((lineSegment) => lineSegment.trim() !== "");

  // Initial validation: Ensure at least two lines of input are present.
  if (rawInputLines.length < 2) {
    process.stderr.write("Error: Expected at least two lines of input (count and data).\n");
    process.exit(1); // Terminate with an error code.
  }

  // Parse the total count of elements from the first line.
  const declaredElementCount = Number(rawInputLines[0]);

  // Validate the parsed count: must be a positive integer.
  if (isNaN(declaredElementCount) || declaredElementCount <= 0 || !Number.isInteger(declaredElementCount)) {
    process.stderr.write("Error: The first line must contain a positive integer for element count.\n");
    process.exit(1);
  }

  // Parse the second line, which contains space-separated numbers.
  // Split by one or more whitespace characters and filter out any resulting empty strings.
  const originalNumericStringList = rawInputLines[1].split(/\s+/).filter(Boolean);

  // Optional warning: Check if the declared count matches the actual number of elements.
  // The original problem uses the declared count for median index, so we'll stick to that.
  if (originalNumericStringList.length !== declaredElementCount) {
    process.stderr.write(
      `Warning: Declared element count (${declaredElementCount}) does not match ` +
        `actual number of elements provided (${originalNumericStringList.length}). ` +
        `Proceeding with declared count for median index calculation.\n`
    );
  }

  // Apply the first transformation to the list of numbers.
  const modifiedNumericSequence = adjustNumericValues(originalNumericStringList);

  // Critical check: Ensure the transformation yielded valid results.
  if (modifiedNumericSequence.length === 0) {
    process.stderr.write("Error: The input data could not be processed into a valid numeric sequence.\n");
    process.exit(1);
  }

  // Sort the modified sequence in ascending numerical order.
  modifiedNumericSequence.sort((valX, valY) => valX - valY);

  // Calculate the index for the median element.
  // Using bitwise NOT twice (~~) is a common, fast way to perform Math.floor for positive numbers.
  const medianElementIndex = ~~(declaredElementCount / 2);

  // Retrieve the median value from the sorted, modified list.
  // Include a boundary check for robustness, although usually
  // `medianElementIndex` should be valid if `declaredElementCount` is positive.
  let medianCalculatedValue;
  if (medianElementIndex >= 0 && medianElementIndex < modifiedNumericSequence.length) {
    medianCalculatedValue = modifiedNumericSequence[medianElementIndex];
  } else {
    process.stderr.write("Error: Unable to determine a valid median value from the processed list.\n");
    process.exit(1);
  }

  // Calculate the final deviation score using the original input and the determined median.
  const finalDeviationScore = calculateDiscrepancySum(originalNumericStringList, medianCalculatedValue);

  // Output the computed score to standard output, followed by a newline.
  // Using process.stdout.write for a slight variation from console.log.
  process.stdout.write(finalDeviationScore.toString() + "\n");
})();