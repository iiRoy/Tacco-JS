// This script processes input data from standard input to perform a specific calculation.
// It identifies a pattern defined by the final line of the input and then sums
// numerical values from subsequent lines after the pattern is found.

/**
 * A utility function to safely read all content from standard input.
 * Encapsulates the file system operation for cleaner main logic.
 * @returns {string} The entire content read from stdin as a single string.
 */
function acquireStandardInputContent() {
  try {
    // Attempt to read synchronously from the standard input stream.
    // 'utf8' encoding ensures proper character handling.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (ioError) {
    // Log an error if reading fails, and return an empty string to allow graceful continuation
    // or indicate a problem to the calling function.
    console.error("Critical error: Unable to read input from standard device:", ioError.message);
    return ""; // Return an empty string in case of input acquisition failure.
  }
}

/**
 * Core function to process the raw input data string.
 * It parses line-by-line, searches for a specific pattern, and aggregates numerical data.
 * @param {string} rawInputContent - The complete string received from the input source.
 */
function executeDataTransformation(rawInputContent) {
  // Input validation: Ensure the received content is a non-empty string.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    console.warn("Received input is either empty, whitespace-only, or not a string. No processing performed.");
    return; // Halt execution if input is invalid.
  }

  // Split the raw input into an array of individual lines.
  // Using /\r?\n/ handles both Windows (CRLF) and Unix (LF) line endings.
  // Note: Empty lines are preserved, consistent with original behavior.
  const allInputLines = rawInputContent.split(/\r?\n/);

  // Preliminary check for minimum required lines: at least a count line and a pattern line.
  if (allInputLines.length < 2) {
    console.error("Input data contains insufficient lines. Expected at least two lines for processing.");
    return;
  }

  // Initialize a variable to accumulate the sum of numerical components.
  let aggregatedNumericValue = 0; // Using a number type, implicitly handles integers/floats.

  // A boolean flag to track whether the designated pattern has been identified.
  let patternMatchAchieved = false;

  // Extract the expected number of data lines from the very first line of input.
  // Use parseInt with radix 10 for explicit base conversion.
  const declaredLineCountString = allInputLines[0];
  const totalOperativeLines = parseInt(declaredLineCountString, 10);

  // Validate the parsed line count. It must be a non-negative integer.
  if (isNaN(totalOperativeLines) || totalOperativeLines < 0) {
    console.error(`Invalid line count specified ('${declaredLineCountString}') on the first line. Must be a non-negative integer.`);
    return;
  }

  // Identify the target pattern from the last line of the entire input array.
  const dynamicSearchPattern = allInputLines[allInputLines.length - 1];
  // Create a regular expression object from the pattern string for robust matching.
  const patternRegexObject = new RegExp(dynamicSearchPattern);

  // Begin iterating through the relevant data lines, starting from the second line (index 1).
  // The loop continues up to the `totalOperativeLines` declared in the first line.
  for (let currentIterationIndex = 1; currentIterationIndex <= totalOperativeLines; ++currentIterationIndex) {

    // Defensive check: Ensure the current index is within the bounds of the actual `allInputLines` array.
    if (currentIterationIndex >= allInputLines.length) {
      console.warn(`Warning: Attempted to access line index ${currentIterationIndex}, but only ${allInputLines.length} lines are available. Halting data processing.`);
      break; // Exit the loop if we run out of physical lines.
    }

    const currentDataLine = allInputLines[currentIterationIndex];

    // Process the line only if it's not empty or just whitespace.
    // This prevents errors when calling .match() or .split() on undefined/null.
    if (currentDataLine && currentDataLine.trim() !== '') {

      // If the pattern has not yet been found in previous iterations
      if (!patternMatchAchieved) {
        // Check if the current line matches the dynamic search pattern.
        if (currentDataLine.match(patternRegexObject)) {
          patternMatchAchieved = true; // Set the flag indicating the pattern was found.
          // According to the original logic, the line where the pattern is found
          // should not contribute to the sum. So, skip to the next iteration.
          continue;
        }
      }

      // If the pattern HAS been found (either in this iteration or a previous one),
      // then proceed to extract and sum the numerical component.
      if (patternMatchAchieved) {
        // Split the line by one or more whitespace characters to get individual components.
        const lineParts = currentDataLine.split(/\s+/);

        // Ensure there is a second component (at index 1) and that it's not empty.
        if (lineParts.length > 1 && lineParts[1].trim() !== '') {
          // Attempt to convert the second component into a floating-point number.
          const extractedNumericPart = parseFloat(lineParts[1]);

          // Verify that the conversion resulted in a valid number before adding to the sum.
          if (!isNaN(extractedNumericPart)) {
            aggregatedNumericValue = aggregatedNumericValue + extractedNumericPart;
          } else {
            // Optional debug message for skipped non-numeric values.
            console.debug(`Debug: Skipping non-numeric token '${lineParts[1]}' on line ${currentIterationIndex}.`);
          }
        } else {
          // Optional debug message for lines without a summable second component.
          console.debug(`Debug: Line ${currentIterationIndex} lacks a second component for summation.`);
        }
      }
    } else {
      // Optional debug message for skipped empty/whitespace-only lines.
      console.debug(`Debug: Skipping empty or whitespace-only line at index ${currentIterationIndex}.`);
    }
  }

  // Output the final computed result to standard output.
  console.log(aggregatedNumericValue);
}

// Initiate the entire process by first reading the input and then transforming the data.
executeDataTransformation(acquireStandardInputContent());