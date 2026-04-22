const fileSystemModule = require("fs");

/**
 * Processes a designated input file, line by line, to determine the frequencies
 * of numbers contained within. It then identifies and logs all numbers
 * that appear with the highest frequency. Lines that are not valid, non-zero
 * finite numbers are deliberately skipped.
 *
 * @param {string} inputSourcePath - The filesystem path to the input data.
 * @returns {void} This function prints directly to standard output.
 */
function processNumericalDataForFrequencyAnalysis(inputSourcePath) {
  // A dynamic data structure (Map) is chosen to store the counts
  // for each unique numerical value encountered. Keys are the numbers,
  // and values represent their respective occurrence counts.
  const numericValueCounts = new Map();

  // This variable tracks the maximum frequency observed for any number
  // throughout the processing of the input file. It is initialized to zero.
  let maximumObservedFrequency = 0;

  try {
    // Attempt to read the entire content of the specified file synchronously.
    // The 'utf8' encoding ensures proper interpretation of text data.
    const rawFileContent = fileSystemModule.readFileSync(inputSourcePath, "utf8");

    // The entire file content is segmented into an array of strings,
    // where each string corresponds to a single line from the input.
    const contentLines = rawFileContent.split('\n');

    // Iterate over each line obtained from the input file.
    for (const currentLineFragment of contentLines) {
      // Convert the current line string into a numerical value.
      // The unary plus operator is a concise way to achieve this.
      const convertedNumericValue = +currentLineFragment;

      // Implement a robust validation check:
      // 1. Ensure the converted value is a finite number (not NaN, Infinity, -Infinity).
      // 2. Exclude the number zero, mirroring the original logic's implicit behavior.
      if (Number.isFinite(convertedNumericValue) && convertedNumericValue !== 0) {
        // Retrieve the existing count for this number from the map.
        // If the number has not been encountered before, its count is implicitly zero.
        const previousCount = numericValueCounts.get(convertedNumericValue) || 0;

        // Increment the count for the current numerical value.
        const updatedCount = previousCount + 1;
        // Store the new count back into the map.
        numericValueCounts.set(convertedNumericValue, updatedCount);

        // Compare the newly updated count with the highest frequency recorded so far.
        // If the current number's frequency is higher, update the maximum.
        if (updatedCount > maximumObservedFrequency) {
          maximumObservedFrequency = updatedCount;
        }
      }
    }

    // After processing all lines and populating the frequency map,
    // iterate through the map's entries to find numbers that share the peak frequency.
    for (const [numberIdentifier, totalOccurrences] of numericValueCounts.entries()) {
      // If a number's total occurrences match the maximum frequency found,
      // it means this number is one of the most frequently occurring.
      if (totalOccurrences === maximumObservedFrequency) {
        console.log(numberIdentifier); // Output the number itself to console.
      }
    }

  } catch (operationError) {
    // Capture and report any errors that may occur during file reading or processing.
    console.error(`An issue arose during file processing: ${operationError.message}`);
    // A non-zero exit code typically indicates an error condition.
    process.exit(1);
  }
}

// Define the standard input stream path as a constant for clarity and reusability.
const inputStandardStreamPath = "/dev/stdin";

// Invoke the primary function to begin the analysis using the specified input source.
processNumericalDataForFrequencyAnalysis(inputStandardStreamPath);