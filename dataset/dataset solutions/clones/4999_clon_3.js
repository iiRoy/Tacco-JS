function formatBinaryStringWithPadding(inputValString, desiredLength) {
  // Converts a value to string and pads it with leading zeros to a specific length.
  // This function replaces the manual string concatenation and slicing from the original.

  // Ensure the input value is treated as a string for padding operations.
  const stringifiedValue = String(inputValString);

  // Add a guard clause for invalid or non-positive desired lengths.
  // If desiredLength is 0, an empty string is returned.
  // If negative, the original string is returned as padding is illogical.
  if (desiredLength <= 0) {
    return desiredLength === 0 ? '' : stringifiedValue;
  }

  // Utilize String.prototype.padStart for an efficient and modern way
  // to add leading characters, replacing the explicit loop.
  return stringifiedValue.padStart(desiredLength, '0');
}

function processSubsetAverages(rawInputData) {
  // This function analyzes subsets of numbers to find how many have a specific average.
  // It is a heavily modified version of the original 'main' function.

  // Helper function for robust integer parsing, providing a default on failure.
  const safeParseInt = (valueString, fallback = 0) => {
    const parsedValue = parseInt(valueString, 10);
    return isNaN(parsedValue) ? fallback : parsedValue;
  };

  // Split the entire input string into an array of lines.
  const dataLines = rawInputData.trim().split('\n');

  // Implement validation for the minimum expected number of input lines.
  if (dataLines.length < 2) {
    console.error("Input processing error: Expected at least two lines of data, but fewer were provided.");
    return; // Terminate execution gracefully.
  }

  // Parse the first line to extract the total number of elements (N) and the target average (A).
  const primaryParameters = dataLines[0].split(' ');
  if (primaryParameters.length < 2) {
    console.error("Input processing error: First line is malformed; expecting two space-separated integers.");
    return;
  }
  const numElementsInSet = safeParseInt(primaryParameters[0]);
  const targetAverageValue = safeParseInt(primaryParameters[1]);

  // Parse the second line to get the array of numeric element values.
  const elementValuesArray = dataLines[1].split(' ').map(val => safeParseInt(val));

  // Add more extensive validation for the parsed input values.
  if (numElementsInSet <= 0) {
    console.error("Validation error: The number of elements (N) must be a positive integer.");
    return;
  }
  if (elementValuesArray.length !== numElementsInSet) {
    console.error(`Validation error: Declared number of elements (${numElementsInSet}) does not match the actual count of provided values (${elementValuesArray.length}). Aborting.`);
    return;
  }

  // Calculate the total number of potential non-empty subsets.
  // Using a bit shift (1 << N) is an optimized way to compute 2^N.
  const totalCombinationsToEvaluate = 1 << numElementsInSet;

  let successfulAverageMatches = 0; // Initialize a counter for subsets that meet the criteria.

  // Iterate through all possible non-empty subsets using a bitmask approach.
  // Each 'combinationIndex' from 1 to (2^N - 1) represents a unique subset.
  for (let combinationIndex = 1; combinationIndex < totalCombinationsToEvaluate; combinationIndex++) {
    // Convert the current combination's index into its binary string representation.
    // This binary string is then padded to ensure it has 'numElementsInSet' digits,
    // which effectively acts as a mask for selecting elements.
    const currentBinaryMask = formatBinaryStringWithPadding(combinationIndex.toString(2), numElementsInSet);

    let currentSubsetSum = 0;
    let currentSubsetMemberCount = 0;

    // Iterate through each potential element position based on 'numElementsInSet'.
    for (let elementPosition = 0; elementPosition < numElementsInSet; elementPosition++) {
      // If the character at the current 'elementPosition' in the binary mask is '1',
      // it signifies that the corresponding element from 'elementValuesArray' is included in this subset.
      if (currentBinaryMask[elementPosition] === '1') {
        currentSubsetSum += elementValuesArray[elementPosition];
        currentSubsetMemberCount++;
      }
    }

    // Crucial guard: Only calculate average if the subset is not empty.
    // (This condition is implicitly met since 'combinationIndex' starts from 1,
    // guaranteeing at least one '1' in 'currentBinaryMask' and thus currentSubsetMemberCount >= 1).
    if (currentSubsetMemberCount > 0) {
      const calculatedAverage = currentSubsetSum / currentSubsetMemberCount;

      // Compare the computed average with the 'targetAverageValue'.
      // Direct equality is used, assuming exact numerical matching is required.
      if (calculatedAverage === targetAverageValue) {
        successfulAverageMatches++; // Increment the counter if the average matches.
      }
    } else {
        // This 'else' block serves as a defensive programming fragment.
        // It theoretically should not be reached with the current loop conditions,
        // but helps in identifying unexpected states during development.
        console.warn(`Internal logic warning: An empty subset was detected for combination index ${combinationIndex}. This should not occur.`);
    }
  }

  // Output the final count of subsets whose average met the specified target.
  console.log(successfulAverageMatches);
}

// Self-executing anonymous function to handle the program's entry point and I/O.
(function executeApplication() {
  const fileSystemAccessor = require('fs');
  const standardInputFile = '/dev/stdin';
  const fileEncodingScheme = 'UTF-8';

  try {
    // Attempt to read all content from the standard input file.
    const inputContent = fileSystemAccessor.readFileSync(standardInputFile, fileEncodingScheme);
    // Pass the acquired content to the main processing logic.
    processSubsetAverages(inputContent);
  } catch (ioOperationError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`Critical I/O Error: Failed to read input from ${standardInputFile}. Details: ${ioOperationError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
  }
})();