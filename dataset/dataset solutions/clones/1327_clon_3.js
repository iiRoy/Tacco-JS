'use strict';
// This module processes textual input from a specified file path.
// It identifies distinct data segments, applies a series of cyclic string shifts
// based on numerical parameters within each segment, and outputs the transformed data.

/**
 * Main function to orchestrate the input processing and string manipulation.
 * It reads content from a file, parses it into structured blocks,
 * applies string rotation logic based on parsed numbers, and prints the final result.
 * @param {string} inputSourcePath - The file path from which to read the input data.
 */
(function executeDataTransformation(inputSourcePath) {
  let rawDataContent; // Variable to hold the entire content read from the input stream.
  const lineDelimiter = '\n'; // Standard newline character used for splitting lines.
  const debugShiftPrefix = 'Shift applied: '; // Prefix for console messages indicating a shift operation.

  try {
    // Attempt to read the entire file synchronously using Node.js 'fs' module.
    rawDataContent = require('fs').readFileSync(inputSourcePath, 'utf8');
  } catch (fileReadError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // log the error and terminate the process gracefully.
    console.error(`ERROR: Failed to read input from '${inputSourcePath}': ${fileReadError.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
  }

  // Early exit if the input content is empty or consists only of whitespace.
  if (!rawDataContent || rawDataContent.trim().length === 0) {
    console.warn('WARNING: Input file is empty or contains no significant data. No processing performed.');
    console.log(''); // Output an empty line for consistent formatting.
    return; // Terminate execution of this function.
  }

  // Define the regular expression to identify valid data blocks within the input.
  // A block starts with one or more alphabetical characters, followed by a newline,
  // then one or more lines, each containing a positive integer (no leading zeros),
  // terminated by a newline. The 'g' flag ensures all matches are found.
  const dataBlockMatcher = /[A-Za-z]+\n([1-9][0-9]*\n)+/g;

  const processedOutputSegments = []; // An array to store the final rotated string for each valid block.
  let currentBlockMatch; // Stores the result object from each successful regex execution.

  // Loop through the input content, finding and processing each data block.
  // The `exec()` method on a regex with the 'g' flag maintains its lastIndex,
  // allowing sequential iteration through all matches.
  while ((currentBlockMatch = dataBlockMatcher.exec(rawDataContent)) !== null) {
    // Extract the full matched text for the current data block.
    const completeBlockText = currentBlockMatch[0];

    // Split the block into individual lines, trimming whitespace from the start/end of the block text.
    const blockLinesArray = completeBlockText.trim().split(lineDelimiter);

    // Validate the structure of the current block. A valid block must have at least
    // a header string and at least one number line (the count indicator).
    if (blockLinesArray.length < 2) {
      console.warn(`SKIP: Malformed data block encountered (too few lines): "${completeBlockText.substring(0, 40)}..."`);
      continue; // Skip this block and proceed to the next match.
    }

    const initialRotationSubject = blockLinesArray[0]; // The string that will undergo rotations.
    const rotationCountString = blockLinesArray[1]; // The string representation of how many numbers to use for shifting.

    // Parse the rotation count indicator to an integer.
    const numShiftValuesToExtract = parseInt(rotationCountString, 10);

    // Validate the parsed rotation count. It must be a positive integer.
    if (isNaN(numShiftValuesToExtract) || numShiftValuesToExtract < 1) {
      console.warn(`SKIP: Block for "${initialRotationSubject}" has an invalid shift count indicator: "${rotationCountString}".`);
      continue; // Skip this block.
    }

    // The original logic dictates that the *last* 'numShiftValuesToExtract' numbers
    // from the rest of the block are used for rotation.
    // First, get all lines after the initial string and the count indicator.
    const potentialShiftValueLines = blockLinesArray.slice(2);

    // Check if there are enough shift values as indicated.
    if (potentialShiftValueLines.length < numShiftValuesToExtract) {
      console.warn(`NOTE: Block for "${initialRotationSubject}" specified ${numShiftValuesToExtract} shifts, but only ${potentialShiftValueLines.length} values are present. Using available values.`);
      // The `slice(-numShiftValuesToExtract)` below handles this gracefully,
      // effectively using all available values if `numShiftValuesToExtract` is larger.
    }

    // Extract the actual numbers to be used for shifting from the end of the potential list.
    const effectiveShiftValueStrings = potentialShiftValueLines.slice(-numShiftValuesToExtract);

    const parsedShiftAmounts = []; // Array to hold validated integer shift amounts.
    for (const shiftStr of effectiveShiftValueStrings) {
      const currentShiftAmount = parseInt(shiftStr, 10);
      // Validate each individual shift amount to ensure it's a non-negative integer.
      if (!isNaN(currentShiftAmount) && currentShiftAmount >= 0) {
        parsedShiftAmounts.push(currentShiftAmount);
      } else {
        console.warn(`WARN: Invalid or negative shift value "${shiftStr}" found for block "${initialRotationSubject}". Skipping this shift.`);
      }
    }

    let currentTransformedString = initialRotationSubject; // Initialize the string for this block.

    // Apply each parsed shift amount sequentially to the string.
    for (const individualShift of parsedShiftAmounts) {
      // Log the shift amount for debugging or detailed output, as per original's `console.log(num)`.
      console.log(debugShiftPrefix + individualShift);

      // Perform a cyclic right rotation of the string.
      // If 'individualShift' is greater than the string's length, JavaScript's `slice`
      // behavior results in effectively rotating by the string's length, returning the original string.
      // This matches the original code's implicit behavior.
      const partFromIndex = currentTransformedString.slice(individualShift);
      const partToIndex = currentTransformedString.slice(0, individualShift);
      currentTransformedString = partFromIndex + partToIndex;
    }
    processedOutputSegments.push(currentTransformedString); // Add the final rotated string to the results.
  }

  // Join all the individually processed (rotated) strings with newline characters
  // and print the complete final output to the console.
  const finalAggregatedOutput = processedOutputSegments.join(lineDelimiter);
  console.log(finalAggregatedOutput);

// The input path is now configurable. It can be passed as a command-line argument (process.argv[2]),
// or it defaults to '/dev/stdin' for standard input compatibility on Unix-like systems.
}(require('process').argv[2] || '/dev/stdin'));